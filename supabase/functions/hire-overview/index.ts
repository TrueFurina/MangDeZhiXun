import { withMonitor } from "../_shared/logger.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * 企业招聘概况查询 Edge Function
 * 调用千帆企业招聘概况查询接口，返回职位关键词、城市分布、招聘来源、平均薪资等概况数据。
 */
async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  let keyword: string;
  try {
    const body = await req.json();
    keyword = body.keyword;
    if (!keyword || typeof keyword !== 'string') throw new Error('缺少 keyword 参数');
  } catch {
    return new Response(JSON.stringify({ error: '请求参数无效' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const apiKey = Deno.env.get('INTEGRATIONS_API_KEY');
  if (!apiKey) {
    return new Response(JSON.stringify({ error: '服务配置错误' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let upstream: Response;
  try {
    upstream = await fetch(
      'https://app-a7lm1eejtypt-api-Aa2PZ2MejdoL-gateway.appmiaoda.com/enterprise/hire-overview',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-Gateway-Authorization': `Bearer ${apiKey}`,
        },
        body: new URLSearchParams({ keyword }).toString(),
      },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: `上游请求失败: ${(e as Error).message}` }),
      { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  if (upstream.status === 429 || upstream.status === 402) {
    const errText = await upstream.text();
    return new Response(errText, {
      status: upstream.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // 上游返回非 200 时，透传上游业务码与消息，避免笼统 502
  if (!upstream.ok) {
    let upstreamBody: any = null;
    let rawText = '';
    try {
      rawText = await upstream.text();
      upstreamBody = JSON.parse(rawText);
    } catch {
      // 非 JSON 响应
    }
    const code = upstreamBody?.code ?? upstream.status;
    const msg = upstreamBody?.msg || `上游错误: ${upstream.status}`;
    // code 201 表示查无数据，属正常业务结果
    const httpStatus = code === 201 ? 200 : 200;
    return new Response(
      JSON.stringify({ code, msg, success: false, data: null }),
      { status: httpStatus, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  const data = await upstream.json();
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(withMonitor("hire-overview", handler));