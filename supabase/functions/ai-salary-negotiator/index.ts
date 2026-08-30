import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { withMonitor } from "../_shared/logger.ts";
import { callGateway } from "../_shared/llm_gateway.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GATEWAY_URL = 'https://app-a7lm1eejtypt-api-zYkZz8qovQ1L-gateway.appmiaoda.com/v2/chat/completions';

serve(withMonitor("ai-salary-negotiator", async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { position, companies, currentOffer, myStrengths } = await req.json();
    const apiKey = Deno.env.get('INTEGRATIONS_API_KEY');

    if (!apiKey) {
      throw new Error('服务配置错误：缺少 INTEGRATIONS_API_KEY');
    }

    const companyList = (companies || []).join('、') || '多家企业';
    const strengthList = (myStrengths || []).join('、') || '综合能力较强';

    const prompt = `你是一位资深的薪资谈判顾问。请为求职者生成一份结构化的薪资谈判建议。

【目标岗位】${position || '通用岗位'}
【候选企业】${companyList}
【当前Offer/期望薪资】${currentOffer || '暂未明确'}
【个人优势】${strengthList}

请严格输出 JSON 格式（不要任何额外文字），结构如下：
{
  "salary_range": "建议薪资区间，如 18-25K·15薪",
  "market_reference": "该岗位市场薪资参考依据（50字内）",
  "negotiation_strategy": "整体谈判策略概述（60字内）",
  "talking_points": [
    "谈判话术要点1（基于个人优势）",
    "谈判话术要点2（基于多企业对比）",
    "谈判话术要点3（基于市场行情）"
  ],
  "counter_offer_template": "完整的薪资反报价话术模板（可直接使用，120字内）",
  "tips": ["谈判注意事项1", "谈判注意事项2", "谈判注意事项3"]
}

要求：
1. 严格 JSON，不要 markdown 代码块标记
2. 话术要真实、可落地，结合个人优势与多企业对比数据
3. 薪资区间要合理且可谈判`;

    const llmResult = await callGateway(GATEWAY_URL, apiKey, messages);
    const match = llmResult.match(/\{[\s\S]*\}/);

    let data: any = null;
    if (match) {
      try { data = JSON.parse(match[0]); } catch { throw new Error('AI 返回格式异常'); }
    }
    if (!data) throw new Error('未能生成有效的谈判建议');

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
}));