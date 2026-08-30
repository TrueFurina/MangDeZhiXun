import { supabase } from './supabase';

let initialized = false;

interface ErrorPayload {
  error_type: string;
  error_message: string;
  function_name: string;
  request_params?: Record<string, unknown>;
}

const queue: ErrorPayload[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(flush, 5000);
}

async function flush() {
  flushTimer = null;
  if (queue.length === 0) return;
  const batch = queue.splice(0, queue.length);
  try {
    await supabase.from('error_log').insert(batch.map(e => ({
      error_type: e.error_type,
      error_message: e.error_message,
      function_name: e.function_name,
      request_params: e.request_params || null,
      user_id: null,
    })));
  } catch {
    // 静默失败，避免监控本身引发错误
  }
}

export function reportError(payload: ErrorPayload) {
  // 截断过长的错误信息
  const message = (payload.error_message || '').slice(0, 2000);
  queue.push({ ...payload, error_message: message });
  scheduleFlush();
}

export function initErrorMonitor() {
  if (initialized) return;
  initialized = true;

  // 捕获同步错误
  window.addEventListener('error', (event) => {
    reportError({
      error_type: 'frontend_error',
      error_message: event.message || 'Unknown error',
      function_name: 'window.onerror',
      request_params: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
    });
  });

  // 捕获未处理的 Promise rejection
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    reportError({
      error_type: 'unhandled_rejection',
      error_message: reason?.message || String(reason) || 'Unhandled rejection',
      function_name: 'promise',
      request_params: reason?.stack ? { stack: String(reason.stack).slice(0, 1000) } : undefined,
    });
  });

  // 页面卸载前刷新
  window.addEventListener('beforeunload', flush);
}