import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Building2, GraduationCap, Settings, ArrowRight } from 'lucide-react';

export default function PortalPage() {
  const navigate = useNavigate();

  const portals = [
    {
      icon: Brain,
      title: '用户端（学员端）',
      desc: '综合能力测评、学习路径规划、能力与行业标准对标',
      path: '/student/login',
      color: 'bg-primary',
      features: ['智能测评', '全真模拟', '学习规划', '能力对标'],
    },
    {
      icon: Building2,
      title: '行业标准中心',
      desc: '能力需求建模、人才对标分析、行业数据概览',
      path: '/company/login',
      color: 'bg-success',
      features: ['能力建模', '行业对标', '数据看板', '标准分析'],
    },
    {
      icon: GraduationCap,
      title: '院校端（能力追踪看板）',
      desc: '能力发展数据看板、学员管理、校企合作、培养方案对接',
      path: '/university/login',
      color: 'bg-warning',
      features: ['能力数据', '学员管理', '校企合作', '产教融合'],
    },
    {
      icon: Settings,
      title: '系统管理后台',
      desc: '用户管理、权限管理、内容管理、数据统计',
      path: '/admin/login',
      color: 'bg-chart-4',
      features: ['用户管理', '内容管理', '数据统计', '系统配置'],
    },
  ];

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-primary/10 via-background to-primary/5 p-8">
      <div className="w-full max-w-6xl space-y-8">
        {/* 标题区 */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-32 w-32 items-center justify-center">
            <img 
              src="https://miaoda-conversation-file.cdn.bcebos.com/user-6m37scl45nuo/conv-a7lm1eejtyps/20260402/file-ao6wt1jg4um8.jpg@w_1659" 
              alt="芒小橘" 
              className="h-full w-full rounded-2xl object-cover"
            />
          </div>
          <h1 className="text-4xl font-bold">AI能力评估与个性化学习中心</h1>
          <p className="mt-3 text-xl text-muted-foreground">
            三位一体 · 产教融合 · 智能服务
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Button variant="outline" className="border-primary text-primary" onClick={() => navigate('/ai-technology')}>
              探索四端核心架构
            </Button>
            <Button variant="outline" className="border-purple-500 text-purple-600" onClick={() => navigate('/knowledge-graph')}>
              查看RAG知识图谱
            </Button>
          </div>
        </div>

        {/* 四大端侧入口 */}
        <div className="grid gap-6 md:grid-cols-2">
          {portals.map((portal) => {
            const Icon = portal.icon;
            return (
              <Card
                key={portal.title}
                className="group cursor-pointer transition-all hover:shadow-xl"
                onClick={() => navigate(portal.path)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div
                      className={`flex h-16 w-16 items-center justify-center rounded-xl ${portal.color}`}
                    >
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <ArrowRight className="h-6 w-6 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </div>
                  <CardTitle className="mt-4 text-2xl">{portal.title}</CardTitle>
                  <CardDescription className="text-base">{portal.desc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {portal.features.map((feature) => (
                        <span
                          key={feature}
                          className="rounded-full bg-muted px-3 py-1 text-xs font-medium"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                    <Button
                      className="w-full group-hover:bg-primary group-hover:text-white"
                      onClick={(e) => { e.stopPropagation(); navigate(portal.path); }}
                    >
                      进入系统
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* 底部说明 */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">200+</div>
                <div className="text-sm text-muted-foreground">行业能力标准</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-success">4维度</div>
                <div className="text-sm text-muted-foreground">能力基座模型</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-warning">全流程</div>
                <div className="text-sm text-muted-foreground">闭环服务</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 版权信息 */}
        <div className="text-center text-sm text-muted-foreground">
          <p>© 2026 AI能力评估与个性化学习中心 · 芒得很职</p>
          <p className="mt-1">联系邮箱：2468001320@qq.com</p>
        </div>
      </div>
    </div>
  );
}
