import { supabase } from '@/lib/supabase';
import type { MembershipPlan, PaymentOrder, PaymentRefund, MembershipSubscription } from '@/types/membership';

// 获取会员套餐列表
export async function getMembershipPlans(role?: string): Promise<MembershipPlan[]> {
  let query = supabase
    .from('membership_plans')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });
  if (role) {
    query = query.eq('role', role);
  }
  const { data, error } = await query;
  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

// 创建支付订单
export async function createPaymentOrder(skuCode: string, purchaserEmail: string, purchaserRole: string): Promise<{ order_no: string; wechat_pay_url: string }> {
  const { data, error } = await supabase.functions.invoke('create_payment_order', {
    body: { sku_code: skuCode, purchaser_email: purchaserEmail, purchaser_role: purchaserRole },
  });
  if (error) {
    let msg = '创建订单失败';
    try {
      const errJson = JSON.parse(await error.context?.text?.() || '{}');
      msg = errJson.error || msg;
    } catch { /* 忽略 */ }
    throw new Error(msg);
  }
  if (!data?.success) throw new Error(data?.error || '创建订单失败');
  return { order_no: data.order_no, wechat_pay_url: data.wechat_pay_url };
}

// 查询订单
export async function getOrderByNo(orderNo: string): Promise<PaymentOrder | null> {
  const { data, error } = await supabase
    .from('payment_orders')
    .select('*')
    .eq('order_no', orderNo)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// 查询用户订单列表
export async function getUserOrders(email: string): Promise<PaymentOrder[]> {
  const { data, error } = await supabase
    .from('payment_orders')
    .select('*')
    .eq('purchaser_email', email)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

// 查询用户退款列表
export async function getUserRefunds(email: string): Promise<PaymentRefund[]> {
  const { data, error } = await supabase
    .from('payment_refunds')
    .select('*')
    .eq('purchaser_email', email)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

// 查询用户订阅
export async function getUserSubscription(email: string): Promise<MembershipSubscription | null> {
  const { data, error } = await supabase
    .from('membership_subscriptions')
    .select('*')
    .eq('user_email', email)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// 申请退款
export async function createRefundRequest(orderNo: string, email: string, reason: string): Promise<{ refund_no: string }> {
  const { data, error } = await supabase.functions.invoke('create_refund_request', {
    body: { order_no: orderNo, purchaser_email: email, reason },
  });
  if (error) {
    let msg = '退款申请失败';
    try {
      const errJson = JSON.parse(await error.context?.text?.() || '{}');
      msg = errJson.error || msg;
    } catch { /* 忽略 */ }
    throw new Error(msg);
  }
  if (!data?.success) throw new Error(data?.error || '退款申请失败');
  return { refund_no: data.refund_no };
}

// 管理员直接退款
export async function executeRefundDirectly(orderNo: string): Promise<{ refund_no: string }> {
  const { data, error } = await supabase.functions.invoke('execute_refund_directly', {
    body: { order_no: orderNo },
  });
  if (error) {
    let msg = '退款失败';
    try {
      const errJson = JSON.parse(await error.context?.text?.() || '{}');
      msg = errJson.error || msg;
    } catch { /* 忽略 */ }
    throw new Error(msg);
  }
  if (!data?.success) throw new Error(data?.error || '退款失败');
  return { refund_no: data.refund_no };
}

// 管理员查询所有订单
export async function getAllOrders(): Promise<PaymentOrder[]> {
  const { data, error } = await supabase
    .from('payment_orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);
  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

// 管理员查询所有退款
export async function getAllRefunds(): Promise<PaymentRefund[]> {
  const { data, error } = await supabase
    .from('payment_refunds')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);
  if (error) throw error;
  return Array.isArray(data) ? data : [];
}