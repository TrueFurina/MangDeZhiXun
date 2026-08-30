import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Target, ArrowRight, BrainCircuit, Activity, Cpu, GraduationCap, Briefcase, Zap, Loader2 } from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export default function JDAnalysisPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [company, setCompany] = useState(searchParams.get('company') || '');
  const [jobTitle, setJobTitle] = useState('');
  const [jdText, setJdText] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!company || !jobTitle || !jdText) {
      toast.error('请填写完整的企业、岗位及JD信息');
      return;
    }

    setLoading(true);
    toast.loading('正在深度拆解 JD 并对比您的画像...', { id: 'analyze' });
    
    try {
      // 模拟调用大模型进行JD解析和画像比对
      // 真实业务中这里应调用类似 ai-interview-engine 的 Edge Function
      const { data, error } = await supabase.functions.invoke('ai-jd-analyzer', {
        body: {
          action: 'analyze',
          company,
          jobTitle,
          jdText
        }
      });
      
      if (error) throw error;
      
      setAnalysisResult(data);
      // 持久化完整分析结果（含雷达图与缺口），供能力匹配分析页读取
      try {
        localStorage.setItem('target_jd_analysis', JSON.stringify({
          company,
          jobTitle,
          requirements: data?.core_skills || [],
          shortcomings: data?.shortcomings || [],
          radar_data: data?.radar_data || [],
          saved_at: new Date().toISOString(),
        }));
      } catch { /* 忽略存储异常 */ }
      toast.success('拆解完成！', { id: 'analyze' });
    } catch (err) {
      console.error(err);
      toast.error('JD拆解失败，请重试', { id: 'analyze' });
    } finally {
      setLoading(false);
    }
  };

  const startTargetedInterview = () => {
    if (!analysisResult) return;
    // 将解析结果保存，并跳转到AI面试页（此处简化，通过 state 或 localStorage 传递）
    localStorage.setItem('target_jd_analysis', JSON.stringify({
      company,
      jobTitle,
      requirements: analysisResult.core_skills,
      shortcomings: analysisResult.shortcomings
    }));
    navigate('/student/ai-interview');
  };

  return (
    <div className="container py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">目标企业靶向拆解与对齐</h1>
        <p className="text-muted-foreground mt-2">将您心仪岗位的具体要求与自身能力画像进行数据级比对，找到隐性差距。</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5 text-primary"/> 录入真实JD</CardTitle>
              <CardDescription>从BOSS直聘或智联招聘粘贴目标岗位的真实描述</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">目标企业名称</label>
                <Input value={company} onChange={e => setCompany(e.target.value)} placeholder="例如：宁德时代" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">应聘岗位名称</label>
                <Input value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="例如：Java开发工程师" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">岗位职责与任职要求 (JD)</label>
                <Textarea 
                  className="min-h-[250px] resize-none" 
                  value={jdText} 
                  onChange={e => setJdText(e.target.value)}
                  placeholder="请粘贴完整的职位描述..." 
                />
              </div>
              <Button onClick={handleAnalyze} disabled={loading} className="w-full">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BrainCircuit className="mr-2 h-4 w-4" />}
                执行深度解析与画像比对
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {!analysisResult ? (
            <Card className="h-full flex items-center justify-center bg-muted/30 border-dashed">
              <div className="text-center p-8 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>录入JD后，将在此展示画像差距与靶向雷达图</p>
              </div>
            </Card>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-8">
              <Card className="border-primary/20 shadow-md">
                <CardHeader className="bg-primary/5 pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary"/>
                    核心竞争力比对
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold flex items-center gap-1"><Cpu className="h-4 w-4 text-blue-500"/> 核心技能项要求</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.core_skills?.map((s: string, i: number) => (
                        <Badge key={i} variant="secondary" className="bg-blue-500/10 text-blue-700 hover:bg-blue-500/20">{s}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-bold flex items-center gap-1"><GraduationCap className="h-4 w-4 text-green-500"/> 软素质与隐性门槛</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.soft_skills?.map((s: string, i: number) => (
                        <Badge key={i} variant="outline" className="border-green-500/30 text-green-700">{s}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={analysisResult.radar_data}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" className="text-xs" />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} />
                        <Radar name="我的能力" dataKey="A" stroke="#165DFF" fill="#165DFF" fillOpacity={0.5} />
                        <Radar name="JD要求" dataKey="B" stroke="#F76560" fill="#F76560" fillOpacity={0.3} />
                      </RadarChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center gap-4 text-xs mt-2">
                      <div className="flex items-center gap-1"><span className="w-3 h-3 bg-[#165DFF] opacity-50 rounded-sm"></span> 我的画像</div>
                      <div className="flex items-center gap-1"><span className="w-3 h-3 bg-[#F76560] opacity-30 rounded-sm"></span> 岗位期望</div>
                    </div>
                  </div>

                  <div className="p-4 bg-orange-500/5 rounded-lg border border-orange-500/20">
                    <h4 className="font-bold text-orange-700 flex items-center gap-2 mb-2">
                      <Zap className="h-4 w-4"/> 您的短板与致命差距
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-orange-800/80">
                      {analysisResult.shortcomings?.map((s: string, i: number) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex gap-4">
                    <Button onClick={startTargetedInterview} className="flex-1 bg-primary hover:bg-primary/90 text-white" size="lg">
                      带着差距发起靶向AI特训 <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button onClick={() => navigate('/student/resume-assistant')} variant="outline" className="flex-1" size="lg">
                      基于该 JD 进行智能简历优化
                    </Button>
                  </div>
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    AI面试官将根据上述差距死死咬住你的短板进行高压追问
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}