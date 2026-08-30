import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { withMonitor } from "../_shared/logger.ts";
import { callGateway } from "../_shared/llm_gateway.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GATEWAY_URL = 'https://app-a7lm1eejtypt-api-zYkZz8qovQ1L-gateway.appmiaoda.com/v2/chat/completions';

serve(withMonitor("ai-learning-plan", async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { targetCompany, targetPosition, radarData, shortcomings, userEmail } = await req.json();
    const apiKey = Deno.env.get('INTEGRATIONS_API_KEY');

    if (!apiKey) {
      throw new Error('服务配置错误：缺少 INTEGRATIONS_API_KEY');
    }

    // 拉取课程目录（用于让 LLM 引用真实课程）
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: courses } = await supabase
      .from('courses')
      .select('id, title, dimension, type, difficulty, duration')
      .eq('status', 1)
      .order('rating', { ascending: false })
      .limit(40);

    const courseCatalog = (courses || []).map((c: any) =>
      `[${c.id}]《${c.title}》维度:${c.dimension} 类型:${c.type} 难度:${c.difficulty || '入门'} 时长:${c.duration || '-'}`
    ).join('\n');

    const radarSummary = (radarData || []).map((r: any) =>
      `${r.subject}: 当前${r.A}分/目标${r.B}分`
    ).join('，') || '暂无雷达数据';

    const gapList = (shortcomings || []).join('；') || '暂无明确缺口';

    const prompt = `你是一位资深的职业发展与学习规划专家。请为一位大学生生成一份结构化的多周学习计划。

【目标企业】${targetCompany || '通用'}
【目标岗位】${targetPosition || '通用'}
【能力雷达】${radarSummary}
【关键能力缺口】${gapList}

【站内可用课程目录】（必须从中选择课程，使用对应 id）
${courseCatalog}

请严格输出 JSON 格式（不要任何额外文字），结构如下：
{
  "summary": "一段50字以内的计划总述，说明计划目标与预期成果",
  "total_weeks": 4,
  "weeks": [
    {
      "week": 1,
      "theme": "本周主题",
      "goal": "本周要达成的目标",
      "estimated_hours": 8,
      "tasks": [
        {
          "course_id": 123,
          "course_title": "课程标题（必须来自目录）",
          "dimension": "对应维度",
          "type": "video 或 course",
          "estimated_hours": 4,
          "milestone": "完成该任务后的里程碑描述"
        }
      ]
    }
  ]
}

要求：
1. 生成 4-6 周，每周 2-4 个任务
2. 课程必须从上方目录中选择真实存在的 course_id
3. 优先安排弥补能力缺口最大的维度
4. estimated_hours 为整数，每周总时长合理（6-12小时）
5. 严格 JSON，不要 markdown 代码块标记`;

    const llmResult = await callGateway(GATEWAY_URL, apiKey, messages);
    const match = llmResult.match(/\{[\s\S]*\}/);

    let planData: any = null;
    if (match) {
      try {
        planData = JSON.parse(match[0]);
      } catch (e) {
        throw new Error('AI 返回的学习计划格式异常');
      }
    }

    if (!planData || !planData.weeks) {
      throw new Error('未能生成有效的学习计划');
    }

    // 持久化到 learning_plans 表
    if (userEmail) {
      await supabase.from('learning_plans').insert({
        user_email: userEmail,
        target_company: targetCompany || null,
        target_position: targetPosition || null,
        plan_data: planData,
        status: 'active',
      });
    }

    return new Response(JSON.stringify({ success: true, data: planData }), {
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