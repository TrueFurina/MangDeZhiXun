import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { withMonitor } from "../_shared/logger.ts";

const BAIDU_API_KEY = Deno.env.get('BAIDU_API_KEY') || "";
const BAIDU_SECRET_KEY = Deno.env.get('BAIDU_SECRET_KEY') || "";

async function getAccessToken() {
  const url = `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${BAIDU_API_KEY}&client_secret=${BAIDU_SECRET_KEY}`;
  const response = await fetch(url, { method: "POST" });
  const data = await response.json();
  return data.access_token;
}

async function callBaiduLLM(messages: any[]) {
  const token = await getAccessToken();
  const url = `https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions_pro?access_token=${token}`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ messages })
  });
  
  const data = await response.json();
  return data.result;
}

serve(withMonitor("ai-interview-engine", async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, portrait, record, answer, target_jd } = await req.json();

    let result = '';

    if (action === 'start') {
      let prompt = '';
      if (record.sceneType === 'single') {
        prompt = `你是一个专业的AI面试官。正在进行【全真单面模拟】，针对岗位类型【${record.jobCategory}】，难度【${record.difficulty}】。请直接抛出第一个结构化面试题，考察候选人的核心业务能力。不要废话。`;
      } else if (record.sceneType === 'group') {
        prompt = `你是一个群面AI观察员。当前正在进行【群面场景实训】。学生扮演的角色是【${record.groupRole}】。请给出一个典型的无领导小组讨论开局情境，并让该角色进行第一次发言。不要废话。`;
      } else if (record.sceneType === 'competition') {
        prompt = `你是【${record.competitionType}】赛事的评委。当前正在进行【竞赛答辩模拟】。请直接抛出第一个刁钻的答辩问题，考察项目的商业模式或创新点。不要废话。`;
      } else {
        // JD靶向模式
        prompt = `你是一个专业的AI面试官。候选人的画像与目标如下：
【目标企业与岗位要求 (JD拆解)】：${target_jd ? JSON.stringify(target_jd) : '无明确JD'}

【候选人真实能力画像与短板】：
目标岗位：${JSON.stringify(portrait.job_target || {})}
能力短板：${JSON.stringify(portrait.ability_portrait || {})}
过往经历：${JSON.stringify(portrait.resume_experience || {})}

请根据目标JD的要求，对比该候选人的短板，提出第一个【靶向深度特训】面试问题。
如果JD明确要求了某项技能，而候选人能力缺失，请死死咬住这个短板进行高压追问。
请直接输出问题内容，不要包含其他废话。`;
      }
      
      result = await callBaiduLLM([{ role: "user", content: prompt }]);
    } else if (action === 'follow_up') {
      let prompt = '';
      if (record.sceneType === 'group') {
         prompt = `你是群面AI观察员。学生扮演的角色是【${record.groupRole}】。上一轮发言是："${answer}"。请模拟其他组员的反对意见或推进讨论的观点，并要求该学生回应。`;
      } else if (record.sceneType === 'competition') {
         prompt = `你是赛事评委。上一轮回答是："${answer}"。请针对回答中的逻辑漏洞或数据依据，提出一个压力追问。`;
      } else if (record.sceneType === 'single') {
         prompt = `你是AI面试官。这是第 ${record.round_count + 1} 轮追问。岗位【${record.jobCategory}】。上一轮回答："${answer}"。请对回答进行深入挖掘。`;
      } else {
         prompt = `你是一个专业的AI面试官。这是第 ${record.round_count + 1} 轮追问。
【目标企业与岗位要求 (JD拆解)】：${target_jd ? JSON.stringify(target_jd) : '无明确JD'}
候选人上一轮的回答是：
"${answer}"

请对候选人的回答进行逻辑分析，指出其中的漏洞或不够深入的地方。
结合目标 JD 中的核心技能要求，提出一个具有强对抗性和压力的追问问题。`;
      }
      
      result = await callBaiduLLM([{ role: "user", content: prompt }]);
    } else if (action === 'finish') {
      // Step 3: Generate report
      const prompt = `你是一个专业的AI面试官。面试已经结束。候选人的所有问答记录如下：
${JSON.stringify(record.round_data)}

请从以下五个维度进行评分和点评：
1. 逻辑思维得分（0-100）：
2. 压力应对得分（0-100）：
3. 情境应对得分（0-100）：
4. 专业技能水平得分（0-100）：
5. 综合点评（包括优势、劣势和改进建议）：

请以严格的 JSON 格式输出，不要输出其他废话：
{
  "logic_score": 85,
  "pressure_score": 80,
  "scenario_score": 75,
  "skill_score": 88,
  "ai_comment": "你的点评内容..."
}`;
      const llmResult = await callBaiduLLM([{ role: "user", content: prompt }]);
      const match = llmResult.match(/\{[\s\S]*\}/);
      let parsed = { logic_score: 80, pressure_score: 80, scenario_score: 80, skill_score: 80, ai_comment: "表现良好" };
      if (match) {
        try {
          parsed = JSON.parse(match[0]);
        } catch (e) {
          console.error("Parse error", e);
        }
      }
      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ question: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
}));