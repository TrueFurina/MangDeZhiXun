import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { withMonitor } from "../_shared/logger.ts";
import { callGateway } from "../_shared/llm_gateway.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GATEWAY_URL = 'https://app-e2nysotcr1fl-api-zYkZz8qovQ1L-gateway.appmiaoda.com/v2/chat/completions';

serve(withMonitor("ai-career-planner", async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { messages, profile } = await req.json();
    const apiKey = Deno.env.get('INTEGRATIONS_API_KEY');

    if (!apiKey) {
      throw new Error('服务配置错误：缺少 INTEGRATIONS_API_KEY');
    }

    const systemPrompt = `你是一位资深的大学生职业规划师，专注于帮助大学生规划职业发展路径。

${profile ? `【用户画像】${JSON.stringify(profile)}` : ''}

请遵循以下原则：
1. 基于用户的兴趣、能力、专业背景给出个性化建议
2. 提供具体、可执行的发展路径（短期/中期/长期目标）
3. 结合行业趋势与就业市场实际
4. 鼓励用户，语气专业且温暖
5. 回答控制在 400 字以内，重点突出
6. 如果用户的问题与职业规划无关，礼貌地引导回职业话题`;

    const chatMessages = [
      { role: 'system', content: systemPrompt },
      ...(messages || []).map((m: any) => ({ role: m.role, content: m.content })),
    ];

    const content = await callGateway(GATEWAY_URL, apiKey, messages);

    return new Response(JSON.stringify({ success: true, content }), {
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