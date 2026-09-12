import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { withMonitor } from "../_shared/logger.ts";
import { callGateway } from "../_shared/llm_gateway.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GATEWAY_URL = 'https://app-e2nysotcr1fl-api-zYkZz8qovQ1L-gateway.appmiaoda.com/v2/chat/completions';

serve(withMonitor("ai-interview-trend", async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { records } = await req.json();
    const apiKey = Deno.env.get('INTEGRATIONS_API_KEY');

    if (!apiKey) {
      throw new Error('服务配置错误：缺少 INTEGRATIONS_API_KEY');
    }

    if (!Array.isArray(records) || records.length === 0) {
      throw new Error('暂无面试记录可用于趋势分析');
    }

    // 按时间升序整理得分序列
    const sorted = [...records].sort((a: any, b: any) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const series = sorted.map((r: any, i: number) =>
      `第${i + 1}次(${(r.date || '').slice(0, 10)}): 综合${r.total_score ?? '-'} / 表达逻辑${r.logic_score ?? '-'} / 抗压应变${r.pressure_score ?? '-'}`
    ).join('\n');

    const prompt = `你是一位资深面试辅导专家。请基于学员多次 AI 深度面试的得分序列，生成一份「面试能力趋势分析」。

【得分序列（按时间升序）】
${series}

请严格输出 JSON 格式（不要任何额外文字），结构如下：
{
  "summary": "80字以内的整体进步趋势总结，指出进步明显与仍需加强的维度",
  "dimensions": [
    {
      "name": "综合表现",
      "trend": "上升 或 下降 或 持平",
      "change": "较首次的变化幅度，如 +12",
      "comment": "20字以内点评"
    },
    { "name": "表达逻辑", ... },
    { "name": "抗压应变", ... }
  ]
}

要求：
1. dimensions 必须包含「综合表现」「表达逻辑」「抗压应变」三项
2. trend 只能是「上升」「下降」「持平」之一
3. change 为较首次得分的差值（整数，带正负号）
4. 严格 JSON，不要 markdown 代码块标记`;

    const messages = [
      { role: 'system', content: '你是一位专业的面试辅导专家，擅长分析学员面试能力的成长趋势。' },
      { role: 'user', content: prompt },
    ];

    const llmResult = await callGateway(GATEWAY_URL, apiKey, messages);
    const match = llmResult.match(/\{[\s\S]*\}/);

    let trendData: any = null;
    if (match) {
      try {
        trendData = JSON.parse(match[0]);
      } catch {
        throw new Error('AI 返回的趋势分析格式异常');
      }
    }

    if (!trendData || !trendData.dimensions) {
      throw new Error('未能生成有效的趋势分析');
    }

    return new Response(JSON.stringify({ success: true, data: trendData }), {
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