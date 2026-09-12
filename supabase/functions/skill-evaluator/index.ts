import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { withMonitor } from "../_shared/logger.ts";

const GATEWAY_URL = "https://app-e2nysotcr1fl-api-zYkZz8qovQ1L-gateway.appmiaoda.com/v2/chat/completions";

// 通过平台网关调用文心大模型，聚合 SSE 流并返回完整文本
async function callWenxin(prompt: string): Promise<string> {
  const apiKey = Deno.env.get('INTEGRATIONS_API_KEY');
  if (!apiKey) {
    throw new Error('服务未配置（INTEGRATIONS_API_KEY 缺失）');
  }

  const response = await fetch(GATEWAY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Gateway-Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ messages: [{ role: 'user', content: prompt }] }),
  });

  if (!response.ok || !response.body) {
    const errText = await response.text().catch(() => '');
    throw new Error(`网关错误: ${response.status} ${errText.slice(0, 200)}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let full = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const payload = trimmed.slice(5).trim();
      if (!payload || payload === '[DONE]') continue;
      try {
        const json = JSON.parse(payload);
        const delta = json?.choices?.[0]?.delta?.content;
        if (typeof delta === 'string') full += delta;
      } catch {
        // 忽略不完整的数据帧
      }
    }
  }

  return full;
}

serve(withMonitor("skill-evaluator", async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, content, type } = await req.json();

    if (action === 'evaluate') {
      const typeLabel = type === 'skill' ? 'AI实训技能' : type === 'course' ? '课程内容' : '测评题库';
      const prompt = `你是专业的平台内容与技能质量评估助手。请对以下${typeLabel}进行严格的静态质量评估。所有打分必须基于【待评估内容】的真实情况独立判断，禁止套用任何固定数值或示例分数；内容优秀则给高分，存在缺陷则给低分。

【待评估内容】：
${content}

请先逐一分析以下五个维度（0-100 整数）：
1. 结构完整性：是否包含必要的配置、说明、题目或引导，组织是否完整。
2. 表述清晰度：语言是否准确，指令或内容是否存在歧义。
3. 触发合理性：适用场景是否明确，是否存在逻辑冲突。
4. 合规风险：是否安全、符合公序良俗（得分越高越安全）。
5. 可维护性：内容组织是否有条理，是否易于二次修改。

然后根据上述分析，针对该内容真实存在的问题列出 fix_priority_list（必须针对实际内容，禁止编造通用问题；若无问题可为空数组）。

严格只输出如下 JSON（不要输出任何其他文字、解释或代码块标记）：
{
  "total_score": <五维综合得分>,
  "structure_score": <分数>,
  "clarity_score": <分数>,
  "trigger_score": <分数>,
  "compliance_score": <分数>,
  "maintainability_score": <分数>,
  "risk_level": "<低风险/中风险/高风险>",
  "fix_priority_list": [
    { "issue": "<针对该内容的具体问题>", "risk": "<低风险/中风险/高风险>", "suggestion": "<具体改进建议>" }
  ]
}`;

      const llmResult = await callWenxin(prompt);

      const match = llmResult?.match(/\{[\s\S]*\}/);
      let parsed = {
        total_score: 80,
        structure_score: 80,
        clarity_score: 80,
        trigger_score: 80,
        compliance_score: 80,
        maintainability_score: 80,
        risk_level: "中风险",
        fix_priority_list: []
      };

      if (match) {
        try {
          parsed = JSON.parse(match[0]);
        } catch (e) {
          console.error("Parse error", e);
        }
      }

      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400
    });

  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
}));