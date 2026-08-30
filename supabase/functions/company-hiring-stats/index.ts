import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { withMonitor } from "../_shared/logger.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(withMonitor("company-hiring-stats", async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    let keyword = '';
    try {
      const body = await req.json();
      keyword = (body?.keyword ?? '').toString().trim();
    } catch {
      keyword = '';
    }

    const apiKey = Deno.env.get('INTEGRATIONS_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ code: 500, msg: '服务未配置', data: null }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    if (!keyword) {
      return new Response(JSON.stringify({ code: 201, msg: '关键字不能为空', data: null }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const response = await fetch('https://app-a7lm1eejtypt-api-zYkZzErqJg4L-gateway.appmiaoda.com/enterprise/hire-statistics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Gateway-Authorization': `Bearer ${apiKey}`,
      },
      body: new URLSearchParams({ keyword }).toString()
    });

    const data = await response.json();

    // 上游业务层未查询到（code 为 'error' / 201 或 success 为 false）
    if (data && (data.code === 'error' || data.code === 201 || data.success === false)) {
      return new Response(JSON.stringify({ code: 201, msg: data.msg || '未查询到该企业的招聘数据', data: null }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // 成功：统一以 { code, msg, data } 结构返回，HTTP 始终为 200，避免前端误判为接口故障
    return new Response(JSON.stringify({ code: 200, msg: data?.msg || '成功', data: data?.data ?? data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ code: 500, msg: error.message || '服务异常', data: null }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}));
