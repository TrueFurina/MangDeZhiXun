import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  student_data: {
    name: string;
    major: string;
    competency_score: number;
    tech_score: number;
    general_score: number;
    behavior_score: number;
    experience_score: number;
    study_hours: number;
    completed_courses: number;
    applied_jobs: number;
    interviews: number;
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { student_data } = await req.json() as RequestBody;

    // 获取API密钥
    const apiKey = Deno.env.get('INTEGRATIONS_API_KEY');
    if (!apiKey) {
      throw new Error('API密钥未配置');
    }

    // 构建prompt
    const prompt = `你是一位资深的高校就业指导老师。请根据以下学生数据，分析该学生需要重点关注的原因：

学生信息：
- 姓名：${student_data.name}
- 专业：${student_data.major}
- 胜任力得分：${student_data.competency_score}分
- 专业技能：${student_data.tech_score}分
- 通用能力：${student_data.general_score}分
- 行为特质：${student_data.behavior_score}分
- 经验背景：${student_data.experience_score}分
- 学习时长：${student_data.study_hours}小时
- 完成课程：${student_data.completed_courses}门
- 投递简历：${student_data.applied_jobs}份
- 面试邀约：${student_data.interviews}次

请用一句话（20字以内）概括该学生需要重点关注的核心原因。只输出原因，不要其他内容。`;

    // 调用文心大模型API
    const response = await fetch(
      'https://app-a7lm1eejtypt-api-zYkZz8qovQ1L-gateway.appmiaoda.com/v2/chat/completions',
      {
        method: 'POST',
        headers: {
          'X-Gateway-Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: '你是一位资深的高校就业指导老师，擅长分析学生数据并给出精准的指导建议。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          enable_thinking: false
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API调用失败: ${errorData.error?.message || response.statusText}`);
    }

    // 解析响应（流式响应）
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let result = '';

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim() !== '');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content || '';
              result += content;
            } catch (e) {
              console.error('解析错误:', e);
            }
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        reason: result.trim(),
        data_source: 'AI分析（基于测评数据、学习数据、求职数据）'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
