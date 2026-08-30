// 会员与支付相关类型定义

export interface MembershipPlan {
  id: string;
  sku_code: string;
  name: string;
  description: string;
  price: number;
  period: string;
  role: string;
  features: string[];
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export type PayOrderStatus = 'pending' | 'paid' | 'cancelled' | 'refunded' | 'partial_refunded';
export type RefundStatus = 'pending' | 'approved' | 'rejected' | 'refunded' | 'failed';

export interface PaymentOrder {
  id: string;
  order_no: string;
  purchaser_email: string;
  purchaser_role: string;
  status: PayOrderStatus;
  wechat_pay_url: string | null;
  total_amount: number;
  plan_snapshot: {
    sku_code: string;
    name: string;
    price: number;
    period: string;
    role: string;
  };
  created_at: string;
  updated_at: string;
}

export interface PaymentRefund {
  id: string;
  refund_no: string;
  order_id: string;
  order_no: string;
  purchaser_email: string;
  amount: number;
  reason: string;
  status: RefundStatus;
  created_at: string;
  updated_at: string;
}

export interface MembershipSubscription {
  id: string;
  user_email: string;
  plan_sku_code: string;
  plan_name: string;
  start_date: string;
  end_date: string;
  status: string;
  created_at: string;
}