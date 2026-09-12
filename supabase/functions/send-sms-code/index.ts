const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  mobile: string;
  sessionId?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mobile, sessionId } = await req.json() as RequestBody;

    // 验证手机号格式
    if (!mobile || !/^1[3-9]\d{9}$/.test(mobile)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: '请输入正确的手机号'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // 获取API密钥
    const apiKey = Deno.env.get('INTEGRATIONS_API_KEY');
    if (!apiKey) {
      throw new Error('API密钥未配置');
    }

    // 调用百度短信验证码API
    const response = await fetch(
      'https://app-e2nysotcr1fl-api-W9z3M74x6ZNL-gateway.appmiaoda.com/v1/code/send_message',
      {
        method: 'POST',
        headers: {
          'X-Gateway-Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mobile,
          sessionId: sessionId || undefined
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`发送验证码失败: ${errorData.msg || response.statusText}`);
    }

    const result = await response.json();

    if (result.status !== 0) {
      throw new Error(result.msg || '发送验证码失败');
    }

    return new Response(
      JSON.stringify({
        success: true,
        sessionId: result.data.sessionId,
        message: '验证码已发送，请注意查收'
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
        error: error.message || '发送验证码失败，请稍后重试'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
