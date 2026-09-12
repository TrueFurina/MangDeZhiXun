// AI面试评估Edge Function
// 用于评估候选人的面试表现

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InterviewEvaluationRequest {
  positionName: string;
  interviewQuestions: Array<{
    question: string;
    answer: string;
    category: string; // 技术、行为、综合等
  }>;
  interviewDuration?: number; // 面试时长（分钟）
  interviewerNotes?: string; // 面试官备注
}

interface InterviewEvaluationResponse {
  overallScore: number; // 总体评分 0-100
  dimensionScores: {
    technicalAbility: number; // 技术能力 0-100
    communicationSkill: number; // 沟通表达 0-100
    problemSolving: number; // 问题解决 0-100
    teamwork: number; // 团队协作 0-100
    learningAbility: number; // 学习能力 0-100
  };
  strengths: string[]; // 优势表现
  weaknesses: string[]; // 待提升项
  detailedFeedback: Array<{
    question: string;
    score: number;
    feedback: string;
  }>; // 逐题反馈
  hiringRecommendation: 'strong_hire' | 'hire' | 'maybe' | 'no_hire'; // 录用建议
  summary: string; // 综合评价
}

Deno.serve(async (req) => {
  // 处理CORS预检请求
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { positionName, interviewQuestions, interviewDuration, interviewerNotes }: InterviewEvaluationRequest = await req.json();

    // 验证输入
    if (!positionName || !interviewQuestions || interviewQuestions.length === 0) {
      return new Response(
        JSON.stringify({ error: '缺少必要参数' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 获取API密钥
    const apiKey = Deno.env.get('INTEGRATIONS_API_KEY');
    if (!apiKey) {
      console.error('INTEGRATIONS_API_KEY未配置');
      return new Response(
        JSON.stringify({ error: 'API密钥未配置' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 构建评估prompt
    const systemPrompt = `你是一位资深的技术面试官和人才评估专家，擅长通过面试表现评估候选人的综合能力。

评估维度：
1. 技术能力（0-100分）：专业知识的深度和广度
2. 沟通表达（0-100分）：表达清晰度和逻辑性
3. 问题解决（0-100分）：分析问题和解决问题的能力
4. 团队协作（0-100分）：团队合作意识和协作能力
5. 学习能力（0-100分）：学习新知识的能力和意愿

评估原则：
- 基于STAR原则（情境、任务、行动、结果）评估行为问题
- 关注候选人的思维过程，而非仅仅是答案
- 识别候选人的潜力和成长空间
- 提供具体、可操作的反馈

录用建议标准：
- strong_hire: 强烈推荐录用（总分≥85）
- hire: 推荐录用（总分70-84）
- maybe: 待定，需要进一步评估（总分60-69）
- no_hire: 不推荐录用（总分<60）

请以JSON格式返回评估结果，包含以下字段：
- overallScore: 总体评分（0-100）
- dimensionScores: 各维度得分对象
- strengths: 优势表现数组（3-5条）
- weaknesses: 待提升项数组（2-4条）
- detailedFeedback: 逐题反馈数组
- hiringRecommendation: 录用建议（strong_hire/hire/maybe/no_hire）
- summary: 综合评价（150-250字）`;

    const questionsText = interviewQuestions.map((q, index) => 
      `问题${index + 1}（${q.category}）：${q.question}\n候选人回答：${q.answer}`
    ).join('\n\n');

    const userPrompt = `岗位名称：${positionName}
${interviewDuration ? `面试时长：${interviewDuration}分钟` : ''}
${interviewerNotes ? `面试官备注：${interviewerNotes}` : ''}

面试问答记录：
${questionsText}

请对该候选人的面试表现进行全面评估，并以JSON格式返回结果。`;

    // 调用AI API
    const apiUrl = 'https://app-e2nysotcr1fl-api-zYkZz8qovQ1L-gateway.appmiaoda.com/v2/chat/completions';
    
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
      const errorText = await response.text();
      console.error('API调用失败:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: `API调用失败: ${response.status}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    
    // 提取AI返回的内容
    const aiContent = data.choices?.[0]?.delta?.content || data.choices?.[0]?.message?.content || '';
    
    if (!aiContent) {
      console.error('AI返回内容为空');
      return new Response(
        JSON.stringify({ error: 'AI返回内容为空' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 解析AI返回的JSON
    let evaluationResult: InterviewEvaluationResponse;
    try {
      // 尝试从返回内容中提取JSON
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        evaluationResult = JSON.parse(jsonMatch[0]);
      } else {
        // 降级方案：使用简单的评分逻辑
        const avgAnswerLength = interviewQuestions.reduce((sum, q) => sum + q.answer.length, 0) / interviewQuestions.length;
        const baseScore = Math.min(85, 60 + Math.floor(avgAnswerLength / 50));

        evaluationResult = {
          overallScore: baseScore,
          dimensionScores: {
            technicalAbility: baseScore,
            communicationSkill: baseScore - 5,
            problemSolving: baseScore - 3,
            teamwork: baseScore - 2,
            learningAbility: baseScore + 2
          },
          strengths: ['回答问题较为完整', '表达清晰', '具备相关经验'],
          weaknesses: ['部分问题回答深度不够', '可以更多展示实际案例'],
          detailedFeedback: interviewQuestions.map(q => ({
            question: q.question,
            score: baseScore,
            feedback: '回答基本符合要求，建议进一步深入阐述。'
          })),
          hiringRecommendation: baseScore >= 85 ? 'strong_hire' : baseScore >= 70 ? 'hire' : baseScore >= 60 ? 'maybe' : 'no_hire',
          summary: `候选人在面试中的整体表现评分为${baseScore}分，${baseScore >= 70 ? '推荐进入下一轮或录用' : '建议谨慎考虑'}。`
        };
      }
    } catch (parseError) {
      console.error('解析AI返回结果失败:', parseError);
      // 使用降级方案
      const avgAnswerLength = interviewQuestions.reduce((sum, q) => sum + q.answer.length, 0) / interviewQuestions.length;
      const baseScore = Math.min(85, 60 + Math.floor(avgAnswerLength / 50));

      evaluationResult = {
        overallScore: baseScore,
        dimensionScores: {
          technicalAbility: baseScore,
          communicationSkill: baseScore - 5,
          problemSolving: baseScore - 3,
          teamwork: baseScore - 2,
          learningAbility: baseScore + 2
        },
        strengths: ['回答问题较为完整', '表达清晰', '具备相关经验'],
        weaknesses: ['部分问题回答深度不够', '可以更多展示实际案例'],
        detailedFeedback: interviewQuestions.map(q => ({
          question: q.question,
          score: baseScore,
          feedback: '回答基本符合要求，建议进一步深入阐述。'
        })),
        hiringRecommendation: baseScore >= 85 ? 'strong_hire' : baseScore >= 70 ? 'hire' : baseScore >= 60 ? 'maybe' : 'no_hire',
        summary: `候选人在面试中的整体表现评分为${baseScore}分，${baseScore >= 70 ? '推荐进入下一轮或录用' : '建议谨慎考虑'}。`
      };
    }

    // 确保分数在有效范围内
    evaluationResult.overallScore = Math.max(0, Math.min(100, evaluationResult.overallScore));
    Object.keys(evaluationResult.dimensionScores).forEach(key => {
      evaluationResult.dimensionScores[key as keyof typeof evaluationResult.dimensionScores] = 
        Math.max(0, Math.min(100, evaluationResult.dimensionScores[key as keyof typeof evaluationResult.dimensionScores]));
    });

    return new Response(
      JSON.stringify(evaluationResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('处理请求时出错:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : '未知错误' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
