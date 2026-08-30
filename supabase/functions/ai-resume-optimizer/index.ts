import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { withMonitor } from "../_shared/logger.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

serve(withMonitor("ai-resume-optimizer", async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, resumeText, targetJd, portrait } = await req.json();

    const prompt = `你是一个专业的求职导师和简历优化专家。请严格按照以下要求处理传入的原始简历、目标岗位JD和用户画像能力数据。
你的核心任务是：
1. 分析简历与JD的匹配度（输出0-100的分数）。
2. 指出简历中符合项和待优化的短板（缺项目经验、缺关键词等）。
3. 使用 STAR 法则（情境、任务、行动、结果）和目标 JD 的高频关键词，对简历进行彻底重写优化。对于缺乏具体指标的地方，请明确标出 [待核验]。
4. 结合画像短板，推荐2门能够弥补差距的实训课程（书名或课程名）。

输入信息：
【目标岗位JD】：${targetJd}
【原始简历】：${resumeText}
【用户画像数据】：${JSON.stringify(portrait)}

请以严格的 JSON 格式输出，不要有其他废话。必须包含以下字段：
{
  "match_score": 75,
  "match_analysis": {
    "matched_items": ["掌握Java", "沟通能力良好"],
    "to_be_optimized": ["缺少高并发实战经验", "无团队管理经验"]
  },
  "keyword_analysis": {
    "matched": ["Java", "MySQL"],
    "missing": ["Redis", "微服务"]
  },
  "optimized_resume": "这是采用 Markdown 格式排版的优化后简历全文...",
  "cover_letter": "这是针对该岗位的一封求职信...",
  "recommended_courses": [
    {"name": "Redis高并发实战", "reason": "弥补JD要求的Redis经验缺失"},
    {"name": "微服务架构设计", "reason": "提升你的系统设计能力"}
  ]
}`;

    const llmResult = await callBaiduLLM([{ role: "user", content: prompt }]);
    const match = llmResult.match(/\{[\s\S]*\}/);
    let parsed = {
      match_score: 60,
      match_analysis: { matched_items: [], to_be_optimized: [] },
      keyword_analysis: { matched: [], missing: [] },
      optimized_resume: "解析失败或未返回完整简历...",
      cover_letter: "无",
      recommended_courses: []
    };
    if (match) {
      try {
        parsed = JSON.parse(match[0]);
      } catch (e) {
        console.error("Parse error", e);
      }
    }

    return new Response(JSON.stringify(parsed), {
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
