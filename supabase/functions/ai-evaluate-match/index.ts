// AI人岗匹配评估Edge Function
// 用于评估候选人与岗位的综合匹配度

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MatchEvaluationRequest {
  candidateProfile: {
    name: string;
    education: string;
    workExperience: string;
    skills: string[];
    assessmentScores?: {
      techScore: number;
      generalScore: number;
      behaviorScore: number;
      experienceScore: number;
    };
    interviewScore?: number;
  };
  positionInfo: {
    positionName: string;
    positionDesc: string;
    requiredSkills: string[];
    salaryRange: string;
    workLocation: string;
  };
  companyInfo?: {
    companyName: string;
    companySize: string;
    companyIndustry: string;
  };
}

interface MatchEvaluationResponse {
  matchScore: number; // 综合匹配度 0-100
  matchLevel: 'excellent' | 'good' | 'fair' | 'poor'; // 匹配等级
  dimensionScores: {
    skillMatch: number; // 技能匹配 0-100
    experienceMatch: number; // 经验匹配 0-100
    cultureMatch: number; // 文化匹配 0-100
    potentialMatch: number; // 潜力匹配 0-100
    stabilityMatch: number; // 稳定性匹配 0-100
  };
  matchReasons: string[]; // 匹配原因
  mismatchReasons: string[]; // 不匹配原因
  developmentSuggestions: string[]; // 发展建议
  riskAssessment: {
    level: 'low' | 'medium' | 'high';
    factors: string[];
  };
  recommendation: string; // 推荐意见
  summary: string; // 综合评价
}

Deno.serve(async (req) => {
  // 处理CORS预检请求
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { candidateProfile, positionInfo, companyInfo }: MatchEvaluationRequest = await req.json();

    // 验证输入
    if (!candidateProfile || !positionInfo) {
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
    const systemPrompt = `你是一位资深的人才匹配专家和职业规划顾问，擅长评估候选人与岗位的综合匹配度。

评估维度：
1. 技能匹配（0-100分）：候选人技能与岗位要求的匹配程度
2. 经验匹配（0-100分）：工作经验的相关性和适配度
3. 文化匹配（0-100分）：候选人特质与企业文化的契合度
4. 潜力匹配（0-100分）：候选人的成长潜力和发展空间
5. 稳定性匹配（0-100分）：候选人在该岗位的稳定性预期

匹配等级标准：
- excellent: 优秀匹配（综合得分≥85）
- good: 良好匹配（综合得分70-84）
- fair: 一般匹配（综合得分60-69）
- poor: 不匹配（综合得分<60）

风险评估等级：
- low: 低风险（稳定性高，各维度均衡）
- medium: 中风险（部分维度存在短板）
- high: 高风险（关键维度不匹配或稳定性差）

评估原则：
- 综合考虑硬技能和软技能
- 关注候选人的职业发展轨迹
- 评估长期价值而非仅看当前能力
- 识别潜在的适配风险

请以JSON格式返回评估结果，包含以下字段：
- matchScore: 综合匹配度（0-100）
- matchLevel: 匹配等级
- dimensionScores: 各维度得分对象
- matchReasons: 匹配原因数组（3-5条）
- mismatchReasons: 不匹配原因数组（0-3条）
- developmentSuggestions: 发展建议数组（2-4条）
- riskAssessment: 风险评估对象
- recommendation: 推荐意见（50-100字）
- summary: 综合评价（150-250字）`;

    const userPrompt = `候选人信息：
姓名：${candidateProfile.name}
学历：${candidateProfile.education}
工作经验：${candidateProfile.workExperience}
技能：${candidateProfile.skills.join('、')}
${candidateProfile.assessmentScores ? `测评成绩：
- 专业技能：${candidateProfile.assessmentScores.techScore}分
- 通用能力：${candidateProfile.assessmentScores.generalScore}分
- 行为特质：${candidateProfile.assessmentScores.behaviorScore}分
- 经验背景：${candidateProfile.assessmentScores.experienceScore}分` : ''}
${candidateProfile.interviewScore ? `面试评分：${candidateProfile.interviewScore}分` : ''}

岗位信息：
岗位名称：${positionInfo.positionName}
岗位描述：${positionInfo.positionDesc}
技能要求：${positionInfo.requiredSkills.join('、')}
薪资范围：${positionInfo.salaryRange}
工作地点：${positionInfo.workLocation}

${companyInfo ? `公司信息：
公司名称：${companyInfo.companyName}
公司规模：${companyInfo.companySize}
所属行业：${companyInfo.companyIndustry}` : ''}

请对该候选人与岗位的匹配度进行全面评估，并以JSON格式返回结果。`;

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
    let evaluationResult: MatchEvaluationResponse;
    try {
      // 尝试从返回内容中提取JSON
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        evaluationResult = JSON.parse(jsonMatch[0]);
      } else {
        // 降级方案：使用简单的匹配算法
        const skillMatchCount = positionInfo.requiredSkills.filter(skill => 
          candidateProfile.skills.some(cs => cs.toLowerCase().includes(skill.toLowerCase()))
        ).length;
        const skillMatchScore = positionInfo.requiredSkills.length > 0 
          ? Math.round((skillMatchCount / positionInfo.requiredSkills.length) * 100)
          : 70;

        const assessmentAvg = candidateProfile.assessmentScores 
          ? (candidateProfile.assessmentScores.techScore + 
             candidateProfile.assessmentScores.generalScore + 
             candidateProfile.assessmentScores.behaviorScore + 
             candidateProfile.assessmentScores.experienceScore) / 4
          : 75;

        const overallScore = Math.round((skillMatchScore * 0.4 + assessmentAvg * 0.4 + (candidateProfile.interviewScore || 75) * 0.2));

        evaluationResult = {
          matchScore: overallScore,
          matchLevel: overallScore >= 85 ? 'excellent' : overallScore >= 70 ? 'good' : overallScore >= 60 ? 'fair' : 'poor',
          dimensionScores: {
            skillMatch: skillMatchScore,
            experienceMatch: 75,
            cultureMatch: 70,
            potentialMatch: 80,
            stabilityMatch: 75
          },
          matchReasons: [
            '技能与岗位要求基本匹配',
            '具备相关工作经验',
            '测评成绩表现良好'
          ],
          mismatchReasons: skillMatchScore < 70 ? ['部分关键技能需要补充'] : [],
          developmentSuggestions: [
            '入职后加强专业技能培训',
            '定期进行绩效评估和反馈'
          ],
          riskAssessment: {
            level: overallScore >= 75 ? 'low' : overallScore >= 60 ? 'medium' : 'high',
            factors: overallScore < 75 ? ['技能匹配度有待提升'] : []
          },
          recommendation: overallScore >= 70 ? '推荐录用，候选人综合素质良好。' : '建议谨慎考虑，需进一步评估。',
          summary: `候选人与岗位的综合匹配度为${overallScore}分，${overallScore >= 70 ? '整体表现良好，推荐录用' : '存在一定差距，建议进一步评估'}。`
        };
      }
    } catch (parseError) {
      console.error('解析AI返回结果失败:', parseError);
      // 使用降级方案
      const skillMatchCount = positionInfo.requiredSkills.filter(skill => 
        candidateProfile.skills.some(cs => cs.toLowerCase().includes(skill.toLowerCase()))
      ).length;
      const skillMatchScore = positionInfo.requiredSkills.length > 0 
        ? Math.round((skillMatchCount / positionInfo.requiredSkills.length) * 100)
        : 70;

      const assessmentAvg = candidateProfile.assessmentScores 
        ? (candidateProfile.assessmentScores.techScore + 
           candidateProfile.assessmentScores.generalScore + 
           candidateProfile.assessmentScores.behaviorScore + 
           candidateProfile.assessmentScores.experienceScore) / 4
        : 75;

      const overallScore = Math.round((skillMatchScore * 0.4 + assessmentAvg * 0.4 + (candidateProfile.interviewScore || 75) * 0.2));

      evaluationResult = {
        matchScore: overallScore,
        matchLevel: overallScore >= 85 ? 'excellent' : overallScore >= 70 ? 'good' : overallScore >= 60 ? 'fair' : 'poor',
        dimensionScores: {
          skillMatch: skillMatchScore,
          experienceMatch: 75,
          cultureMatch: 70,
          potentialMatch: 80,
          stabilityMatch: 75
        },
        matchReasons: [
          '技能与岗位要求基本匹配',
          '具备相关工作经验',
          '测评成绩表现良好'
        ],
        mismatchReasons: skillMatchScore < 70 ? ['部分关键技能需要补充'] : [],
        developmentSuggestions: [
          '入职后加强专业技能培训',
          '定期进行绩效评估和反馈'
        ],
        riskAssessment: {
          level: overallScore >= 75 ? 'low' : overallScore >= 60 ? 'medium' : 'high',
          factors: overallScore < 75 ? ['技能匹配度有待提升'] : []
        },
        recommendation: overallScore >= 70 ? '推荐录用，候选人综合素质良好。' : '建议谨慎考虑，需进一步评估。',
        summary: `候选人与岗位的综合匹配度为${overallScore}分，${overallScore >= 70 ? '整体表现良好，推荐录用' : '存在一定差距，建议进一步评估'}。`
      };
    }

    // 确保分数在有效范围内
    evaluationResult.matchScore = Math.max(0, Math.min(100, evaluationResult.matchScore));
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
