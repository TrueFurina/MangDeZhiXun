-- 订单状态枚举
CREATE TYPE pay_order_status AS ENUM ('pending', 'paid', 'cancelled', 'refunded', 'partial_refunded');
-- 退款状态枚举
CREATE TYPE refund_status AS ENUM ('pending', 'approved', 'rejected', 'refunded', 'failed');

-- 会员套餐表（SKU）
CREATE TABLE public.membership_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sku_code text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  price numeric(10,2) NOT NULL,
  period text NOT NULL DEFAULT 'month',
  role text NOT NULL DEFAULT 'student',
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 支付订单表
CREATE TABLE public.payment_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_no text NOT NULL UNIQUE,
  purchaser_email text NOT NULL,
  purchaser_role text NOT NULL DEFAULT 'student',
  status pay_order_status NOT NULL DEFAULT 'pending',
  wechat_pay_url text,
  total_amount numeric(12,2) NOT NULL,
  plan_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 退款表
CREATE TABLE public.payment_refunds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  refund_no text NOT NULL UNIQUE,
  order_id uuid NOT NULL REFERENCES public.payment_orders(id) ON DELETE CASCADE,
  order_no text NOT NULL,
  purchaser_email text NOT NULL,
  amount numeric(12,2) NOT NULL,
  reason text NOT NULL DEFAULT '',
  status refund_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 用户会员订阅表
CREATE TABLE public.membership_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL UNIQUE,
  plan_sku_code text NOT NULL,
  plan_name text NOT NULL,
  start_date timestamptz NOT NULL DEFAULT now(),
  end_date timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 使用量记录表（用于企业按次计费）
CREATE TABLE public.usage_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  usage_type text NOT NULL,
  usage_date date NOT NULL DEFAULT CURRENT_DATE,
  count int NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 索引
CREATE INDEX idx_payment_orders_email ON public.payment_orders(purchaser_email, created_at DESC);
CREATE INDEX idx_payment_orders_status ON public.payment_orders(status, created_at DESC);
CREATE INDEX idx_payment_refunds_order ON public.payment_refunds(order_id);
CREATE INDEX idx_payment_refunds_email ON public.payment_refunds(purchaser_email, created_at DESC);
CREATE INDEX idx_membership_subs_email ON public.membership_subscriptions(user_email);
CREATE INDEX idx_usage_email_date ON public.usage_records(user_email, usage_date DESC);

-- 启用 RLS
ALTER TABLE public.membership_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_records ENABLE ROW LEVEL SECURITY;

-- membership_plans: 所有人可读，管理员可写
CREATE POLICY "plans_anon_select" ON public.membership_plans FOR SELECT TO anon USING (true);
CREATE POLICY "plans_auth_select" ON public.membership_plans FOR SELECT TO authenticated USING (true);
CREATE POLICY "plans_admin_all" ON public.membership_plans FOR ALL TO authenticated
  USING (current_setting('request.jwt.claims', true)::json->>'role' = 'admin')
  WITH CHECK (current_setting('request.jwt.claims', true)::json->>'role' = 'admin');

-- payment_orders: 用户可查看自己的订单
CREATE POLICY "pay_orders_select_own" ON public.payment_orders FOR SELECT TO anon, authenticated
  USING (purchaser_email = current_setting('request.jwt.claims', true)::json->>'email');
CREATE POLICY "pay_orders_admin_all" ON public.payment_orders FOR ALL TO authenticated
  USING (current_setting('request.jwt.claims', true)::json->>'role' = 'admin')
  WITH CHECK (current_setting('request.jwt.claims', true)::json->>'role' = 'admin');

-- payment_refunds: 用户可查看自己的退款，管理员可处理
CREATE POLICY "pay_refunds_select_own" ON public.payment_refunds FOR SELECT TO anon, authenticated
  USING (purchaser_email = current_setting('request.jwt.claims', true)::json->>'email');
CREATE POLICY "pay_refunds_admin_all" ON public.payment_refunds FOR ALL TO authenticated
  USING (current_setting('request.jwt.claims', true)::json->>'role' = 'admin')
  WITH CHECK (current_setting('request.jwt.claims', true)::json->>'role' = 'admin');

-- membership_subscriptions: 用户可查看自己的订阅
CREATE POLICY "mem_subs_select_own" ON public.membership_subscriptions FOR SELECT TO anon, authenticated
  USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');
CREATE POLICY "mem_subs_admin_all" ON public.membership_subscriptions FOR ALL TO authenticated
  USING (current_setting('request.jwt.claims', true)::json->>'role' = 'admin')
  WITH CHECK (current_setting('request.jwt.claims', true)::json->>'role' = 'admin');

-- usage_records: 用户可查看自己的使用记录
CREATE POLICY "usage_select_own" ON public.usage_records FOR SELECT TO anon, authenticated
  USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');
CREATE POLICY "usage_admin_all" ON public.usage_records FOR ALL TO authenticated
  USING (current_setting('request.jwt.claims', true)::json->>'role' = 'admin')
  WITH CHECK (current_setting('request.jwt.claims', true)::json->>'role' = 'admin');