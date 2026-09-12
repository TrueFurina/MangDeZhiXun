const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  job_title: string;
  total_score: number;
  tech_score: number;
  general_score: number;
  behavior_score: number;
  experience_score: number;
  tech_weight: number;
  general_weight: number;
  behavior_weight: number;
  experience_weight: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data = await req.json() as RequestBody;

    // 获取API密钥
    const apiKey = Deno.env.get('INTEGRATIONS_API_KEY');
    if (!apiKey) {
      throw new Error('API密钥未配置');
    }

    // 构建prompt
    const prompt = `你是一位专业的人力资源测评专家。请根据以下测评数据，生成一份详细的胜任力分析报告：

测评信息：
- 岗位：${data.job_title}
- 综合得分：${data.total_score}分
- 专业技能：${data.tech_score}分（权重${data.tech_weight}%）
- 通用能力：${data.general_score}分（权重${data.general_weight}%）
- 行为特质：${data.behavior_score}分（权重${data.behavior_weight}%）
- 经验背景：${data.experience_score}分（权重${data.experience_weight}%）

请按以下格式生成报告（严格按照格式，每部分用"###"分隔）：

###综合评价
（50字以内的总体评价）

###优势分析
（100字以内，列出2-3个核心优势）

###待提升项
（100字以内，列出2-3个需要提升的方面）

###成长建议
（150字以内，给出3-4条具体的成长建议）`;

    // 调用文心大模型API
    const response = await fetch(
      'https://app-e2nysotcr1fl-api-zYkZz8qovQ1L-gateway.appmiaoda.com/v2/chat/completions',
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
              content: '你是一位专业的人力资源测评专家，擅长分析胜任力数据并给出专业的评价和建议。'
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

    // 解析结果
    const sections = result.split('###').filter(s => s.trim());
    const report = {
      summary: '',
      strengths: '',
      improvements: '',
      suggestions: ''
    };

    sections.forEach(section => {
      const trimmed = section.trim();
      if (trimmed.startsWith('综合评价')) {
        report.summary = trimmed.replace('综合评价', '').trim();
      } else if (trimmed.startsWith('优势分析')) {
        report.strengths = trimmed.replace('优势分析', '').trim();
      } else if (trimmed.startsWith('待提升项')) {
        report.improvements = trimmed.replace('待提升项', '').trim();
      } else if (trimmed.startsWith('成长建议')) {
        report.suggestions = trimmed.replace('成长建议', '').trim();
      }
    });

    return new Response(
      JSON.stringify({
        success: true,
        report,
        data_source: 'AI分析（基于胜任力理论模型和测评数据）'
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
