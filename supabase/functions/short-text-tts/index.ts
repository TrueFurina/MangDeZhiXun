import { serve } from "https://deno.land/std/http/server.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }
  
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: CORS_HEADERS });
  }

  try {
    const body = await req.json();
    const text = body.text;

    if (!text) {
      return new Response("Missing text parameter", { status: 400, headers: CORS_HEADERS });
    }

    const apiKey = Deno.env.get("INTEGRATIONS_API_KEY");
    if (!apiKey) {
      throw new Error("Server configuration error: INTEGRATIONS_API_KEY");
    }

    // 参数：tex(需urlencode两次或一次，视上游而定，这里百度TTS通常一次，也可以由FormData自动处理)
    const params = new URLSearchParams();
    params.append('tex', text);
    params.append('tok', apiKey);
    params.append('cuid', 'miaoda-tts-web');
    params.append('ctp', '1');
    params.append('lan', 'zh');
    params.append('spd', '5'); // 语速
    params.append('pit', '5'); // 音调
    params.append('vol', '5'); // 音量
    params.append('per', '1'); // 发音人

    const apiUrl = "https://app-e2nysotcr1fl-api-e94GZ5j0ljja-gateway.appmiaoda.com/text2audio";

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "X-Gateway-Authorization": `Bearer ${apiKey}`,
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errText = await response.text();
      return new Response(errText, { status: response.status, headers: CORS_HEADERS });
    }

    const audioBlob = await response.blob();
    return new Response(audioBlob, {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "audio/mpeg",
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
