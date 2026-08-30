import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { withMonitor } from "../_shared/logger.ts";

serve(withMonitor("baidu-ai-search", async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  // --- 解析客户端请求 ---
  let messages: Array<{ role: string; content: string }>;
  let instruction: string | undefined;
  let enableDeepSearch: boolean | undefined;
  let resourceTypeFilter: Array<{ type: string; top_k: number }> | undefined;
  let searchRecencyFilter: string | undefined;
  let enableReasoning: boolean | undefined;
  let maxCompletionTokens: number | undefined;
  let responseFormat: string | undefined;
  let enableFollowupQueries: boolean | undefined;

  try {
    const body = await req.json();
    messages = body.messages;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new Error("Missing or invalid messages");
    }
    instruction = body.instruction;
    enableDeepSearch = body.enable_deep_search;
    resourceTypeFilter = body.resource_type_filter;
    searchRecencyFilter = body.search_recency_filter;
    enableReasoning = body.enable_reasoning;
    maxCompletionTokens = body.max_completion_tokens;
    responseFormat = body.response_format;
    enableFollowupQueries = body.enable_followup_queries;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // --- 注入平台密钥（严禁暴露给前端） ---
  const apiKey = Deno.env.get("INTEGRATIONS_API_KEY");
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Server configuration error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // --- 构建上游请求体（剔除 undefined 字段） ---
  const upstreamBody: Record<string, unknown> = { messages };
  if (instruction !== undefined) upstreamBody.instruction = instruction;
  if (enableDeepSearch !== undefined) upstreamBody.enable_deep_search = enableDeepSearch;
  if (resourceTypeFilter !== undefined) upstreamBody.resource_type_filter = resourceTypeFilter;
  if (searchRecencyFilter !== undefined) upstreamBody.search_recency_filter = searchRecencyFilter;
  if (enableReasoning !== undefined) upstreamBody.enable_reasoning = enableReasoning;
  if (maxCompletionTokens !== undefined) upstreamBody.max_completion_tokens = maxCompletionTokens;
  if (responseFormat !== undefined) upstreamBody.response_format = responseFormat;
  if (enableFollowupQueries !== undefined) upstreamBody.enable_followup_queries = enableFollowupQueries;

  // --- 调用上游（SSE 流式） ---
  const upstream = await fetch(
    "https://app-a7lm1eejtypt-api-DYJwo27V8Qya-gateway.appmiaoda.com/v2/ai_search/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Gateway-Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(upstreamBody),
    }
  );

  // 透传配额/余额错误
  if (upstream.status === 429 || upstream.status === 402) {
    const errText = await upstream.text();
    return new Response(errText, {
      status: upstream.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!upstream.ok || !upstream.body) {
    let upstreamBody: any = null;
    try {
      upstreamBody = JSON.parse(await upstream.text());
    } catch {
      // 非 JSON 响应
    }
    const msg = upstreamBody?.msg || `Upstream error: ${upstream.status}`;
    // 流式接口必须返回非 2xx，前端 SSE hook 才会触发 onError
    return new Response(JSON.stringify({ error: msg }), {
      status: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // --- 转换上游 SSE 格式为前端期望的格式 ---
  // 上游格式: {"choices":[{"delta":{"content":"..."}}], "references":[...]}
  // 前端期望: {"type":"answer","content":"..."} / {"type":"references","references":[...]}
  const responseHeaders = new Headers(corsHeaders);
  responseHeaders.set("Content-Type", "text/event-stream");
  responseHeaders.set("Cache-Control", "no-cache");
  responseHeaders.set("X-Content-Type-Options", "nosniff");

  const transformedStream = new ReadableStream({
    async start(controller) {
      const reader = upstream.body!.getReader();
      const decoder = new TextDecoder("utf8");
      let buffer = "";
      let referencesSent = false;

      const flush = () => {
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const payload = trimmed.slice(5).trim();
          if (!payload || payload === "[DONE]") continue;
          try {
            const obj = JSON.parse(payload);
            // 提取回答内容
            const content = obj?.choices?.[0]?.delta?.content;
            if (typeof content === "string" && content.length > 0) {
              controller.enqueue(
                new TextEncoder().encode(`data: ${JSON.stringify({ type: "answer", content })}\n\n`)
              );
            }
            // 提取引用（仅发送一次）
            if (Array.isArray(obj?.references) && obj.references.length > 0 && !referencesSent) {
              referencesSent = true;
              controller.enqueue(
                new TextEncoder().encode(`data: ${JSON.stringify({ type: "references", references: obj.references })}\n\n`)
              );
            }
          } catch {
            // 忽略无法解析的块
          }
        }
      };

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            flush();
            controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
            controller.close();
            return;
          }
          buffer += decoder.decode(value, { stream: true });
          flush();
        }
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return new Response(transformedStream, {
    headers: responseHeaders,
  });
}));