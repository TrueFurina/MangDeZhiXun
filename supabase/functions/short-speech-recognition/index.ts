import { serve } from "https://deno.land/std/http/server.ts";

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const body = await req.json();
    const { speech, len, format = "wav", rate = 16000, cuid = "miaoda-edge-cuid" } = body;

    if (!speech) throw new Error("Missing speech");

    const apiKey = Deno.env.get("INTEGRATIONS_API_KEY");
    if (!apiKey) {
      throw new Error("Server configuration error: INTEGRATIONS_API_KEY");
    }

    const apiUrl = "https://app-e2nysotcr1fl-api-Aa2PZnjEw5NL-gateway.appmiaoda.com/server_api";

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Gateway-Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        format,
        rate,
        channel: 1,
        cuid,
        token: apiKey, // The token field might be required by baidu API but X-Gateway-Authorization handles it mostly. We just pass apiKey just in case.
        speech,
        len
      }),
    });

    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
});
