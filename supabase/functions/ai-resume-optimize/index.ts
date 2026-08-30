// AI简历优化服务
// 基于NLP和计算机视觉技术，提供简历分析和优化建议
import { withMonitor } from "../_shared/logger.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ResumeOptimizeRequest {
  resumeText: string;
  targetPosition?: string;
  targetIndustry?: string;
}

Deno.serve(withMonitor("ai-resume-optimize", async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeText, targetPosition, targetIndustry }: ResumeOptimizeRequest = await req.json();

    if (!resumeText || resumeText.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: '请提供简历内容' }),
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
    const systemPrompt = `你是一位专业的简历优化顾问，擅长简历分析和优化建议。

你的职责是：
1. 深度分析简历的格式、内容、结构
2. 识别简历的优势和不足
3. 提供具体、可操作的优化建议
4. 帮助求职者打造高质量简历

分析维度：
1. 格式规范性：排版、字体、间距、长度等
2. 内容完整性：基本信息、教育背景、工作经历、项目经验、技能证书等
3. 亮点突出度：量化成果、关键词、核心竞争力等
4. 语言专业性：表述准确、用词专业、逻辑清晰等
5. 岗位匹配度：与目标岗位的匹配程度

优化原则：
1. STAR原则：Situation（情境）、Task（任务）、Action（行动）、Result（结果）
2. 量化成果：用数据说话，突出业绩
3. 关键词优化：匹配岗位JD的关键词
4. 突出亮点：核心竞争力前置
5. 简洁明了：避免冗余，突出重点

请以JSON格式返回分析结果：
{
  "overallScore": 85,
  "analysisResult": {
    "formatScore": 80,
    "contentScore": 85,
    "highlightScore": 90,
    "languageScore": 85,
    "matchScore": 88,
    "formatIssues": ["格式问题1", "格式问题2"],
    "contentIssues": ["内容问题1", "内容问题2"],
    "missingHighlights": ["缺失亮点1", "缺失亮点2"],
    "strengthAreas": ["优势领域1", "优势领域2", "优势领域3"]
  },
  "optimizationSuggestions": {
    "structureOptimization": [
      {
        "issue": "结构问题描述",
        "suggestion": "优化建议",
        "priority": "high/medium/low"
      }
    ],
    "contentOptimization": [
      {
        "section": "工作经历",
        "original": "原始表述",
        "optimized": "优化后表述",
        "reason": "优化原因"
      }
    ],
    "keywordOptimization": [
      {
        "missingKeyword": "缺失关键词",
        "suggestion": "添加建议",
        "importance": "high/medium/low"
      }
    ],
    "languagePolish": [
      {
        "original": "原始表述",
        "polished": "润色后表述",
        "improvement": "改进说明"
      }
    ]
  },
  "improvementPriority": [
    {
      "area": "改进领域",
      "description": "改进描述",
      "impact": "预期影响",
      "effort": "所需精力（low/medium/high）"
    }
  ],
  "summary": "综合评价和建议（150-250字）"
}`;

    // 构建用户提示词
    let userPrompt = `请分析以下简历并提供优化建议：

简历内容：
${resumeText}`;

    if (targetPosition) {
      userPrompt += `\n\n目标岗位：${targetPosition}`;
    }
    if (targetIndustry) {
      userPrompt += `\n目标行业：${targetIndustry}`;
    }

    userPrompt += '\n\n请提供详细的分析和优化建议。';

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
    let optimizeResult;
    try {
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        optimizeResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('无法解析AI返回的JSON');
      }
    } catch (parseError) {
      console.error('解析AI返回结果失败:', parseError);
      // 使用降级方案
      optimizeResult = {
        overallScore: 70,
        analysisResult: {
          formatScore: 70,
          contentScore: 70,
          highlightScore: 70,
          languageScore: 70,
          matchScore: 70,
          formatIssues: ['简历格式需要优化'],
          contentIssues: ['内容需要进一步完善'],
          missingHighlights: ['建议突出核心竞争力'],
          strengthAreas: ['具备一定的专业背景']
        },
        optimizationSuggestions: {
          structureOptimization: [
            {
              issue: '简历结构需要优化',
              suggestion: '建议按照"基本信息-教育背景-工作经历-项目经验-技能证书"的顺序组织',
              priority: 'high'
            }
          ],
          contentOptimization: [
            {
              section: '工作经历',
              original: '当前表述',
              optimized: '建议使用STAR原则描述工作成果',
              reason: '突出量化成果和个人贡献'
            }
          ],
          keywordOptimization: [
            {
              missingKeyword: '岗位相关关键词',
              suggestion: '建议在简历中添加与目标岗位相关的关键词',
              importance: 'high'
            }
          ],
          languagePolish: [
            {
              original: '当前表述',
              polished: '建议使用更专业的表述',
              improvement: '提升简历的专业度'
            }
          ]
        },
        improvementPriority: [
          {
            area: '内容优化',
            description: '使用STAR原则描述工作成果，突出量化数据',
            impact: '显著提升简历吸引力',
            effort: 'medium'
          },
          {
            area: '关键词优化',
            description: '添加与目标岗位相关的关键词',
            impact: '提高简历匹配度',
            effort: 'low'
          }
        ],
        summary: '您的简历具备一定的基础，但还有较大的优化空间。建议重点优化工作经历的描述，使用STAR原则突出量化成果；同时添加与目标岗位相关的关键词，提高简历的匹配度。通过这些优化，预计可以显著提升简历的竞争力。'
      };
    }

    return new Response(
      JSON.stringify(optimizeResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('简历优化服务错误:', error);
    return new Response(
      JSON.stringify({ 
        error: '简历优化服务暂时不可用，请稍后重试',
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}));
