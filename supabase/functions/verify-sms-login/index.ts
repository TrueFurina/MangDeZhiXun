import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  mobile: string;
  code: string;
  sessionId: string;
  inviteCode?: string;
}

// 由手机号派生的固定登录密码：保证同一手机号每次登录密码一致，
// 从而复用已存在的 auth 用户，避免重复创建。
function derivePassword(mobile: string): string {
  const secret = Deno.env.get('PHONE_LOGIN_SECRET') || 'miaoda-phone-login-salt';
  // 简单稳定的派生：手机号 + 固定盐，长度满足密码要求
  return `P#${mobile}${secret}!9xQ`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mobile, code, sessionId, inviteCode } = await req.json() as RequestBody;

    if (!mobile || !code || !sessionId) {
      return new Response(JSON.stringify({ success: false, error: '参数不完整' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!/^1[3-9]\d{9}$/.test(mobile)) {
      return new Response(JSON.stringify({ success: false, error: '请输入正确的手机号' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('INTEGRATIONS_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ success: false, error: '服务未配置' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Step 1: 通过平台短信网关校验验证码（仅用于校验，登录态由 Supabase Auth 建立）
    const verifyResponse = await fetch(
      'https://app-a7lm1eejtypt-api-Xa6JZxjyqK0a-gateway.appmiaoda.com/v1/code/verify_message_code',
      {
        method: 'POST',
        headers: {
          'X-Gateway-Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mobile, code, sessionId }),
      }
    );

    const verifyResult = await verifyResponse.json().catch(() => ({}));
    if (!verifyResponse.ok || verifyResult.status !== 0) {
      return new Response(JSON.stringify({
        success: false,
        error: verifyResult.msg || '验证码错误或已过期',
      }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Step 2: 使用 service role 建立/复用 auth 用户，并创建真实会话
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://backend.appmiaoda.com/projects/supabase290412401096962048';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoyMDg4NjY2OTEyLCJpc3MiOiJzdXBhYmFzZSIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJzdWIiOiJzZXJ2aWNlX3JvbGUifQ.4xV8K_j9HQZG0L09rsrmGy5vIem9lq3goJvy7iMiDRI';
    const admin = createClient(supabaseUrl, supabaseServiceKey, { auth: { autoRefreshToken: false, persistSession: false } });

    const email = `${mobile}@phone.user`;
    const password = derivePassword(mobile);
    let isNewUser = false;

    // 尝试登录已存在的 auth 用户
    let sessionData = await admin.auth.signInWithPassword({ email, password });
    if (sessionData.error) {
      // 用户不存在则创建（手机号已通过短信验证，视为可信）
      const created = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        phone: mobile,
        phone_confirm: true,
        user_metadata: { phone: mobile, nickname: `用户${mobile.slice(-4)}` },
      });
      if (created.error) {
        throw new Error(`创建用户失败: ${created.error.message}`);
      }
      isNewUser = true;
      // 创建后立即登录获取会话
      sessionData = await admin.auth.signInWithPassword({ email, password });
      if (sessionData.error) {
        throw new Error(`登录失败: ${sessionData.error.message}`);
      }
    }

    const authUser = sessionData.data.user!;

    // Step 3: 确保 user_profiles 存在（trigger 可能已创建），并补全字段
    const { data: profile } = await admin.from('user_profiles').select('*').eq('user_id', authUser.id).maybeSingle();

    let invitedById = null;
    if (inviteCode) {
      const { data: promoter } = await admin.from('user_profiles').select('id').eq('invite_code', inviteCode).maybeSingle();
      if (promoter) invitedById = promoter.id;
    }

    if (profile) {
      await admin.from('user_profiles').update({
        phone: mobile,
        nickname: profile.nickname || `用户${mobile.slice(-4)}`,
        invited_by: profile.invited_by || invitedById,
      }).eq('user_id', authUser.id);
    } else {
      await admin.from('user_profiles').insert({
        user_id: authUser.id,
        email,
        phone: mobile,
        nickname: `用户${mobile.slice(-4)}`,
        vip_level: 'free',
        login_type: 'phone',
        user_role: 'student',
        invited_by: invitedById,
      });
    }

    // 重新读取最终 profile
    const { data: finalProfile } = await admin.from('user_profiles').select('*').eq('user_id', authUser.id).maybeSingle();
    const p = finalProfile || profile;

    return new Response(JSON.stringify({
      success: true,
      isNewUser,
      user: {
        id: authUser.id,
        email,
        phone: mobile,
        nickname: p?.nickname || `用户${mobile.slice(-4)}`,
        avatar_url: p?.avatar_url || null,
        vip_level: p?.vip_level || 'free',
        user_role: p?.user_role || 'student',
      },
      message: isNewUser ? '注册成功' : '登录成功',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || '操作失败，请稍后重试',
    }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
