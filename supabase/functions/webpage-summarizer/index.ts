import { withMonitor } from "../_shared/logger.ts";

const UPSTREAM_URL =
  "https://app-e2nysotcr1fl-api-DY8MNXjBpKAa-gateway.appmiaoda.com/v2/components/c-wf-e1bc471f-1d33-4df1-ab42-87800e89c1ad";

/**
 * 网页内容总结 Edge Function
 * 调用千帆网页内容总结组件，对单个网页生成摘要与核心要点。
 */
async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  let sysOriginQuery: string;
  let webUrl: string[];
  try {
    const body = await req.json();
    sysOriginQuery = body.sysOriginQuery || "请帮我总结这个网页的主要内容，提炼核心要点";
    webUrl = body.webUrl;
    if (!webUrl || !Array.isArray(webUrl) || webUrl.length === 0) {
      throw new Error("缺少 webUrl 参数");
    }
  } catch {
    return new Response(JSON.stringify({ error: "请求参数无效" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey = Deno.env.get("INTEGRATIONS_API_KEY");
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "服务配置错误" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  let upstream: Response;
  try {
    upstream = await fetch(UPSTREAM_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Gateway-Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        parameters: {
          _sys_origin_query: sysOriginQuery,
          web_url: webUrl,
        },
      }),
      signal: AbortSignal.timeout(60_000),
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: `上游请求失败: ${(e as Error).message}` }),
      { status: 502, headers: { "Content-Type": "application/json" } },
    );
  }

  if (upstream.status === 429 || upstream.status === 402) {
    const errText = await upstream.text();
    return new Response(errText, {
      status: upstream.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!upstream.ok) {
    let upstreamBody: any = null;
    try {
      upstreamBody = JSON.parse(await upstream.text());
    } catch {
      // 非 JSON 响应
    }
    const code = upstreamBody?.code ?? upstream.status;
    const msg = upstreamBody?.msg || `上游错误: ${upstream.status}`;
    return new Response(
      JSON.stringify({ code, msg, success: false, data: null }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }

  const data = await upstream.json();
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

Deno.serve(withMonitor("webpage-summarizer", handler));