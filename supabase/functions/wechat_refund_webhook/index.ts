import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { decryptRefundState, getPaymentSecrets } from '../_shared/wechat-pay.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const body = await req.json();
    const resource = body?.resource;
    if (!resource) {
      return new Response(JSON.stringify({ code: 'FAIL', message: '无 resource 字段' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const s = getPaymentSecrets();
    const decrypted = await decryptRefundState(
      s.MCH_API_V3_KEY,
      resource.associated_data || '',
      resource.nonce || '',
      resource.ciphertext || '',
    );

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceKey);

    if (decrypted.refundStatus === 'SUCCESS') {
      // 退款成功：更新退款记录 + 订单状态
      const { data: refund, error: refundErr } = await supabase
        .from('payment_refunds')
        .update({ status: 'refunded', updated_at: new Date().toISOString() })
        .eq('refund_no', decrypted.outRefundNo)
        .eq('status', 'pending')
        .select('order_id');

      if (refund && refund.length > 0) {
        // 更新订单状态为 refunded
        await supabase
          .from('payment_orders')
          .update({ status: 'refunded', updated_at: new Date().toISOString() })
          .eq('id', refund[0].order_id);

        // 停用订阅
        const { data: order } = await supabase
          .from('payment_orders')
          .select('purchaser_email')
          .eq('id', refund[0].order_id)
          .maybeSingle();

        if (order) {
          await supabase
            .from('membership_subscriptions')
            .update({ status: 'cancelled' })
            .eq('user_email', order.purchaser_email);
        }
      }
      console.log(`[Refund Webhook] 退款成功: refund=${decrypted.outRefundNo}`);
    }

    return new Response(JSON.stringify({ code: 'SUCCESS', message: 'OK' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('[Refund Webhook] 异常:', error);
    return new Response(JSON.stringify({ code: 'FAIL', message: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});