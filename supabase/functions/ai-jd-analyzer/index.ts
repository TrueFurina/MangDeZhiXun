import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { withMonitor } from "../_shared/logger.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GATEWAY_URL = 'https://app-e2nysotcr1fl-api-zYkZz8qovQ1L-gateway.appmiaoda.com/v2/chat/completions';

serve(withMonitor("ai-jd-analyzer", async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, company, jobTitle, jdText } = await req.json();
    const apiKey = Deno.env.get('INTEGRATIONS_API_KEY');

    if (!apiKey) {
      throw new Error('服务配置错误：缺少 INTEGRATIONS_API_KEY');
    }

    const prompt = `你是一个高级HR专家和AI面试官。请深度解析以下JD，并输出对抗面试需要的核心点。
目标企业：${company || '未知'}
目标岗位：${jobTitle || '未知'}
职位描述：
${jdText || '无'}

请输出严格的 JSON 格式，不要有其他废话。必须包含以下字段：
{
  "core_skills": ["技能1", "技能2", "技能3"], 
  "soft_skills": ["软素质1", "隐性门槛1"],
  "shortcomings": ["作为大学生，可能缺乏大型项目高并发落地经验", "可能对该企业的特定业务场景缺乏了解", "针对该岗位的一个致命提问点"],
  "radar_data": [
    { "subject": "核心技能", "A": 60, "B": 90, "fullMark": 100 },
    { "subject": "软素质", "A": 85, "B": 80, "fullMark": 100 },
    { "subject": "项目经验", "A": 40, "B": 85, "fullMark": 100 },
    { "subject": "学历背景", "A": 80, "B": 70, "fullMark": 100 },
    { "subject": "综合竞争力", "A": 65, "B": 85, "fullMark": 100 }
  ]
}
雷达图中 A 代表大学生当前得分，B 代表 JD 要求的预期得分。`;

    // 网关可能返回 JSON 或 SSE 流式两种格式，统一处理
    const response = await fetch(GATEWAY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Gateway-Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        enable_thinking: false,
        stream: false,
      }),
    });

    if (!response.ok) {
      let upstreamBody: any = null;
      try { upstreamBody = JSON.parse(await response.text()); } catch { /* 非 JSON */ }
      const msg = upstreamBody?.msg || `AI 接口调用失败: ${response.status}`;
      throw new Error(msg);
    }

    const rawText = await response.text();
    let llmResult = '';
    if (rawText.trimStart().startsWith('data:')) {
      // SSE 流式：拼接所有 data: 行的 content 片段
      for (const line of rawText.split('\n')) {
        const t = line.trim();
        if (!t.startsWith('data:')) continue;
        const payload = t.slice(5).trim();
        if (!payload || payload === '[DONE]') continue;
        try {
          const j = JSON.parse(payload);
          const delta = j.choices?.[0]?.delta?.content || j.choices?.[0]?.message?.content || '';
          llmResult += delta;
        } catch { /* 忽略坏行 */ }
      }
    } else {
      try {
        const j = JSON.parse(rawText);
        llmResult = j.choices?.[0]?.message?.content || '';
      } catch {
        llmResult = rawText;
      }
    }
    if (!llmResult) {
      console.error('网关返回内容为空，前200字符:', rawText.slice(0, 200));
    }

    const match = llmResult.match(/\{[\s\S]*\}/);
    let parsed = { 
      core_skills: ["Java基础", "数据库", "基础框架"], 
      soft_skills: ["抗压能力", "沟通能力"],
      shortcomings: ["项目经验不足"]
    };
    if (match) {
      try {
        parsed = JSON.parse(match[0]);
      } catch (e) {
        console.error("Parse error", e);
      }
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
