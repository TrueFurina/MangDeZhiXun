import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, Check, Crown, Loader2, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { getMembershipPlans, getUserSubscription, createPaymentOrder } from '@/lib/membership-api';
import type { MembershipPlan, MembershipSubscription } from '@/types/membership';

const ROLE_LABELS: Record<string, string> = {
  student: '学员',
  company: '企业',
  university: '院校',
};

export default function MembershipCenterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [subscription, setSubscription] = useState<MembershipSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState<string | null>(null);

  const role = searchParams.get('role') || 'student';
  const email = user?.email || localStorage.getItem('student_email') || '';

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [plansData, subData] = await Promise.all([
        getMembershipPlans(role),
        email ? getUserSubscription(email) : Promise.resolve(null),
      ]);
      setPlans(plansData);
      setSubscription(subData);
    } catch (err: any) {
      toast.error(err?.message || '加载失败');
    } finally {
      setLoading(false);
    }
  }, [role, email]);

  useEffect(() => { load(); }, [load]);

  const handleSubscribe = async (plan: MembershipPlan) => {
    if (!email) {
      toast.error('请先登录');
      return;
    }
    if (plan.price === 0) {
      toast.info('该套餐为免费版本，无需支付');
      return;
    }
    setCreating(plan.sku_code);
    try {
      const { order_no } = await createPaymentOrder(plan.sku_code, email, role);
      navigate(`/membership/order/${order_no}`);
    } catch (err: any) {
      toast.error(err?.message || '创建订单失败');
    } finally {
      setCreating(null);
    }
  };

  const isCurrentPlan = (sku: string) => subscription?.plan_sku_code === sku && subscription?.status === 'active';

  return (
    <div className="container py-8 max-w-5xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold tracking-tight">会员中心</h1>
          <p className="text-muted-foreground text-sm mt-1">选择适合你的{ROLE_LABELS[role] || ''}套餐，解锁全部能力</p>
        </div>
      </div>

      {/* 当前订阅 */}
      {subscription && subscription.status === 'active' && (
        <Card className="mb-6 border-primary/30 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Crown className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{subscription.plan_name}</p>
                <p className="text-xs text-muted-foreground">
                  有效期至 {new Date(subscription.end_date).toLocaleDateString('zh-CN')}
                </p>
              </div>
              <Badge className="shrink-0">已开通</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-16"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan, idx) => {
            const isPro = plan.price > 0;
            const isCurrent = isCurrentPlan(plan.sku_code);
            return (
              <Card key={plan.sku_code} className={`h-full flex flex-col relative ${isPro && idx === 1 ? 'border-primary shadow-lg md:scale-105' : ''}`}>
                {isPro && idx === 1 && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <Zap className="h-3 w-3 mr-1" />推荐
                  </Badge>
                )}
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {plan.name}
                    {isCurrent && <ShieldCheck className="h-4 w-4 text-primary" />}
                  </CardTitle>
                  <CardDescription className="text-pretty">{plan.description}</CardDescription>
                  <div className="mt-3">
                    <span className="text-3xl font-bold">¥{Number(plan.price)}</span>
                    <span className="text-sm text-muted-foreground ml-1">
                      /{plan.period === 'year' ? '年' : '月'}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <ul className="space-y-2 flex-1">
                    {(plan.features || []).map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span className="text-pretty">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="mt-6 w-full"
                    variant={isPro && idx === 1 ? 'default' : 'outline'}
                    disabled={!!creating || isCurrent}
                    onClick={() => handleSubscribe(plan)}
                  >
                    {creating === plan.sku_code ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : isCurrent ? '当前套餐' : plan.price === 0 ? '免费使用' : '立即订阅'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center mt-6">
        支付完成后将自动开通会员权益。如需退款，请在订单详情页申请。
      </p>
    </div>
  );
}