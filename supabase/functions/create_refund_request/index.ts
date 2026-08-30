import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { withMonitor } from '../_shared/logger.ts';
import { generateRefundNo } from '../_shared/wechat-pay.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(withMonitor('create_refund_request', async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { order_no, purchaser_email, reason } = await req.json();

    if (!order_no || !purchaser_email) {
      throw new Error('缺少必要参数：order_no 或 purchaser_email');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // 查询订单
    const { data: order, error: orderErr } = await supabase
      .from('payment_orders')
      .select('*')
      .eq('order_no', order_no)
      .eq('purchaser_email', purchaser_email)
      .maybeSingle();

    if (orderErr) throw orderErr;
    if (!order) throw new Error('订单不存在');
    if (order.status !== 'paid') throw new Error('仅已支付订单可申请退款');

    // 检查是否已有退款记录
    const { data: existingRefunds } = await supabase
      .from('payment_refunds')
      .select('id, status')
      .eq('order_id', order.id)
      .in('status', ['pending', 'approved', 'refunded']);

    if (existingRefunds && existingRefunds.length > 0) {
      throw new Error('该订单已有进行中的退款申请');
    }

    const refundNo = generateRefundNo();

    const { error: insertErr } = await supabase.from('payment_refunds').insert({
      refund_no: refundNo,
      order_id: order.id,
      order_no: order.order_no,
      purchaser_email,
      amount: Number(order.total_amount),
      reason: reason || '用户申请退款',
      status: 'pending',
    });

    if (insertErr) throw insertErr;

    return new Response(JSON.stringify({
      success: true,
      refund_no: refundNo,
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