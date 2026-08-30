import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { withMonitor } from '../_shared/logger.ts';
import { createWechatRefund, generateRefundNo, getPaymentSecrets, hasPaymentSecrets } from '../_shared/wechat-pay.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 管理员直接执行退款（全额）
serve(withMonitor('execute_refund_directly', async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { order_no } = await req.json();
    if (!order_no) throw new Error('缺少 order_no');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const { data: order, error: orderErr } = await supabase
      .from('payment_orders')
      .select('*')
      .eq('order_no', order_no)
      .maybeSingle();

    if (orderErr) throw orderErr;
    if (!order) throw new Error('订单不存在');
    if (order.status !== 'paid') throw new Error('仅已支付订单可退款');

    if (!hasPaymentSecrets()) {
      throw new Error('微信支付密钥未配置');
    }

    const s = getPaymentSecrets();
    const refundNo = generateRefundNo();
    const notifyUrl = `${supabaseUrl}/functions/v1/wechat_refund_webhook`;

    const result = await createWechatRefund(
      s.MERCHANT_ID, s.MCH_CERT_SERIAL_NO, s.MCH_PRIVATE_KEY,
      s.WECHAT_PAY_PUBLIC_KEY_ID, s.WECHAT_PAY_PUBLIC_KEY,
      order.order_no, refundNo, Number(order.total_amount), Number(order.total_amount),
      notifyUrl, '管理员退款',
    );

    if (!result.success) {
      throw new Error(result.error || '退款请求失败');
    }

    // 创建退款记录
    await supabase.from('payment_refunds').insert({
      refund_no: refundNo,
      order_id: order.id,
      order_no: order.order_no,
      purchaser_email: order.purchaser_email,
      amount: Number(order.total_amount),
      reason: '管理员退款',
      status: 'pending',
    });

    return new Response(JSON.stringify({
      success: true,
      refund_no: refundNo,
      message: '退款请求已提交，等待微信回调确认',
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