import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Target, TrendingUp, Users, Zap, ArrowRight, Sparkles } from 'lucide-react';

const roles = [
  {
    id: 'model-engineer',
    name: '模型工程师',
    icon: Brain,
    description: '负责底层代码、模型优化、算法实现',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    id: 'ai-developer',
    name: 'AI应用开发者',
    icon: Zap,
    description: '负责模型调用、Agent逻辑编排与搭建、应用部署',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    id: 'product-manager',
    name: '产品经理',
    icon: Target,
    description: '负责问题定义、需求拆解与分析、产品结构与功能设计',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    id: 'designer',
    name: '设计师',
    icon: Sparkles,
    description: '负责界面、交互体验、视觉与使用流程',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
  },
  {
    id: 'vibe-coder',
    name: 'Vibe Coder',
    icon: Zap,
    description: '擅长用AI/Prompt/低代码/工具拼装快速做出原型与Demo',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  {
    id: 'industry-expert',
    name: '行业/场景专家',
    icon: Users,
    description: '来自具体行业，提供真实需求、应用场景与问题定义',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
  },
  {
    id: 'content-creator',
    name: '内容创作者/传播者',
    icon: TrendingUp,
    description: '擅长产品表达Demo展示、故事讲述与传播',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
  {
    id: 'ai-learner',
    name: 'AI初学者/学生探索者',
    icon: Brain,
    description: '正在学习AI，希望通过实战快速成长',
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
  },
];

export default function HomePage() {
  return (
    <div className="w-full">
      {/* 英雄区 */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/30 py-20 md:py-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />
        </div>

        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <Badge className="mb-6">新质生产力 · AI人才评估</Badge>
            
            <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
              AI标准
              <span className="gradient-text">胜任力评估</span>
              <br />
              智能匹配平台
            </h1>

            <p className="mb-10 text-lg text-muted-foreground md:text-xl">
              基于多模态数据采集与机器学习算法
              <br className="hidden md:block" />
              精准评估AI时代人才核心能力，智能推荐最适合的实训标准
            </p>

            <div className="flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
              <Link to="/assessment">
                <Button size="lg" className="gradient-primary group" asChild>
                  <span>
                    开始评估
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Button>
              </Link>
              <Link to="/positions">
                <Button size="lg" variant="outline" asChild>
                  <span>浏览标准</span>
                </Button>
              </Link>
            </div>

            {/* 统计数据 */}
            <div className="mt-16 grid grid-cols-2 gap-8 md:grid-cols-4">
              <div className="space-y-2">
                <div className="text-3xl font-bold text-primary md:text-4xl">8</div>
                <div className="text-sm text-muted-foreground">AI角色定位</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-primary md:text-4xl">60+</div>
                <div className="text-sm text-muted-foreground">核心技能维度</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-primary md:text-4xl">18+</div>
                <div className="text-sm text-muted-foreground">AI相关标准</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-primary md:text-4xl">95%</div>
                <div className="text-sm text-muted-foreground">匹配准确率</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 角色定位 */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              找到你的<span className="gradient-text">AI角色定位</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              8种AI时代核心角色，选择最符合你能力定位的方向
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <Card
                  key={role.id}
                  className="group transition-all duration-300 hover:shadow-hover hover:-translate-y-1 cursor-pointer"
                >
                  <CardHeader>
                    <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg ${role.bgColor} ${role.color} transition-colors`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-lg">{role.name}</CardTitle>
                    <CardDescription className="text-sm">{role.description}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <Link to="/assessment">
              <Button size="lg" variant="outline" className="group" asChild>
                <span>
                  开始角色测评
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 平台特色 */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">
              <span className="gradient-text">核心优势</span>
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="shadow-card hover:shadow-hover transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>🎯</span>
                  <span>多维度评估</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  结合技能、行为、背景等多维度数据，全面评估AI时代胜任力，提供精准的能力画像
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-hover transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>🤖</span>
                  <span>智能算法匹配</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  基于余弦相似度算法，精准计算能力达标率，推荐最适合的学习方向和发展路径
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-hover transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>📊</span>
                  <span>可视化分析</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  直观的雷达图和数据分析，清晰展示能力优势和提升方向，助力职业发展规划
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-hover transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>🔗</span>
                  <span>真实标准对接</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  直接对接Boss直聘等主流需求平台，一键跳转查看真实标准详情，快速开启学习之旅
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-hover transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>📈</span>
                  <span>评估历史追踪</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  记录每次评估结果，追踪能力成长轨迹，见证你的职业发展历程
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-hover transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>💡</span>
                  <span>个性化建议</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  基于评估结果提供针对性提升建议，帮助你明确学习方向，快速提升竞争力
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-primary to-accent">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
            开启你的AI职业之旅
          </h2>
          <p className="mb-8 text-lg text-white/90">
            立即评估你的AI胜任力，发现最适合的学习方向
          </p>
          <Link to="/assessment">
            <Button size="lg" variant="secondary" className="group" asChild>
              <span>
                免费评估
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
