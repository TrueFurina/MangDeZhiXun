import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Check, Sparkles, Zap, Crown, ArrowRight, QrCode, MessageCircle } from 'lucide-react';

export default function SubscriptionPlanPage() {
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{ name: string; price: string } | null>(null);
  const [selectedAddon, setSelectedAddon] = useState<{ name: string; price: string } | null>(null);
  const plans = [
    {
      name: '基础版',
      price: '980',
      period: '年',
      icon: Zap,
      color: 'primary',
      description: '适合初创企业和小团队',
      features: [
        '5个在招标准',
        '100份能力档案解析/月',
        '基础标准自动生成',
        '人标准匹配度分析',
        '邮件支持',
      ],
      limitations: [
        'AI生成次数：10次/月',
        '数据导出：基础格式',
        '用户数：3个',
      ]
    },
    {
      name: '专业版',
      price: '2,980',
      period: '年',
      icon: Sparkles,
      color: 'success',
      description: '适合成长型企业',
      popular: true,
      features: [
        '20个在招标准',
        '500份能力档案解析/月',
        '高级标准自动生成',
        '智能能力档案筛选',
        '标准推介漏斗分析',
        '测评管理功能',
        '电话+邮件支持',
      ],
      limitations: [
        'AI生成次数：50次/月',
        '数据导出：全格式',
        '用户数：10个',
      ]
    },
    {
      name: '企业版',
      price: '9,800',
      period: '年',
      icon: Crown,
      color: 'warning',
      description: '适合大型企业和集团',
      features: [
        '无限在招标准',
        '无限能力档案解析',
        '定制化胜任力模型',
        'AI测评助手',
        '多维度数据分析',
        '测评管理+题库',
        '专属客户经理',
        'API接口对接',
        '私有化部署（可选）',
      ],
      limitations: [
        'AI生成次数：无限',
        '数据导出：全格式+定制',
        '用户数：无限',
      ]
    },
  ];

  const addons = [
    { name: 'AI生成次数包', price: '199', unit: '100次' },
    { name: '能力档案解析包', price: '299', unit: '1000份' },
    { name: '额外用户席位', price: '99', unit: '人/月' },
    { name: '定制化报告', price: '1,999', unit: '次' },
  ];

  const getIconColor = (color: string) => {
    switch (color) {
      case 'primary': return 'bg-primary';
      case 'success': return 'bg-success';
      case 'warning': return 'bg-warning';
      default: return 'bg-primary';
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">订阅套餐</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          选择适合您企业的套餐，开启智能标准推介之旅
        </p>
        <div className="mt-4 flex items-center justify-center space-x-2">
          <Badge variant="outline" className="border-success text-success">
            ✓ 7天免费试用
          </Badge>
          <Badge variant="outline" className="border-primary text-primary">
            ✓ 随时取消
          </Badge>
          <Badge variant="outline" className="border-warning text-warning">
            ✓ 按年付享8折
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {plans.map((plan, index) => {
          const Icon = plan.icon;
          return (
            <Card
              key={index}
              className={`relative transition-all ${
                plan.popular ? 'border-success shadow-lg ring-2 ring-success' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-success px-4 py-1">最受欢迎</Badge>
                </div>
              )}
              <CardHeader className="text-center">
                <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${getIconColor(plan.color)}`}>
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="mt-4 text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">¥{plan.price}</span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="text-sm font-semibold">核心功能</div>
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start space-x-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 rounded-lg bg-muted p-3">
                  <div className="text-xs font-semibold text-muted-foreground">使用限制</div>
                  {plan.limitations.map((limitation, idx) => (
                    <div key={idx} className="text-xs text-muted-foreground">
                      • {limitation}
                    </div>
                  ))}
                </div>

                <Button
                  className={`w-full ${
                    plan.popular ? 'bg-success hover:bg-success/90' : ''
                  }`}
                  onClick={() => {
                    setSelectedPlan({ name: plan.name, price: plan.price });
                    setSelectedAddon(null);
                    setShowPaymentDialog(true);
                  }}
                >
                  {plan.popular ? '立即订阅' : '选择套餐'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>增值服务</CardTitle>
          <CardDescription>按需购买，灵活扩展</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {addons.map((addon, index) => (
              <Card key={index} className="transition-shadow hover:shadow-md">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <div className="font-semibold">{addon.name}</div>
                      <div className="text-xs text-muted-foreground">{addon.unit}</div>
                    </div>
                    <div className="flex items-baseline space-x-1">
                      <span className="text-2xl font-bold text-primary">¥{addon.price}</span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full" 
                      onClick={() => {
                        setSelectedAddon({ name: addon.name, price: addon.price });
                        setSelectedPlan(null);
                        setShowPaymentDialog(true);
                      }}
                    >
                      购买
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-lg font-semibold">需要定制化方案？</div>
              <div className="text-sm text-muted-foreground">
                联系我们的销售团队，获取专属企业解决方案
              </div>
            </div>
            <Button variant="outline" onClick={() => setShowContactDialog(true)}>
              联系销售
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>常见问题</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { q: '如何升级套餐？', a: '您可以随时在账户设置中升级套餐，差价将按比例计算。' },
              { q: '是否支持退款？', a: '7天免费试用期内可随时取消，付费后不支持退款。' },
              { q: '发票如何开具？', a: '订阅成功后，系统将自动生成电子发票并发送至您的邮箱。' },
              { q: '是否支持私有化部署？', a: '企业版支持私有化部署，具体方案请联系销售团队。' },
            ].map((faq, index) => (
              <div key={index} className="space-y-2 rounded-lg border p-4">
                <div className="font-semibold">{faq.q}</div>
                <div className="text-sm text-muted-foreground">{faq.a}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 微信支付二维码模态窗口 */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <QrCode className="h-5 w-5 text-success" />
              <span>微信扫码支付</span>
            </DialogTitle>
            <DialogDescription>
              {selectedPlan && `${selectedPlan.name} - ¥${selectedPlan.price}/年`}
              {selectedAddon && `${selectedAddon.name} - ¥${selectedAddon.price}`}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4 py-6">
            <div className="rounded-lg border-4 border-success/20 p-4">
              <img 
                src="https://miaoda-conversation-file.cdn.bcebos.com/user-6m37scl45nuo/conv-a7lm1eejtyps/20260415/file-ayr6x1i0x1xc.png"
                alt="微信收款码"
                width={200}
                height={200}
                className="rounded"
              />
            </div>
            <div className="text-center space-y-2">
              <p className="text-lg font-semibold">
                ¥{selectedPlan?.price || selectedAddon?.price}
              </p>
              <p className="text-sm text-muted-foreground">
                请使用微信扫描二维码完成支付
              </p>
            </div>
            <div className="w-full space-y-2 rounded-lg bg-muted p-4">
              <div className="flex items-start space-x-2">
                <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-success" />
                <p className="text-xs text-muted-foreground">
                  支付成功后，系统将自动开通服务
                </p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-success" />
                <p className="text-xs text-muted-foreground">
                  如有疑问，请联系客服：176-9309-1102
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 微信企业二维码模态窗口 */}
      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5 text-success" />
              <span>联系销售团队</span>
            </DialogTitle>
            <DialogDescription>
              扫描二维码添加企业微信，获取专属服务
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4 py-6">
            <div className="rounded-lg border-4 border-success/20 p-4">
              <img 
                src="https://miaoda-conversation-file.cdn.bcebos.com/user-6m37scl45nuo/conv-a7lm1eejtyps/20260415/file-ayp9j4dfgb9c.png"
                alt="企业微信二维码"
                width={200}
                height={200}
                className="rounded"
              />
            </div>
            <div className="text-center space-y-2">
              <p className="text-lg font-semibold">企业微信</p>
              <p className="text-sm text-muted-foreground">
                扫码添加销售顾问微信
              </p>
            </div>
            <div className="w-full space-y-2 rounded-lg bg-muted p-4">
              <div className="flex items-start space-x-2">
                <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-success" />
                <p className="text-xs text-muted-foreground">
                  工作时间：周一至周五 9:00-18:00
                </p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-success" />
                <p className="text-xs text-muted-foreground">
                  销售热线：176-9309-1102
                </p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-success" />
                <p className="text-xs text-muted-foreground">
                  邮箱：1937975940@qq.com
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
