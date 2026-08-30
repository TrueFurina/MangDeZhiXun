import { createClient } from "npm:@supabase/supabase-js@2";

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

// 生成唯一 ID
function genId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

// 记录错误日志到 error_log 表
async function logError(
  supabase: ReturnType<typeof createClient>,
  functionName: string,
  errorType: string,
  errorMessage: string,
  requestParams: Record<string, unknown>,
  userId?: string,
) {
  try {
    await supabase.from("error_log").insert({
      log_id: genId(),
      error_time: new Date().toISOString(),
      error_type: errorType,
      error_message: errorMessage,
      function_name: functionName,
      request_params: requestParams,
      user_id: userId || null,
      create_time: new Date().toISOString(),
    });
  } catch (e) {
    console.error("写入错误日志失败:", e);
  }
}

// 记录性能监控数据到 performance_monitor 表
async function logPerformance(
  supabase: ReturnType<typeof createClient>,
  functionName: string,
  startTime: number,
  requestParams: Record<string, unknown>,
) {
  try {
    const endTime = Date.now();
    const duration = endTime - startTime;
    await supabase.from("performance_monitor").insert({
      monitor_id: genId(),
      start_time: new Date(startTime).toISOString(),
      end_time: new Date(endTime).toISOString(),
      duration,
      function_name: functionName,
      request_params: requestParams,
      create_time: new Date().toISOString(),
    });
  } catch (e) {
    console.error("写入性能监控失败:", e);
  }
}

// 从请求中提取用户 ID
function extractUserId(req: Request): string | undefined {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return undefined;
  try {
    const token = authHeader.replace("Bearer ", "");
    const parts = token.split(".");
    if (parts.length !== 3) return undefined;
    const payload = JSON.parse(atob(parts[1]));
    return payload.sub;
  } catch {
    return undefined;
  }
}

// 安全提取请求参数（移除敏感字段）
function safeParams(body: unknown): Record<string, unknown> {
  if (!body || typeof body !== "object") return {};
  const params = { ...(body as Record<string, unknown>) };
  // 移除可能包含敏感信息的字段
  delete params.password;
  delete params.token;
  delete params.secret;
  delete params.apiKey;
  return params;
}

/**
 * 统一监控包装器：为 Edge Function 注入错误日志上报与耗时监控
 * 包装现有 (req) => Promise<Response> 处理器，不改变其内部逻辑
 * @param functionName 函数名
 * @param handler 业务处理函数
 */
export function withMonitor(
  functionName: string,
  handler: (req: Request) => Promise<Response>,
) {
  return async (req: Request): Promise<Response> => {
    const startTime = Date.now();

    // 处理 CORS 预检（统一处理，避免业务函数重复）
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    const userId = extractUserId(req);

    // 初始化 Supabase 客户端
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    try {
      const response = await handler(req);
      await logPerformance(supabase, functionName, startTime, {});
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      const errorType = err instanceof Error ? err.name : "UnknownError";
      await logError(supabase, functionName, errorType, errorMessage, {}, userId);
      await logPerformance(supabase, functionName, startTime, {});
      console.error(`[${functionName}] 异常:`, err);
      return new Response(
        JSON.stringify({ error: errorMessage || "服务异常，请稍后重试" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }
  };
}