/**
 * DeepSeek 流式调用工具
 * 通过 Supabase Edge Function 代理 DeepSeek API
 */

const EDGE_FUNCTION_URL =
  'https://backend.appmiaoda.com/projects/supabase290412401096962048/functions/v1/deepseek-chat';

const ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoyMDg4NjY2OTEyLCJpc3MiOiJzdXBhYmFzZSIsInJvbGUiOiJhbm9uIiwic3ViIjoiYW5vbiJ9.FEaX8KFrqQSccYu6Dk5nZ-D-YYS7OSH_A4v5YyfaeXQ';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface StreamCallbacks {
  onChunk: (text: string) => void;
  onDone: () => void;
  onError: (err: string) => void;
}

/**
 * 流式调用 DeepSeek（SSE）
 */
export async function streamDeepSeek(
  messages: ChatMessage[],
  callbacks: StreamCallbacks,
  systemPrompt?: string,
  signal?: AbortSignal
) {
  try {
    const res = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ANON_KEY}`,
      },
      body: JSON.stringify({ messages, systemPrompt, stream: true }),
      signal,
    });

    if (!res.ok || !res.body) {
      const text = await res.text();
      callbacks.onError(`请求失败: ${text}`);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === 'data: [DONE]') continue;
        if (!trimmed.startsWith('data: ')) continue;

        try {
          const json = JSON.parse(trimmed.slice(6));
          const delta = json.choices?.[0]?.delta?.content;
          if (delta) callbacks.onChunk(delta);
        } catch {
          // 忽略解析失败的行
        }
      }
    }
    callbacks.onDone();
  } catch (err: any) {
    if (err.name === 'AbortError') return;
    callbacks.onError(err.message || '网络错误');
  }
}

/**
 * 非流式调用 DeepSeek（一次性返回）
 */
export async function callDeepSeek(
  messages: ChatMessage[],
  systemPrompt?: string
): Promise<string> {
  const res = await fetch(EDGE_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ANON_KEY}`,
    },
    body: JSON.stringify({ messages, systemPrompt, stream: false }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`AI请求失败: ${text}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
}
