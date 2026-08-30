import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { withMonitor } from "../_shared/logger.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(withMonitor("interview-designer", async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { position, jd, interviewType, duration, candidateInfo } = await req.json();
    const apiKey = Deno.env.get('INTEGRATIONS_API_KEY');

    if (!apiKey) {
      throw new Error('Missing INTEGRATIONS_API_KEY');
    }

    const typeMap: Record<string, string> = {
      behavioral: '行为面试',
      technical: '技术面试',
      case: '案例面试',
      manager: '管理者面试',
    };
    const typeName = typeMap[interviewType] || '综合面试';

    const prompt = `你是一位资深招聘专家。请基于以下信息，设计一份结构化面试方案。

【岗位信息】
- 岗位名称：${position}
- 面试类型：${typeName}
- 面试时长：${duration || 60} 分钟
- 职位描述：${jd || '未提供'}

【候选人背景】
${candidateInfo || '未提供'}

请严格按照以下 JSON 格式输出（不要输出任何额外文字、不要用 markdown 代码块包裹）：
{
  "objective": "面试目标（一句话）",
  "duration": ${duration || 60},
  "competencies": [
    { "name": "能力项名称", "weight": 20, "description": "该能力项的评估要点" }
  ],
  "questions": [
    {
      "competency": "对应能力项",
      "mainQuestion": "主问题",
      "followUps": ["追问1", "追问2"],
      "positiveSignals": ["正向信号1", "正向信号2"],
      "riskSignals": ["风险信号1"],
      "scoring": "评分建议（1-5分标准描述）"
    }
  ],
  "scorecard": [
    { "competency": "能力项", "levels": ["1分描述", "3分描述", "5分描述"] }
  ],
  "opening": "开场话术",
  "closing": "收尾话术",
  "tips": ["面试官提示1", "面试官提示2", "面试官提示3"]
}

要求：
1. competencies 至少 4 个能力项，weight 之和为 100
2. questions 至少 6 个问题，覆盖各能力项
3. 所有内容用中文，专业、具体、可执行
4. 严格输出纯 JSON，不要任何额外说明`;

    const response = await fetch('https://app-a7lm1eejtypt-api-zYkZzErqJg4L-gateway.appmiaoda.com/llm/text-generation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Gateway-Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ prompt, maxOutputTokens: 4096, temperature: 0.7 }),
    });

    const data = await response.json();
    let text = data?.result || data?.text || '';

    // 清理可能的 markdown 包裹
    text = text.replace(/```json/gi, '').replace(/```/g, '').trim();

    let parsed: any = null;
    try {
      const start = text.indexOf('{');
      const end = text.lastIndexOf('}');
      if (start >= 0 && end > start) {
        parsed = JSON.parse(text.slice(start, end + 1));
      }
    } catch (_) {
      parsed = null;
    }

    if (!parsed) {
      return new Response(JSON.stringify({ error: '面试方案生成失败，请重试' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    return new Response(JSON.stringify(parsed), {
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