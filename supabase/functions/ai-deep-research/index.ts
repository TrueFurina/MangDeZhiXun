import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { withMonitor } from "../_shared/logger.ts";

const AGENT_ID = "2735b18b-c945-472b-ad10-b58576158e40";

serve(withMonitor("ai-deep-research", async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const apiKey = Deno.env.get("INTEGRATIONS_API_KEY");
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Server configuration error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const action = body.action; // "create" or "run"
  if (!action) {
    return new Response(JSON.stringify({ error: "Missing action in request body" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (action === "create") {
    try {
      const upstream = await fetch(
        "https://app-a7lm1eejtypt-api-ELbWqrZ1krJY-gateway.appmiaoda.com/v2/agent/deepresearch/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Gateway-Authorization": `Bearer ${apiKey}`,
          },
          body: JSON.stringify({ agent_id: AGENT_ID }),
        }
      );

      const data = await upstream.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  if (action === "run") {
    try {
      const upstreamBody: Record<string, any> = {
        agent_id: AGENT_ID,
        query: body.query,
      };

      if (body.conversation_id) upstreamBody.conversation_id = body.conversation_id;
      if (body.interrupt_id) upstreamBody.interrupt_id = body.interrupt_id;
      if (body.structured_outline) upstreamBody.structured_outline = body.structured_outline;

      const upstream = await fetch(
        "https://app-a7lm1eejtypt-api-ELbWqrZ1krJY-gateway.appmiaoda.com/v2/agent/deepresearch/run",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Gateway-Authorization": `Bearer ${apiKey}`,
          },
          body: JSON.stringify(upstreamBody),
        }
      );

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

      // 透传 SSE
      const responseHeaders = new Headers(corsHeaders);
      responseHeaders.set("Content-Type", "text/event-stream");
      responseHeaders.set("Cache-Control", "no-cache");
      responseHeaders.set("X-Content-Type-Options", "nosniff");

      return new Response(upstream.body, { headers: responseHeaders });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  return new Response(JSON.stringify({ error: "Invalid action" }), {
    status: 400,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}));