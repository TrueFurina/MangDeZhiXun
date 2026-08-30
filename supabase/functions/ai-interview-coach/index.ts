// AI面试教练服务
// 提供面试模拟、实时反馈和改进建议

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InterviewCoachRequest {
  positionName: string;
  interviewType: 'technical' | 'behavioral' | 'case' | 'comprehensive';
  difficultyLevel?: 'easy' | 'medium' | 'hard';
  questionsAndAnswers: Array<{
    question: string;
    userAnswer: string;
    answerDuration?: number;
  }>;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      positionName, 
      interviewType, 
      difficultyLevel = 'medium',
      questionsAndAnswers 
    }: InterviewCoachRequest = await req.json();

    if (!positionName || !interviewType || !questionsAndAnswers || questionsAndAnswers.length === 0) {
      return new Response(
        JSON.stringify({ error: '请提供完整的面试信息' }),
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
    const interviewTypeMap = {
      technical: '技术面试',
      behavioral: '行为面试',
      case: '案例面试',
      comprehensive: '综合面试'
    };

    const systemPrompt = `你是一位资深的面试教练，擅长面试辅导和反馈。

面试类型：${interviewTypeMap[interviewType]}
岗位名称：${positionName}
难度级别：${difficultyLevel}

你的职责是：
1. 评估候选人的面试回答质量
2. 分析回答的优势和不足
3. 提供具体、可操作的改进建议
4. 推荐练习题目和资源

评估维度：
1. 内容质量（0-100分）：回答是否准确、完整、有深度
2. 逻辑清晰（0-100分）：思路是否清晰、结构是否合理
3. 表达流畅（0-100分）：语言是否流畅、表述是否专业
4. 专业深度（0-100分）：是否体现专业能力和经验
5. 响应速度（0-100分）：回答是否及时、思考时间是否合理

评估标准：
- 技术面试：重点评估技术深度、问题解决能力、代码质量
- 行为面试：重点评估STAR原则、软技能、团队协作
- 案例面试：重点评估分析能力、逻辑思维、解决方案
- 综合面试：全面评估各项能力

请以JSON格式返回评估结果：
{
  "overallScore": 85,
  "dimensionScores": {
    "contentQuality": 85,
    "logicClarity": 88,
    "expressionFluency": 82,
    "professionalDepth": 86,
    "responseSpeed": 84
  },
  "questionsAnalysis": [
    {
      "question": "面试问题",
      "score": 85,
      "strengths": ["优势1", "优势2"],
      "weaknesses": ["不足1", "不足2"],
      "suggestions": ["建议1", "建议2"],
      "betterAnswer": "更好的回答示例（可选）"
    }
  ],
  "overallStrengths": ["整体优势1", "整体优势2", "整体优势3"],
  "overallWeaknesses": ["整体不足1", "整体不足2"],
  "improvementSuggestions": [
    {
      "area": "改进领域",
      "description": "改进描述",
      "actionSteps": ["步骤1", "步骤2"],
      "priority": "high/medium/low"
    }
  ],
  "recommendedPracticeTopics": [
    {
      "topic": "练习主题",
      "description": "主题描述",
      "difficulty": "easy/medium/hard",
      "resources": ["资源1", "资源2"]
    }
  ],
  "interviewTips": ["面试技巧1", "面试技巧2", "面试技巧3"],
  "summary": "综合评价和建议（150-250字）"
}`;

    // 构建用户提示词
    let userPrompt = `请评估以下面试表现：\n\n`;
    
    questionsAndAnswers.forEach((qa, index) => {
      userPrompt += `问题${index + 1}：${qa.question}\n`;
      userPrompt += `回答：${qa.userAnswer}\n`;
      if (qa.answerDuration) {
        userPrompt += `回答时长：${qa.answerDuration}秒\n`;
      }
      userPrompt += '\n';
    });

    userPrompt += '请提供详细的评估和改进建议。';

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
    let coachResult;
    try {
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        coachResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('无法解析AI返回的JSON');
      }
    } catch (parseError) {
      console.error('解析AI返回结果失败:', parseError);
      // 使用降级方案
      const avgScore = 75;
      coachResult = {
        overallScore: avgScore,
        dimensionScores: {
          contentQuality: avgScore,
          logicClarity: avgScore,
          expressionFluency: avgScore,
          professionalDepth: avgScore,
          responseSpeed: avgScore
        },
        questionsAnalysis: questionsAndAnswers.map((qa, index) => ({
          question: qa.question,
          score: avgScore,
          strengths: ['回答了问题的核心内容'],
          weaknesses: ['可以进一步深入展开'],
          suggestions: ['建议使用STAR原则组织回答', '增加具体的案例和数据'],
          betterAnswer: ''
        })),
        overallStrengths: ['具备基本的面试表达能力', '回答了问题的核心内容'],
        overallWeaknesses: ['回答深度可以进一步提升', '建议增加更多具体案例'],
        improvementSuggestions: [
          {
            area: '回答结构',
            description: '使用STAR原则组织回答',
            actionSteps: ['描述情境（Situation）', '说明任务（Task）', '阐述行动（Action）', '展示结果（Result）'],
            priority: 'high'
          },
          {
            area: '内容深度',
            description: '增加具体案例和量化数据',
            actionSteps: ['准备3-5个核心案例', '量化工作成果', '突出个人贡献'],
            priority: 'high'
          }
        ],
        recommendedPracticeTopics: [
          {
            topic: '常见面试问题',
            description: '练习常见的面试问题，提升回答质量',
            difficulty: 'medium',
            resources: ['自我介绍', '项目经历', '优势劣势', '职业规划']
          }
        ],
        interviewTips: [
          '使用STAR原则组织回答',
          '准备具体的案例和数据',
          '保持自信和积极的态度',
          '注意倾听面试官的问题',
          '适当提问展示兴趣'
        ],
        summary: '您的面试表现具备一定的基础，回答了问题的核心内容。建议重点提升回答的结构性和深度，使用STAR原则组织回答，增加具体的案例和量化数据。同时，建议多练习常见面试问题，提升回答的流畅度和专业性。通过这些改进，预计可以显著提升面试表现。'
      };
    }

    return new Response(
      JSON.stringify(coachResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('面试教练服务错误:', error);
    return new Response(
      JSON.stringify({ 
        error: '面试教练服务暂时不可用，请稍后重试',
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
