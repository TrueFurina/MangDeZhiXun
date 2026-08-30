// AI就业咨询问答服务
// 基于知识图谱提供就业政策、流程、技能等方面的咨询
import { withMonitor } from "../_shared/logger.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ConsultRequest {
  question: string;
  userContext?: {
    education?: string;
    major?: string;
    targetPosition?: string;
    targetCity?: string;
  };
}

Deno.serve(withMonitor("ai-career-consult", async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, userContext }: ConsultRequest = await req.json();

    if (!question || question.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: '请输入您的问题' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 获取AI API密钥
    const apiKey = Deno.env.get('INTEGRATIONS_API_KEY');
    if (!apiKey) {
      console.error('INTEGRATIONS_API_KEY未配置');
      return new Response(
        JSON.stringify({ error: 'AI服务配置错误' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 构建系统提示词
    const systemPrompt = `你是一位专业的就业咨询顾问，拥有丰富的就业指导经验和全面的就业知识。

你的职责是：
1. 解答求职者关于就业政策、流程、技能提升等方面的问题
2. 提供准确、实用、可操作的建议
3. 基于求职者的背景提供个性化指导
4. 帮助求职者解决"信息差"问题

知识领域包括：
- 就业政策：社保、落户、劳动合同、试用期等
- 求职流程：简历投递、面试准备、offer谈判、入职手续等
- 技能提升：职业技能、软技能、证书考试等
- 职业规划：职业发展路径、行业选择、岗位转型等
- 面试技巧：常见问题、回答策略、注意事项等

回答要求：
1. 准确性：提供准确的政策信息和流程说明
2. 实用性：给出具体、可操作的建议
3. 个性化：结合求职者的背景和需求
4. 结构化：使用清晰的结构组织回答
5. 友好性：使用温暖、鼓励的语气

请以JSON格式返回回答：
{
  "answer": "详细的回答内容（200-500字）",
  "category": "问题分类（policy/process/skill/career_planning/interview）",
  "keyPoints": ["关键要点1", "关键要点2", "关键要点3"],
  "actionSteps": ["可执行步骤1", "可执行步骤2"],
  "relatedTopics": ["相关话题1", "相关话题2"],
  "resources": [
    {
      "title": "资源标题",
      "description": "资源描述",
      "url": "资源链接（如有）"
    }
  ],
  "tips": ["温馨提示1", "温馨提示2"]
}`;

    // 构建用户提示词
    let userPrompt = `用户问题：${question}`;
    
    if (userContext) {
      userPrompt += '\n\n用户背景：';
      if (userContext.education) userPrompt += `\n- 学历：${userContext.education}`;
      if (userContext.major) userPrompt += `\n- 专业：${userContext.major}`;
      if (userContext.targetPosition) userPrompt += `\n- 目标岗位：${userContext.targetPosition}`;
      if (userContext.targetCity) userPrompt += `\n- 目标城市：${userContext.targetCity}`;
    }

    userPrompt += '\n\n请基于用户的背景，提供专业、实用的就业咨询建议。';

    // 调用AI API
    const apiUrl = 'https://app-a7lm1eejtypt-api-zYkZz8qovQ1L-gateway.appmiaoda.com/v2/chat/completions';
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Gateway-Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        enable_thinking: false
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API调用失败: ${response.status}`);
    }

    const aiResponse = await response.json();
    const aiContent = aiResponse.choices?.[0]?.message?.content;

    if (!aiContent) {
      throw new Error('AI返回内容为空');
    }

    // 解析AI返回的JSON
    let consultResult;
    try {
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        consultResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('无法解析AI返回的JSON');
      }
    } catch (parseError) {
      console.error('解析AI返回结果失败:', parseError);
      // 使用降级方案
      consultResult = {
        answer: aiContent,
        category: 'general',
        keyPoints: ['请仔细阅读上述回答'],
        actionSteps: ['根据建议采取行动'],
        relatedTopics: [],
        resources: [],
        tips: ['如有疑问，欢迎继续咨询']
      };
    }

    return new Response(
      JSON.stringify(consultResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('就业咨询服务错误:', error);
    return new Response(
      JSON.stringify({ 
        error: '咨询服务暂时不可用，请稍后重试',
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}));
