// 平台LLM网关统一调用：兼容 JSON 与 SSE 流式两种响应格式
export async function callGateway(
  gatewayUrl: string,
  apiKey: string,
  messages: any[],
): Promise<string> {
  const response = await fetch(gatewayUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Gateway-Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      messages,
      enable_thinking: false,
      stream: false,
    }),
  });

  if (!response.ok) {
    let upstreamBody: any = null;
    try { upstreamBody = JSON.parse(await response.text()); } catch { /* 非 JSON */ }
    const msg = upstreamBody?.msg || `AI 接口调用失败: ${response.status}`;
    throw new Error(msg);
  }

  const rawText = await response.text();
  if (rawText.trimStart().startsWith('data:')) {
    // SSE 流式：拼接所有 data: 行的 content 片段
    let out = '';
    for (const line of rawText.split('\n')) {
      const t = line.trim();
      if (!t.startsWith('data:')) continue;
      const payload = t.slice(5).trim();
      if (!payload || payload === '[DONE]') continue;
      try {
        const j = JSON.parse(payload);
        out += j.choices?.[0]?.delta?.content || j.choices?.[0]?.message?.content || '';
      } catch { /* 忽略坏行 */ }
    }
    return out;
  }
  try {
    const j = JSON.parse(rawText);
    return j.choices?.[0]?.message?.content || '';
  } catch {
    return rawText;
  }
}
