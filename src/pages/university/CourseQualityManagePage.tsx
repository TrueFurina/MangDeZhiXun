import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, ShieldCheck, AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function CourseQualityManagePage() {
  const [content, setContent] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleEvaluate = async () => {
    if (!content.trim()) {
      toast.error('请输入需要自检的内容');
      return;
    }

    setIsEvaluating(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('skill-evaluator', {
        body: {
          action: 'evaluate',
          content: content,
          type: 'course'
        }
      });

      if (error) throw error;
      setResult(data);
      toast.success('质检完成');
    } catch (error) {
      console.error(error);
      toast.error('质检失败，请重试');
    } finally {
      setIsEvaluating(false);
    }
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case '低风险':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle2 className="w-3 h-3 mr-1" /> 低风险</Badge>;
      case '中风险':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><AlertTriangle className="w-3 h-3 mr-1" /> 中风险</Badge>;
      case '高风险':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" /> 高风险</Badge>;
      default:
        return <Badge variant="secondary">{level}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">教师辅用课程质检</h1>
        <p className="text-muted-foreground mt-2">上传自定义实训案例、课程内容，系统将自动进行质量与合规性自检</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>内容输入</CardTitle>
          <CardDescription>粘贴需要自检的课程或案例大纲</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="在此粘贴课程内容..."
            className="min-h-[200px]"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <Button onClick={handleEvaluate} disabled={isEvaluating || !content.trim()}>
            {isEvaluating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isEvaluating ? '正在质检...' : '开始合规与质量自检'}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <div className="grid md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>自检总览</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center justify-center py-4">
                <div className="text-5xl font-bold text-primary mb-2">{result.total_score}</div>
                <div className="text-sm text-muted-foreground">质量总分</div>
              </div>
              <div className="flex items-center justify-between border-t pt-4">
                <span className="text-sm font-medium">综合风险评级</span>
                {getRiskBadge(result.risk_level)}
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>多维度雷达与建议</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">结构完整性</p>
                  <p className="text-xl font-semibold">{result.structure_score}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">表述清晰度</p>
                  <p className="text-xl font-semibold">{result.clarity_score}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">触发合理性</p>
                  <p className="text-xl font-semibold">{result.trigger_score}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">合规风险</p>
                  <p className="text-xl font-semibold">{result.compliance_score}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">可维护性</p>
                  <p className="text-xl font-semibold">{result.maintainability_score}</p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  修复清单
                </h3>
                {result.fix_priority_list && result.fix_priority_list.length > 0 ? (
                  <div className="space-y-3">
                    {result.fix_priority_list.map((item: any, index: number) => (
                      <div key={index} className="p-3 bg-muted/50 rounded-lg text-sm space-y-2 border">
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-medium">{item.issue}</span>
                          {getRiskBadge(item.risk)}
                        </div>
                        <p className="text-muted-foreground">建议：{item.suggestion}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">恭喜！内容质量很高，无明显风险。</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}