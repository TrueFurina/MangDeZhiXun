import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Sparkles, Loader2, TrendingUp, MessageSquare, Lightbulb, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface NegotiationData {
  salary_range: string;
  market_reference: string;
  negotiation_strategy: string;
  talking_points: string[];
  counter_offer_template: string;
  tips: string[];
}

export default function SalaryNegotiatorPage() {
  const navigate = useNavigate();
  const [position, setPosition] = useState('');
  const [companies, setCompanies] = useState('');
  const [currentOffer, setCurrentOffer] = useState('');
  const [strengths, setStrengths] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<NegotiationData | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!position.trim()) { toast.error('请填写目标岗位'); return; }
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('ai-salary-negotiator', {
        body: {
          position: position.trim(),
          companies: companies.split(/[,，、\s]+/).filter(Boolean),
          currentOffer: currentOffer.trim(),
          myStrengths: strengths.split(/[,，、\s]+/).filter(Boolean),
        },
      });
      if (error) {
        let msg = '生成失败';
        try {
          const errJson = JSON.parse(await error.context?.text?.() || '{}');
          msg = errJson.error || msg;
        } catch { /* 忽略 */ }
        throw new Error(msg);
      }
      if (data?.success && data.data) {
        setResult(data.data);
        toast.success('薪资谈判建议已生成');
      } else {
        throw new Error(data?.error || '生成失败');
      }
    } catch (err: any) {
      toast.error(err?.message || '生成失败');
    } finally {
      setLoading(false);
    }
  };

  const copyTemplate = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.counter_offer_template);
      setCopied(true);
      toast.success('话术模板已复制');
      setTimeout(() => setCopied(false), 2000);
    } catch { toast.error('复制失败'); }
  };

  return (
    <div className="container py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">薪资谈判助手</h1>
          <p className="text-muted-foreground text-sm mt-1">
            基于多企业对比数据，AI 生成个性化薪资谈判话术与区间建议
          </p>
        </div>
      </div>

      {/* 输入表单 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">填写谈判背景</CardTitle>
          <CardDescription>提供的信息越详细，谈判建议越精准</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>目标岗位 *</Label>
              <Input value={position} onChange={e => setPosition(e.target.value)} placeholder="如：嵌入式软件工程师" />
            </div>
            <div className="space-y-1.5">
              <Label>候选企业（逗号分隔）</Label>
              <Input value={companies} onChange={e => setCompanies(e.target.value)} placeholder="如：宁德时代,比亚迪,华为" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>当前Offer/期望薪资</Label>
              <Input value={currentOffer} onChange={e => setCurrentOffer(e.target.value)} placeholder="如：15K·14薪 或 期望20K" />
            </div>
            <div className="space-y-1.5">
              <Label>个人优势（逗号分隔）</Label>
              <Input value={strengths} onChange={e => setStrengths(e.target.value)} placeholder="如：3段项目经验,竞赛获奖,核心技能" />
            </div>
          </div>
          <Button onClick={handleGenerate} disabled={loading} className="w-full md:w-auto">
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />AI 分析中...</> : <><Sparkles className="h-4 w-4 mr-2" />生成谈判建议</>}
          </Button>
        </CardContent>
      </Card>

      {/* 结果 */}
      {result && (
        <div className="space-y-4">
          {/* 薪资区间 */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-muted-foreground mb-1">建议薪资区间</p>
                  <p className="text-2xl font-bold text-primary">{result.salary_range}</p>
                  <p className="text-sm text-muted-foreground mt-2 text-pretty">{result.market_reference}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 谈判策略 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">整体谈判策略</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-pretty">{result.negotiation_strategy}</p>
            </CardContent>
          </Card>

          {/* 谈判要点 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />谈判话术要点
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {result.talking_points?.map((tp, i) => (
                  <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/50">
                    <Badge variant="outline" className="text-xs shrink-0 mt-0.5">{i + 1}</Badge>
                    <p className="text-sm text-pretty">{tp}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 反报价话术模板 */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">薪资反报价话术模板</CardTitle>
                <Button variant="ghost" size="sm" onClick={copyTemplate}>
                  {copied ? <><Check className="h-3.5 w-3.5 mr-1" />已复制</> : <><Copy className="h-3.5 w-3.5 mr-1" />复制</>}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="p-3 rounded-lg bg-muted/50 border">
                <p className="text-sm leading-relaxed text-pretty whitespace-pre-wrap">{result.counter_offer_template}</p>
              </div>
            </CardContent>
          </Card>

          {/* 注意事项 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />谈判注意事项
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1.5">
                {result.tips?.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-primary shrink-0">•</span>
                    <span className="text-pretty">{tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}