import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  try {
    const { messages, systemPrompt, stream = true } = await req.json();

    const apiKey = Deno.env.get("DEEPSEEK_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "DEEPSEEK_API_KEY 未配置" }),
        { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    const systemMessage = systemPrompt
      ? [{ role: "system", content: systemPrompt }]
      : [{
          role: "system",
          content: `你是"芒小橘"，芒得很职AI能力评估与个性化学习中心的专属AI助手。
你的知识库已接入90道真实行业标准题，涵盖前端、后端、数据分析、人工智能、产品经理、运营等方向。
你的职责是：1）基于行业标准为学员提供精准的实训答疑；2）通过苏格拉底式追问引导学员深度思考；3）根据学员的能力雷达图给出个性化的学习路径建议。
回答时请使用Markdown格式，注意逻辑清晰、重点突出。严禁输出与学习和能力评估无关的内容。`
        }];

    const allMessages = [...systemMessage, ...messages];

    const deepseekRes = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: allMessages,
        stream: stream,
        max_tokens: 2048,
        temperature: 0.7,
      }),
    });

    if (!deepseekRes.ok) {
      const errText = await deepseekRes.text();
      return new Response(
        JSON.stringify({ error: `DeepSeek API错误: ${errText}` }),
        { status: deepseekRes.status, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    if (!stream) {
      const data = await deepseekRes.json();
      return new Response(JSON.stringify(data), {
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    // 流式转发
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    (async () => {
      const reader = deepseekRes.body!.getReader();
      const decoder = new TextDecoder();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          await writer.write(encoder.encode(chunk));
        }
      } finally {
        await writer.close();
      }
    })();

    return new Response(readable, {
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "服务器内部错误" }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
});
