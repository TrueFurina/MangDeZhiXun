import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Target, Zap, BrainCircuit, Activity, ChevronRight } from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { AIInterviewRecord } from '@/types/portrait';

export default function AIInterviewReportPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState<AIInterviewRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecord();
  }, [id]);

  const loadRecord = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_interview_record')
        .select(`
          *,
          user:user_profiles(id, nickname),
          portrait:user_portrait(basic_info, ability_portrait)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      setRecord(data);
    } catch (err: any) {
      toast.error('加载报告失败: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">加载中...</div>;
  }

  if (!record) {
    return <div className="p-8 text-center text-muted-foreground">报告不存在</div>;
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">深度面试报告</h1>
          <p className="text-muted-foreground">完成时间：{new Date(record.end_time || record.created_at || '').toLocaleString()}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-primary" />
              逻辑思维
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{record.logic_score || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">满分 100</p>
          </CardContent>
        </Card>
        
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-accent" />
              抗压能力
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">{record.pressure_score || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">满分 100</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-orange-500" />
              情境应对
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-500">{record.scenario_score || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">满分 100</p>
          </CardContent>
        </Card>
        
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-500" />
              专业技能
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-500">{record.skill_score || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">满分 100</p>
          </CardContent>
        </Card>
      </div>

      {record.interview_type === 'video' && record.video_features && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle>视频特征分析</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-muted/30 p-4 rounded-lg">
              <div>
                <div className="text-sm text-muted-foreground">微表情</div>
                <div className="font-medium mt-1">{record.video_features.micro_expression || '-'}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">仪态</div>
                <div className="font-medium mt-1">{record.video_features.posture || '-'}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">眼神接触</div>
                <div className="font-medium mt-1">{record.video_features.eye_contact || '-'}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">情绪稳定性得分</div>
                <div className="font-medium mt-1 text-primary">{record.video_features.emotion_stability || '-'}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-border">
        <CardHeader>
          <CardTitle>靶向能力达成度评估</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-8 items-center">
          <div className="h-[300px] w-full md:w-1/2">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                { subject: '逻辑思维', score: record.logic_score || 0, fullMark: 100 },
                { subject: '抗压能力', score: record.pressure_score || 0, fullMark: 100 },
                { subject: '情境应对', score: record.scenario_score || 0, fullMark: 100 },
                { subject: '专业技能', score: record.skill_score || 0, fullMark: 100 },
                { subject: '表达沟通', score: 85, fullMark: 100 }
              ]}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar name="面试表现" dataKey="score" stroke="#165DFF" fill="#165DFF" fillOpacity={0.6} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="w-full md:w-1/2 space-y-4">
             <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-bold text-sm mb-2">综合对齐建议</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  经过高压靶向测试，您的【专业技能】和【逻辑思维】基本达到了目标 JD 的要求，但在【情境应对】环节表现出了一定的项目经验不足。建议后续重点补充真实业务场景的实操经验。
                </p>
             </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>AI 面试官综合点评</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none text-foreground whitespace-pre-wrap">
            {record.ai_comment || '暂无点评'}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>面试记录详情</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {record.round_data && record.round_data.map((r: any, idx: number) => (
            <div key={idx} className="space-y-3 pb-6 border-b last:border-0 last:pb-0">
              <div className="flex gap-3">
                <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  Q{idx + 1}
                </div>
                <div className="pt-1 text-foreground font-medium">{r.question}</div>
              </div>
              <div className="flex gap-3 pl-11">
                <div className="shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold">
                  A
                </div>
                <div className="pt-1 text-muted-foreground">{r.answer}</div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}