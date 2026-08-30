// AI智能评分Edge Function
// 用于评估填空题和简答题的答案

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GradeRequest {
  question: string;
  questionType: 'fill' | 'essay';
  userAnswer: string;
  standardAnswer: string;
  maxScore: number;
  dimension?: string;
}

interface GradeResponse {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

Deno.serve(async (req) => {
  // 处理CORS预检请求
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, questionType, userAnswer, standardAnswer, maxScore, dimension }: GradeRequest = await req.json();

    // 验证输入
    if (!question || !questionType || !userAnswer || !standardAnswer || !maxScore) {
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

    // 构建评分prompt
    const systemPrompt = `你是一位专业的AI岗位胜任力测评评分专家。你的任务是根据标准答案和评分标准，对用户的答案进行客观、公正的评分。

评分原则：
1. 准确性：答案是否准确回答了问题
2. 完整性：答案是否涵盖了关键要点
3. 逻辑性：答案是否条理清晰、逻辑严密
4. 深度：答案是否有深入的分析和见解

请以JSON格式返回评分结果，包含以下字段：
- score: 得分（0-${maxScore}分）
- feedback: 总体评价（50-100字）
- strengths: 优点列表（数组，2-3条）
- improvements: 改进建议列表（数组，2-3条）`;

    const userPrompt = `题目类型：${questionType === 'fill' ? '填空题' : '简答题'}
${dimension ? `考察维度：${dimension}` : ''}
满分：${maxScore}分

题目：${question}

标准答案：${standardAnswer}

用户答案：${userAnswer}

请根据以上信息进行评分，并以JSON格式返回结果。`;

    // 调用文心大模型API
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
    let gradeResult: GradeResponse;
    try {
      // 尝试从返回内容中提取JSON
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        gradeResult = JSON.parse(jsonMatch[0]);
      } else {
        // 如果无法解析JSON，使用默认评分逻辑
        const similarity = calculateSimilarity(userAnswer, standardAnswer);
        const score = Math.round(similarity * maxScore);
        
        gradeResult = {
          score,
          feedback: `您的答案与标准答案的相似度为${Math.round(similarity * 100)}%。${score >= maxScore * 0.8 ? '回答较为准确，继续保持！' : '建议参考标准答案，进一步完善您的理解。'}`,
          strengths: ['回答了问题的基本要点'],
          improvements: ['可以更加详细地阐述', '注意答案的完整性']
        };
      }
    } catch (parseError) {
      console.error('解析AI返回结果失败:', parseError);
      // 使用简单的相似度算法作为降级方案
      const similarity = calculateSimilarity(userAnswer, standardAnswer);
      const score = Math.round(similarity * maxScore);
      
      gradeResult = {
        score,
        feedback: `您的答案与标准答案的相似度为${Math.round(similarity * 100)}%。${score >= maxScore * 0.8 ? '回答较为准确，继续保持！' : '建议参考标准答案，进一步完善您的理解。'}`,
        strengths: ['回答了问题的基本要点'],
        improvements: ['可以更加详细地阐述', '注意答案的完整性']
      };
    }

    // 确保分数在有效范围内
    gradeResult.score = Math.max(0, Math.min(maxScore, gradeResult.score));

    return new Response(
      JSON.stringify(gradeResult),
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

// 简单的相似度计算函数（降级方案）
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  if (s1 === s2) return 1;
  if (s1.length === 0 || s2.length === 0) return 0;
  
  // 计算包含的关键词数量
  const words2 = s2.split(/\s+/);
  let matchCount = 0;
  
  for (const word of words2) {
    if (word.length > 1 && s1.includes(word)) {
      matchCount++;
    }
  }
  
  return Math.min(1, matchCount / Math.max(1, words2.length));
}
