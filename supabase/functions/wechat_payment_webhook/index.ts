import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { decryptTradeState, getPaymentSecrets } from '../_shared/wechat-pay.ts';

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
    const decrypted = await decryptTradeState(
      s.MCH_API_V3_KEY,
      resource.associated_data || '',
      resource.nonce || '',
      resource.ciphertext || '',
    );

    if (decrypted.status !== 'SUCCESS') {
      console.log(`[Webhook] 非成功状态: ${decrypted.status}, order=${decrypted.order_no}`);
      return new Response(JSON.stringify({ code: 'SUCCESS', message: 'OK' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // 乐观锁更新：仅当状态为 pending 时更新为 paid
    const { data: updated, error: updateErr } = await supabase
      .from('payment_orders')
      .update({ status: 'paid', updated_at: new Date().toISOString() })
      .eq('order_no', decrypted.order_no)
      .eq('status', 'pending')
      .select('id, plan_snapshot, purchaser_email, total_amount');

    if (updateErr) {
      console.error('[Webhook] 更新订单失败:', updateErr);
      return new Response(JSON.stringify({ code: 'FAIL', message: '更新失败' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    if (!updated || updated.length === 0) {
      // 已处理过（幂等）
      console.log(`[Webhook] 订单已处理或不存在: ${decrypted.order_no}`);
      return new Response(JSON.stringify({ code: 'SUCCESS', message: 'OK' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const order = updated[0];
    const snapshot = order.plan_snapshot || {};

    // 创建/更新订阅
    const periodDays = snapshot.period === 'year' ? 365 : 30;
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + periodDays);

    await supabase.from('membership_subscriptions').upsert({
      user_email: order.purchaser_email,
      plan_sku_code: snapshot.sku_code,
      plan_name: snapshot.name,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      status: 'active',
    }, { onConflict: 'user_email' });

    console.log(`[Webhook] 支付成功: order=${decrypted.order_no}, email=${order.purchaser_email}`);

    return new Response(JSON.stringify({ code: 'SUCCESS', message: 'OK' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('[Webhook] 异常:', error);
    return new Response(JSON.stringify({ code: 'FAIL', message: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});