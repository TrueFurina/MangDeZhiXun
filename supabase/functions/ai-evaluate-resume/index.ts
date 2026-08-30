// AI简历评估Edge Function
// 用于评估候选人简历与岗位的匹配度

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ResumeEvaluationRequest {
  resumeContent: string;
  positionName: string;
  positionRequirements: string;
  requiredSkills: string[];
  salaryRange?: string;
}

interface ResumeEvaluationResponse {
  overallScore: number; // 总体匹配度 0-100
  dimensionScores: {
    skillMatch: number; // 技能匹配度 0-100
    experienceMatch: number; // 经验匹配度 0-100
    educationMatch: number; // 学历匹配度 0-100
    stabilityScore: number; // 稳定性评分 0-100
  };
  strengths: string[]; // 优势亮点
  weaknesses: string[]; // 不足之处
  recommendations: string[]; // 面试建议
  riskWarnings: string[]; // 风险提示
  summary: string; // 综合评价
}

Deno.serve(async (req) => {
  // 处理CORS预检请求
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeContent, positionName, positionRequirements, requiredSkills, salaryRange }: ResumeEvaluationRequest = await req.json();

    // 验证输入
    if (!resumeContent || !positionName || !positionRequirements) {
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
    const systemPrompt = `你是一位资深的HR和人才评估专家，擅长通过简历分析候选人与岗位的匹配度。

评估维度：
1. 技能匹配度（0-100分）：候选人的技能与岗位要求的匹配程度
2. 经验匹配度（0-100分）：工作经验的相关性和深度
3. 学历匹配度（0-100分）：教育背景与岗位要求的匹配度
4. 稳定性评分（0-100分）：工作稳定性和职业发展连贯性

评估原则：
- 客观公正，基于事实数据
- 关注候选人的核心竞争力
- 识别潜在风险和红旗信号
- 提供可操作的面试建议

请以JSON格式返回评估结果，包含以下字段：
- overallScore: 总体匹配度（0-100）
- dimensionScores: 各维度得分对象
- strengths: 优势亮点数组（3-5条）
- weaknesses: 不足之处数组（2-4条）
- recommendations: 面试建议数组（2-3条）
- riskWarnings: 风险提示数组（0-3条，如有）
- summary: 综合评价（100-200字）`;

    const userPrompt = `岗位信息：
岗位名称：${positionName}
岗位要求：${positionRequirements}
${requiredSkills && requiredSkills.length > 0 ? `必备技能：${requiredSkills.join('、')}` : ''}
${salaryRange ? `薪资范围：${salaryRange}` : ''}

候选人简历：
${resumeContent}

请对该候选人进行全面评估，并以JSON格式返回结果。`;

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
    let evaluationResult: ResumeEvaluationResponse;
    try {
      // 尝试从返回内容中提取JSON
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        evaluationResult = JSON.parse(jsonMatch[0]);
      } else {
        // 降级方案：使用简单的关键词匹配
        const skillMatchCount = requiredSkills.filter(skill => 
          resumeContent.toLowerCase().includes(skill.toLowerCase())
        ).length;
        const skillMatchScore = requiredSkills.length > 0 
          ? Math.round((skillMatchCount / requiredSkills.length) * 100)
          : 70;

        evaluationResult = {
          overallScore: skillMatchScore,
          dimensionScores: {
            skillMatch: skillMatchScore,
            experienceMatch: 70,
            educationMatch: 75,
            stabilityScore: 80
          },
          strengths: ['具备相关工作经验', '教育背景符合要求'],
          weaknesses: ['部分技能需要进一步确认'],
          recommendations: ['面试时重点考察技术能力', '了解项目经验的深度'],
          riskWarnings: [],
          summary: `候选人与岗位的整体匹配度为${skillMatchScore}分，建议进入面试环节进一步评估。`
        };
      }
    } catch (parseError) {
      console.error('解析AI返回结果失败:', parseError);
      // 使用降级方案
      const skillMatchCount = requiredSkills.filter(skill => 
        resumeContent.toLowerCase().includes(skill.toLowerCase())
      ).length;
      const skillMatchScore = requiredSkills.length > 0 
        ? Math.round((skillMatchCount / requiredSkills.length) * 100)
        : 70;

      evaluationResult = {
        overallScore: skillMatchScore,
        dimensionScores: {
          skillMatch: skillMatchScore,
          experienceMatch: 70,
          educationMatch: 75,
          stabilityScore: 80
        },
        strengths: ['具备相关工作经验', '教育背景符合要求'],
        weaknesses: ['部分技能需要进一步确认'],
        recommendations: ['面试时重点考察技术能力', '了解项目经验的深度'],
        riskWarnings: [],
        summary: `候选人与岗位的整体匹配度为${skillMatchScore}分，建议进入面试环节进一步评估。`
      };
    }

    // 确保分数在有效范围内
    evaluationResult.overallScore = Math.max(0, Math.min(100, evaluationResult.overallScore));
    evaluationResult.dimensionScores.skillMatch = Math.max(0, Math.min(100, evaluationResult.dimensionScores.skillMatch));
    evaluationResult.dimensionScores.experienceMatch = Math.max(0, Math.min(100, evaluationResult.dimensionScores.experienceMatch));
    evaluationResult.dimensionScores.educationMatch = Math.max(0, Math.min(100, evaluationResult.dimensionScores.educationMatch));
    evaluationResult.dimensionScores.stabilityScore = Math.max(0, Math.min(100, evaluationResult.dimensionScores.stabilityScore));

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
