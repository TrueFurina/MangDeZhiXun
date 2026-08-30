import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { withMonitor } from '../_shared/logger.ts';
import { generateOrderNo, createWechatPayUrl, getPaymentSecrets, hasPaymentSecrets } from '../_shared/wechat-pay.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(withMonitor('create_payment_order', async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { sku_code, purchaser_email, purchaser_role } = await req.json();

    if (!sku_code || !purchaser_email) {
      throw new Error('缺少必要参数：sku_code 或 purchaser_email');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // 查询套餐
    const { data: plan, error: planErr } = await supabase
      .from('membership_plans')
      .select('*')
      .eq('sku_code', sku_code)
      .eq('is_active', true)
      .maybeSingle();

    if (planErr) throw planErr;
    if (!plan) throw new Error('套餐不存在或已下架');

    // 检查是否已有待支付订单
    const { data: existing } = await supabase
      .from('payment_orders')
      .select('id, order_no, wechat_pay_url')
      .eq('purchaser_email', purchaser_email)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1);

    let orderNo: string;
    let wechatUrl: string | null = null;

    if (existing && existing.length > 0) {
      // 复用已有待支付订单
      const existingOrder = existing[0];
      orderNo = existingOrder.order_no;
      wechatUrl = existingOrder.wechat_pay_url;
    } else {
      orderNo = generateOrderNo();
    }

    // 生成微信支付二维码 URL
    if (!wechatUrl) {
      if (!hasPaymentSecrets()) {
        throw new Error('微信支付密钥未配置，请联系管理员在插件中心配置支付密钥');
      }
      const s = getPaymentSecrets();
      const notifyUrl = `${supabaseUrl}/functions/v1/wechat_payment_webhook`;
      const result = await createWechatPayUrl(
        s.MERCHANT_ID, s.MERCHANT_APP_ID, s.MCH_CERT_SERIAL_NO,
        s.MCH_PRIVATE_KEY, s.WECHAT_PAY_PUBLIC_KEY_ID, s.WECHAT_PAY_PUBLIC_KEY,
        orderNo, Number(plan.price), notifyUrl,
      );
      if (!result.success || !result.url) {
        throw new Error(result.error || '生成微信支付二维码失败');
      }
      wechatUrl = result.url;
    }

    // 保存订单
    const { error: insertErr } = await supabase.from('payment_orders').upsert({
      order_no: orderNo,
      purchaser_email,
      purchaser_role: purchaser_role || plan.role,
      status: 'pending',
      wechat_pay_url: wechatUrl,
      total_amount: Number(plan.price),
      plan_snapshot: { sku_code: plan.sku_code, name: plan.name, price: Number(plan.price), period: plan.period, role: plan.role },
    }, { onConflict: 'order_no' });

    if (insertErr) throw insertErr;

    return new Response(JSON.stringify({
      success: true,
      order_no: orderNo,
      wechat_pay_url: wechatUrl,
    }), {
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