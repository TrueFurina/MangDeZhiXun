import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { User, Briefcase, TrendingUp, Award, ArrowRight, ExternalLink, History, FileText } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from 'recharts';

export default function ProfilePage() {
  const navigate = useNavigate();
  
  // 模拟数据
  const mockUser = {
    name: '张三',
    education: '本科',
    work_experience: 3,
    role: '模型工程师',
  };

  const mockMatches = [
    { 
      position_name: 'AI模型工程师', 
      match_score: 92.5, 
      salary_range: '15k-30k',
      job_url: 'https://www.zhipin.com/job_detail/?query=AI%E6%A8%A1%E5%9E%8B%E5%B7%A5%E7%A8%8B%E5%B8%88'
    },
    { 
      position_name: 'AI应用开发工程师', 
      match_score: 85.3, 
      salary_range: '12k-25k',
      job_url: 'https://www.zhipin.com/job_detail/?query=AI%E5%BA%94%E7%94%A8%E5%BC%80%E5%8F%91%E5%B7%A5%E7%A8%8B%E5%B8%88'
    },
    { 
      position_name: '全栈开发工程师', 
      match_score: 78.9, 
      salary_range: '15k-28k',
      job_url: 'https://www.zhipin.com/job_detail/?query=%E5%85%A8%E6%A0%88%E5%BC%80%E5%8F%91%E5%B7%A5%E7%A8%8B%E5%B8%88'
    },
  ];

  const mockSkills = [
    { name: 'Python编程', score: 85 },
    { name: '深度学习', score: 75 },
    { name: 'API调用', score: 80 },
    { name: '数据分析', score: 70 },
    { name: '沟通能力', score: 90 },
  ];

  // 雷达图数据
  const radarData = [
    { subject: 'Python编程', A: 85, fullMark: 100 },
    { subject: '深度学习', A: 75, fullMark: 100 },
    { subject: 'API调用', A: 80, fullMark: 100 },
    { subject: '数据分析', A: 70, fullMark: 100 },
    { subject: '沟通能力', A: 90, fullMark: 100 },
    { subject: '学习能力', A: 88, fullMark: 100 },
  ];

  // 评估历史 - 添加ID用于跳转
  const mockHistory = [
    { id: '1', date: '2026-03-12', role: '模型工程师', score: 85 },
    { id: '2', date: '2026-02-15', role: 'AI应用开发者', score: 78 },
    { id: '3', date: '2026-01-20', role: '产品经理', score: 72 },
  ];

  const handleViewJob = (jobUrl?: string) => {
    if (jobUrl) {
      window.open(jobUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleViewReport = (reportId: string) => {
    navigate(`/student/report/${reportId}`);
  };

  return (
    <div className="w-full">
      {/* 页面头部 */}
      <section className="bg-gradient-to-b from-muted/30 to-background py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="mb-4">个人中心</Badge>
            <h1 className="mb-4 text-4xl font-bold md:text-5xl">
              我的<span className="gradient-text">评估报告</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              查看你的能力评估结果和岗位匹配推荐
            </p>
          </div>
        </div>
      </section>

      {/* 内容区 */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* 左侧：个人信息 */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="shadow-card">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent">
                    <User className="h-12 w-12 text-white" />
                  </div>
                  <CardTitle className="text-2xl">{mockUser.name}</CardTitle>
                  <CardDescription>{mockUser.role}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">学历</span>
                    <span className="font-medium">{mockUser.education}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">工作经验</span>
                    <span className="font-medium">{mockUser.work_experience}年</span>
                  </div>
                  <Link to="/assessment" className="block">
                    <Button className="w-full" variant="outline" asChild>
                      <span>重新评估</span>
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-primary" />
                    <span>技能评分</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mockSkills.map((skill) => (
                    <div key={skill.name} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>{skill.name}</span>
                        <Badge variant="secondary">{skill.score}分</Badge>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-500"
                          style={{ width: `${skill.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <History className="h-5 w-5 text-primary" />
                    <span>测评历史</span>
                  </CardTitle>
                  <CardDescription>
                    查看你的历史测评记录和详细报告
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mockHistory.map((item) => (
                    <Card key={item.id} className="border hover:border-primary transition-colors">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex-1">
                            <div className="font-semibold text-base mb-1">{item.role}</div>
                            <div className="text-xs text-muted-foreground">{item.date}</div>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline" className="text-lg px-3 py-1">
                              {item.score}分
                            </Badge>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          className="w-full group"
                          onClick={() => handleViewReport(item.id)}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          查看详细报告
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* 右侧：匹配结果和雷达图 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 能力雷达图 */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>能力雷达图</CardTitle>
                  <CardDescription>
                    直观展示你的多维度能力分布
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis 
                        dataKey="subject" 
                        tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                      />
                      <PolarRadiusAxis 
                        angle={90} 
                        domain={[0, 100]}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                      />
                      <Radar 
                        name="能力值" 
                        dataKey="A" 
                        stroke="hsl(var(--primary))" 
                        fill="hsl(var(--primary))" 
                        fillOpacity={0.6}
                      />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* 岗位匹配推荐 */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Briefcase className="h-5 w-5 text-primary" />
                    <span>岗位匹配推荐</span>
                  </CardTitle>
                  <CardDescription>
                    根据你的能力评估，为你推荐以下岗位
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockMatches.map((match, index) => (
                    <Card key={index} className="border-2 hover:border-primary transition-colors">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold mb-1">
                              {match.position_name}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span className="flex items-center space-x-1">
                                <TrendingUp className="h-4 w-4" />
                                <span>{match.salary_range}</span>
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-primary">
                              {match.match_score}
                            </div>
                            <div className="text-xs text-muted-foreground">匹配度</div>
                          </div>
                        </div>
                        <Button 
                          className="w-full group" 
                          onClick={() => handleViewJob(match.job_url)}
                        >
                          查看标准详情
                          <ExternalLink className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>

              {/* 提升建议 */}
              <Card className="shadow-card bg-gradient-to-r from-primary/10 to-accent/10">
                <CardHeader>
                  <CardTitle>💡 提升建议</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <span className="text-primary font-bold">•</span>
                    <p className="text-sm">
                      建议加强<strong>深度学习</strong>相关技能，可提升匹配度至95%以上
                    </p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-primary font-bold">•</span>
                    <p className="text-sm">
                      推荐学习<strong>模型优化</strong>和<strong>算法实现</strong>相关课程
                    </p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-primary font-bold">•</span>
                    <p className="text-sm">
                      可以尝试参与开源项目，积累实战经验，提升综合竞争力
                    </p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-primary font-bold">•</span>
                    <p className="text-sm">
                      关注AI行业最新动态，保持技术敏感度和学习热情
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
