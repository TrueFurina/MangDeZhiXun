import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Target, 
  Users, 
  TrendingUp, 
  Award,
  Sparkles,
  Building2,
  GraduationCap,
  Briefcase,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AboutPage() {
  const navigate = useNavigate();

  // 核心优势
  const advantages = [
    {
      title: '基于AI多智能体实现全流程自动化',
      description: '4个Agent协同工作，从能力建模到综合评估全程AI驱动',
      icon: Sparkles
    },
    {
      title: '基于真实行业标准反哺学习',
      description: '将企业用人要求转化为学习目标，打通学以致用闭环',
      icon: Users
    },
    {
      title: '自适应学习路径生成',
      description: '根据能力评估结果自动推荐成长计划',
      icon: TrendingUp
    },
    {
      title: '精准了解自身行业定位',
      description: '清晰了解自己的知识在行业中的定位与不足',
      icon: Award
    }
  ];

  // 服务对象
  const targets = [
    {
      title: '院校',
      icon: GraduationCap,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      services: [
        '学员学习应用能力评估',
        '职业规划指导',
        '能力发展数据分析',
        '校企对接服务'
      ]
    },
    {
      title: '企业',
      icon: Building2,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      services: [
        '行业标准模型生成',
        '人才能力对标',
        '知识短板分析',
        '学习效果追踪'
      ]
    },
    {
      title: '学员',
      icon: Briefcase,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      services: [
        'AI能力诊断',
        '能力画像分析',
        '学习路径规划',
        '综合测评训练'
      ]
    }
  ];

  // 商业成果
  const achievements = [
    { label: '累计学习用户', value: '1000+', unit: '人' },
    { label: '合作院校', value: '10+', unit: '所' },
    { label: '入驻行业标准', value: '50+', unit: '个' },
    { label: '评测准确率', value: '95%', unit: '+' }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* 头部 */}
      <div className="border-b bg-gradient-to-r from-primary/10 via-purple-500/10 to-orange-500/10">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">
            <Badge className="mb-4 bg-primary">
              <Sparkles className="mr-1 h-3 w-3" />
              AI驱动的人标准匹配平台
            </Badge>
            <h1 className="text-4xl font-bold">项目简介</h1>
            <p className="mx-auto mt-4 max-w-3xl text-lg text-muted-foreground">
              本项目聚焦新文科青年能力发展与企业人标准匹配效率低的核心痛点，基于胜任特征冰山模型，
              构建"AI多智能体驱动的人标准匹配引擎"
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto space-y-12 px-6 py-12">
        {/* 核心理念 */}
        <section>
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
            <CardHeader>
              <CardTitle className="text-2xl">核心理念</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg leading-relaxed">
                系统通过<strong className="text-primary">能力标准生成Agent</strong>、
                <strong className="text-primary">能力档案解析Agent</strong>、
                <strong className="text-primary">智能测评Agent</strong>与
                <strong className="text-primary">全真模拟答疑Agent</strong>协同工作，
                实现能力基座自动生成、人才能力智能评估与精准对标，
                <strong className="text-primary">基于行业真实标准反哺个性化学习</strong>。
              </p>
              <p className="text-lg leading-relaxed">
                项目已完成MVP开发并实现真实数据接入，累计学习用户1000+，与多所院校及企业达成合作。
                通过<strong className="text-primary">真实企业脱敏标准应用数据反哺机制</strong>，
                帮助学员实现个性化学习规划，显著降低教育机构课程开发成本，
                提升学生学习效率与能力图谱精准度，构建"校-企-学"三方协同的AI学习服务新范式。
              </p>
            </CardContent>
          </Card>
        </section>

        {/* 商业成果 */}
        <section>
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold">商业成果</h2>
            <p className="mt-2 text-muted-foreground">
              已完成MVP开发并实现商业验证
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {achievements.map((item, index) => (
              <Card key={index} className="border-2 text-center">
                <CardContent className="pt-6">
                  <div className="text-4xl font-bold text-primary">
                    {item.value}
                    <span className="text-2xl">{item.unit}</span>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    {item.label}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* 核心优势 */}
        <section>
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold">核心优势</h2>
            <p className="mt-2 text-muted-foreground">
              AI驱动的全流程自动化，显著提升效率、降低成本
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {advantages.map((item, index) => (
              <Card key={index} className="border-2">
                <CardHeader>
                  <div className="flex items-start space-x-3">
                    <div className="rounded-full bg-primary/10 p-3 text-primary">
                      <item.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      <CardDescription className="mt-2">
                        {item.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* 服务对象 */}
        <section>
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold">服务对象</h2>
            <p className="mt-2 text-muted-foreground">
              构建"院校-企业-用户"三方协同的AI人力资源服务新范式
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {targets.map((target, index) => (
              <Card key={index} className="border-2">
                <CardHeader className={target.bgColor}>
                  <div className="flex flex-col items-center text-center">
                    <div className={`rounded-full bg-background p-4 ${target.color}`}>
                      <target.icon className="h-8 w-8" />
                    </div>
                    <CardTitle className="mt-4 text-2xl">{target.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    {target.services.map((service, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-primary" />
                        <span className="text-sm">{service}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* 技术架构 */}
        <section>
          <Card className="border-2 bg-gradient-to-br from-purple-500/5 to-background">
            <CardHeader>
              <CardTitle className="text-2xl">技术架构</CardTitle>
              <CardDescription>
                基于多智能体（Multi-Agent）+ 大模型架构
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span className="font-semibold">多智能体协同决策机制</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span className="font-semibold">小样本动态建模</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span className="font-semibold">多模态数据融合（文本+行为）</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span className="font-semibold">AI全流程自动执行（OPC模式）</span>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <Button 
                    size="lg"
                    onClick={() => navigate('/ai-technology')}
                    className="bg-primary hover:bg-primary/90"
                  >
                    查看技术详情
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 应用场景 */}
        <section>
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold">应用场景</h2>
            <p className="mt-2 text-muted-foreground">
              覆盖人才培养全流程，提供一站式解决方案
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-2">
              <CardHeader>
                <CardTitle>能力标准生成</CardTitle>
                <CardDescription>
                  输入学习意向，AI自动生成完整的能力需求模型
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• 10秒生成行业对标能力基座</p>
                  <p>• 自动拆解能力权重和测评考察点</p>
                  <p>• 支持手动规划学习权重</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle>学习档案解析</CardTitle>
                <CardDescription>
                  AI自动解析履历，提取关键知识掌握情况
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• 3秒完成一份档案评估</p>
                  <p>• 自动对比标准产生能力雷达</p>
                  <p>• 智能推荐短板学习规划</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle>能力评估</CardTitle>
                <CardDescription>
                  多维度测评，生成能力画像
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• 15分钟完成全面评估</p>
                  <p>• 挖掘隐性能力和潜力</p>
                  <p>• 可视化报告展示</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle>AI答疑</CardTitle>
                <CardDescription>
                  智能答疑助手，实时评估表现
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• 20分钟完成初面</p>
                  <p>• 多维度评分和分析</p>
                  <p>• 自动生成评估报告</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle>人标准匹配</CardTitle>
                <CardDescription>
                  精准匹配，提升评估效率
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• 基于冰山模型深度匹配</p>
                  <p>• 提供差距分析和建议</p>
                  <p>• 匹配精准度提升30%+</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle>成长路径</CardTitle>
                <CardDescription>
                  个性化学习路径，持续提升
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• AI生成提升计划</p>
                  <p>• 关联学习资源</p>
                  <p>• 跟踪成长进度</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/10 to-purple-500/10">
            <CardContent className="py-12">
              <h2 className="text-3xl font-bold">开始体验AI人标准匹配</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                立即体验AI驱动的智能评估和职业发展服务
              </p>
              <div className="mt-8 flex justify-center space-x-4">
                <Button 
                  size="lg"
                  onClick={() => navigate('/student')}
                  className="bg-primary hover:bg-primary/90"
                >
                  用户端（学员端）体验
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/company')}
                >
                  企业端体验
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
