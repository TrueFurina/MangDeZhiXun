import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Crown, Check, Sparkles, Users, Calendar, CreditCard, X, ScanLine, CheckCircle2 } from 'lucide-react';
import { getVipPlans, getUserVipOrders, checkVipStatus, getStudentVerification, type VipPlan, type VipOrder } from '@/db/api';
import { toast } from 'sonner';
import StudentVerificationDialog from '@/components/StudentVerificationDialog';
import QRCodeDataUrl from '@/components/ui/qrcodedataurl';
import { supabase } from '@/lib/supabase';

// 用户端（学员端）会员中心页面
export default function VipCenterPage() {
  const { user, updateUser } = useAuth();
  const [plans, setPlans] = useState<VipPlan[]>([]);
  const [orders, setOrders] = useState<VipOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<VipPlan | null>(null);
  const [paymentQrCode, setPaymentQrCode] = useState('');
  const [paymentOrderNo, setPaymentOrderNo] = useState('');
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  
  // 学生认证相关状态
  const [isVerificationDialogOpen, setIsVerificationDialogOpen] = useState(false);
  const [isStudentVerified, setIsStudentVerified] = useState(false);

  const vipStatus = checkVipStatus(user);

  useEffect(() => {
    loadData();
    checkStudentVerification();
  }, [user]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [plansData, ordersData] = await Promise.all([
        getVipPlans(),
        user?.email ? getUserVipOrders(user.email) : Promise.resolve([])
      ]);
      setPlans(plansData);
      setOrders(ordersData);
    } catch (error) {
      console.error('加载数据失败:', error);
      toast.error('加载数据失败');
    } finally {
      setIsLoading(false);
    }
  };

  const checkStudentVerification = async () => {
    if (!user?.id) return;
    
    try {
      const verification = await getStudentVerification(user.id);
      setIsStudentVerified(verification?.verification_status === 'approved');
    } catch (error) {
      console.error('检查学生认证状态失败:', error);
    }
  };

  const handleBuyVip = async (plan: VipPlan) => {
    if (!user?.email) {
      toast.error('请先登录');
      return;
    }

    setSelectedPlan(plan);
    setIsPaymentDialogOpen(true);
    setPaymentQrCode('');
    setPaymentOrderNo('');
    setIsCreatingOrder(true);
    
    try {
      const price = isStudentVerified && plan.id === 'premium' ? plan.discount_price - 10 : plan.discount_price;
      
      const { data, error } = await supabase.functions.invoke('create_payment_order', {
        body: {
          packageType: plan.id,
          packageDuration: plan.duration_months + '个月',
          price: price
        }
      });
      
      if (error) throw error;
      
      if (data && data.codeUrl) {
        setPaymentQrCode(data.codeUrl);
        setPaymentOrderNo(data.orderNo);
      } else {
        toast.error('生成支付二维码失败');
        setIsPaymentDialogOpen(false);
      }
    } catch (err) {
      console.error(err);
      toast.error('订单创建失败，请稍后重试');
      setIsPaymentDialogOpen(false);
    } finally {
      setIsCreatingOrder(false);
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPaymentDialogOpen && paymentOrderNo) {
      timer = setInterval(async () => {
        const { data } = await supabase.from('orders').select('payment_status').eq('order_no', paymentOrderNo).single();
        if (data && data.payment_status === 1) {
          clearInterval(timer);
          setIsPaymentDialogOpen(false);
          toast.success('支付成功！已为您开通会员权益');
          if (updateUser && selectedPlan) {
            updateUser({ vip_level: selectedPlan.id as any });
          }
          loadData(); // 刷新订单列表和状态
        }
      }, 2000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPaymentDialogOpen, paymentOrderNo, updateUser]);

  const getVipLevelBadge = (level: string) => {
    if (level === 'premium') {
      return <Badge className="bg-gradient-to-r from-purple-500 to-pink-500"><Crown className="mr-1 h-3 w-3" />高级会员</Badge>;
    } else if (level === 'enterprise') {
      return <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500"><Sparkles className="mr-1 h-3 w-3" />企业会员</Badge>;
    }
    return <Badge variant="outline">免费用户</Badge>;
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      pending: { label: '待支付', variant: 'outline' },
      paid: { label: '已支付', variant: 'default' },
      failed: { label: '支付失败', variant: 'destructive' },
      refunded: { label: '已退款', variant: 'secondary' }
    };
    const config = statusMap[status] || statusMap.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* 学生认证优惠横幅 */}
        <div className="rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 p-4 text-white shadow-lg animate-in slide-in-from-top duration-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-white/20 p-2">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">🎓 学生专享优惠</p>
                <p className="text-sm text-white/90">
                  {isStudentVerified 
                    ? '您已完成学生认证，享受专属优惠价格！' 
                    : '完成学生认证立减10元，更有限时优惠等你来拿！'}
                </p>
              </div>
            </div>
            {!isStudentVerified && (
              <Button
                className="bg-white text-orange-600 hover:bg-white/90"
                onClick={() => setIsVerificationDialogOpen(true)}
              >
                立即认证
              </Button>
            )}
            {isStudentVerified && (
              <Badge className="bg-white text-orange-600 hover:bg-white/90">
                ✓ 已认证
              </Badge>
            )}
          </div>
        </div>

        {/* 会员状态卡片 */}
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-card to-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="hidden md:block">
                  <img 
                    src="https://miaoda-conversation-file.cdn.bcebos.com/user-6m37scl45nuo/conv-a7lm1eejtyps/20260402/file-ao6xs4b87ytc.jpg@w_1561" 
                    alt="芒小橘" 
                    className="h-20 w-20 rounded-xl object-cover"
                  />
                </div>
                <div>
                  <CardTitle className="text-2xl">我的会员</CardTitle>
                  <CardDescription className="mt-2">
                    {user?.nickname || '用户'} · {user?.email}
                  </CardDescription>
                </div>
              </div>
              {getVipLevelBadge(user?.vip_level || 'free')}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg bg-background/50 p-4">
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Crown className="h-4 w-4" />
                  <span className="text-sm">会员等级</span>
                </div>
                <p className="mt-2 text-2xl font-bold">
                  {user?.vip_level === 'premium' ? '高级会员' : user?.vip_level === 'enterprise' ? '企业会员' : '免费用户'}
                </p>
              </div>
              <div className="rounded-lg bg-background/50 p-4">
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">到期时间</span>
                </div>
                <p className="mt-2 text-2xl font-bold">
                  {vipStatus.isVip ? `${vipStatus.daysRemaining}天` : '-'}
                </p>
              </div>
              <div className="rounded-lg bg-background/50 p-4">
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">会员状态</span>
                </div>
                <p className="mt-2 text-2xl font-bold">
                  {vipStatus.isVip ? '正常' : '未开通'}
                </p>
              </div>
            </div>
            {vipStatus.isVip && vipStatus.daysRemaining <= 7 && (
              <div className="mt-4 rounded-lg bg-warning/10 p-3 text-sm text-warning">
                ⚠️ 您的会员即将到期，请及时续费以继续享受会员权益
              </div>
            )}
          </CardContent>
        </Card>

        {/* 会员套餐 */}
        <Tabs defaultValue="plans" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="plans">会员套餐</TabsTrigger>
            <TabsTrigger value="orders">我的订单</TabsTrigger>
          </TabsList>

          <TabsContent value="plans" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Premium会员套餐 */}
              <Card className="border-2 border-purple-500/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <Crown className="h-5 w-5 text-purple-500" />
                      <span>高级会员</span>
                    </CardTitle>
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500">推荐</Badge>
                  </div>
                  <CardDescription>适合个人学习者，提升综合竞争力</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {['AI能力测评无限次', '标准推荐优先级提升', '学习档案优化建议', 'AI全真模拟无限次', '学习资源全开放'].map((feature, idx) => (
                      <div key={idx} className="flex items-center space-x-2 text-sm">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3 pt-4">
                    {plans.filter(p => p.vip_level === 'premium').map((plan) => (
                      <div key={plan.id} className="flex items-center justify-between rounded-lg border p-3 hover:border-primary/50 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{plan.duration_months}个月</p>
                            {plan.duration_months === 12 && (
                              <Badge variant="secondary" className="text-xs">推荐</Badge>
                            )}
                          </div>
                          <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-xs text-muted-foreground line-through">¥{plan.original_price}</span>
                            <span className="text-lg font-bold text-primary">¥{plan.discount_price}</span>
                            <Badge variant="outline" className="text-xs">学生专享</Badge>
                          </div>
                          {plan.duration_months === 3 && (
                            <p className="text-xs text-muted-foreground mt-1">月均¥26.3，省¥20</p>
                          )}
                          {plan.duration_months === 12 && (
                            <p className="text-xs text-muted-foreground mt-1">月均¥16.6，省¥100</p>
                          )}
                        </div>
                        <Button onClick={() => handleBuyVip(plan)} size="sm">立即购买</Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Enterprise会员套餐 */}
              <Card className="border-2 border-yellow-500/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <Sparkles className="h-5 w-5 text-yellow-500" />
                      <span>企业会员</span>
                    </CardTitle>
                    <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500">尊享</Badge>
                  </div>
                  <CardDescription>适合追求高质量发展的学习者</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {['高级会员全部权益', '1对1职业规划（AI+人工）', '名企项目实训机会', '专属成长顾问', '学习档案1对1人工精修', '名企实训绿色通道', '优先参加线下活动'].map((feature, idx) => (
                      <div key={idx} className="flex items-center space-x-2 text-sm">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3 pt-4">
                    {plans.filter(p => p.vip_level === 'enterprise').map((plan) => (
                      <div key={plan.id} className="flex items-center justify-between rounded-lg border p-3 hover:border-primary/50 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{plan.duration_months}个月</p>
                            {plan.duration_months === 12 && (
                              <Badge variant="secondary" className="text-xs">校招首选</Badge>
                            )}
                          </div>
                          <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-xs text-muted-foreground line-through">¥{plan.original_price}</span>
                            <span className="text-lg font-bold text-primary">¥{plan.discount_price}</span>
                            <Badge variant="outline" className="text-xs">学生专享</Badge>
                          </div>
                          {plan.duration_months === 3 && (
                            <p className="text-xs text-muted-foreground mt-1">月均¥66.3，省¥60</p>
                          )}
                          {plan.duration_months === 12 && (
                            <p className="text-xs text-muted-foreground mt-1">月均¥49.9，省¥200</p>
                          )}
                        </div>
                        <Button onClick={() => handleBuyVip(plan)} size="sm">立即购买</Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            {orders.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CreditCard className="h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-muted-foreground">暂无订单记录</p>
                </CardContent>
              </Card>
            ) : (
              orders.map((order) => (
                <Card key={order.id}>
                  <CardContent className="flex items-center justify-between p-6">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-semibold">订单号：{order.order_no}</p>
                        {getPaymentStatusBadge(order.payment_status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {order.vip_level === 'premium' ? '高级会员' : '企业会员'} · {order.duration_months}个月
                      </p>
                      <p className="text-sm text-muted-foreground">
                        创建时间：{new Date(order.created_at).toLocaleString('zh-CN')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">¥{order.actual_price}</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* 全屏支付弹窗 */}
      {isPaymentDialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          style={{ animation: 'fadeIn 0.25s ease' }}
          onClick={(e) => { if (e.target === e.currentTarget) setIsPaymentDialogOpen(false); }}
        >
          <style>{`
            @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
            @keyframes slideUp { from { opacity: 0; transform: translateY(40px) scale(0.95) } to { opacity: 1; transform: translateY(0) scale(1) } }
            @keyframes scanLine { 0%,100% { top: 4px } 50% { top: calc(100% - 4px) } }
            .payment-card { animation: slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1) both; }
            .scan-line { animation: scanLine 2.4s ease-in-out infinite; }
          `}</style>

          <div className="payment-card relative mx-4 w-full max-w-sm rounded-2xl bg-card shadow-2xl overflow-hidden">
            {/* 顶部渐变装饰 */}
            <div className="h-2 w-full bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500" />

            {/* 关闭按钮 */}
            <button
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
              onClick={() => setIsPaymentDialogOpen(false)}
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex flex-col items-center px-8 pb-8 pt-6 space-y-4">
              {/* 标题 */}
              <div className="text-center space-y-1">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl">💚</span>
                  <h2 className="text-xl font-bold">微信扫码支付</h2>
                </div>
                {selectedPlan && (
                  <p className="text-sm text-muted-foreground">
                    {selectedPlan.vip_level === 'premium' ? '高级会员' : '企业会员'}
                    {' · '}{selectedPlan.duration_months}个月
                  </p>
                )}
              </div>

              {/* 金额 */}
              <div className="flex items-baseline gap-1">
                <span className="text-lg text-muted-foreground">¥</span>
                <span className="text-5xl font-bold text-primary">
                  {isStudentVerified && selectedPlan?.id === 'premium' 
                    ? selectedPlan.discount_price - 10 
                    : selectedPlan?.discount_price}
                </span>
              </div>

              {/* 二维码区域 */}
              <div className="relative flex min-h-52 w-52 items-center justify-center rounded-2xl border-4 border-green-400/40 bg-white p-3 shadow-inner overflow-hidden">
                {isCreatingOrder ? (
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <span className="animate-spin text-4xl">⏳</span>
                    <span className="mt-2 text-sm">生成订单中...</span>
                  </div>
                ) : paymentQrCode ? (
                  paymentQrCode.startsWith('mock://') ? (
                    <div className="flex flex-col items-center justify-center space-y-4 py-2 px-2 text-center w-full">
                      <div className="text-yellow-600 font-medium text-xs">（当前为演示环境）</div>
                      <Button size="sm" onClick={async () => {
                        // 触发模拟支付回调的 webhook 逻辑或直接改库
                        toast.loading('模拟支付处理中...');
                        try {
                          await supabase.from('orders').update({ payment_status: 1 }).eq('order_no', paymentOrderNo);
                          // 给会员
                          const expireDate = new Date();
                          expireDate.setMonth(expireDate.getMonth() + (selectedPlan?.duration_months || 1));
                          await supabase.from('user_profiles').update({ vip_level: selectedPlan?.vip_level || selectedPlan?.id, vip_expire_at: expireDate.toISOString() }).eq('id', user?.id);
                          
                          // 分销逻辑
                          const { data: userProfile } = await supabase.from('user_profiles').select('invited_by').eq('id', user?.id).single();
                          if (userProfile?.invited_by) {
                            const { data: orderData } = await supabase.from('orders').select('actual_price, id').eq('order_no', paymentOrderNo).single();
                            if (orderData) {
                              const rewardAmount = (Number(orderData.actual_price) * 0.15).toFixed(2);
                              await supabase.from('affiliate_rewards').insert({
                                promoter_id: userProfile.invited_by,
                                invitee_id: user?.id,
                                order_id: orderData.id,
                                reward_amount: rewardAmount,
                                status: 0
                              });
                            }
                          }
                          toast.dismiss();
                          toast.success('模拟支付成功！');
                          setIsPaymentDialogOpen(false);
                          if (updateUser) {
                            updateUser({ vip_level: selectedPlan?.vip_level || selectedPlan?.id as any });
                          }
                        } catch(e:any) {
                          toast.dismiss();
                          toast.error(e.message);
                        }
                      }}>模拟支付成功</Button>
                    </div>
                  ) : (
                    <>
                      <QRCodeDataUrl text={paymentQrCode} width={180} />
                      {/* 扫描动画线 */}
                      <div className="scan-line pointer-events-none absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-80" />
                    </>
                  )
                ) : (
                  <div className="text-center text-sm text-destructive">获取二维码失败</div>
                )}
              </div>

              {/* 说明 */}
              <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                <ScanLine className="h-4 w-4" />
                <span>请使用微信扫一扫完成支付</span>
              </div>

              {/* 须知 */}
              <div className="w-full rounded-xl bg-muted/60 p-4 space-y-2">
                {[
                  '支付成功后系统自动开通，无需等待',
                  '支付遇到问题可刷新重试',
                  '如有疑问请联系客服：176-9309-1102',
                ].map((tip, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-500" />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>

              <div className="flex w-full gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsPaymentDialogOpen(false)}
                >
                  取消支付
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 学生认证对话框 */}
      {user?.id && (
        <StudentVerificationDialog
          open={isVerificationDialogOpen}
          onOpenChange={setIsVerificationDialogOpen}
          userId={user.id}
          onVerificationComplete={() => {
            checkStudentVerification();
            toast.success('认证申请已提交，请等待审核');
          }}
        />
      )}
    </div>
  );
}
