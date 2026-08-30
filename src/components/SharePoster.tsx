import { useRef, useState, useCallback } from 'react';
import html2canvas from 'html2canvas';
import { Download, Share2, Loader2, Sparkles, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

interface SharePosterProps {
  title?: string;
  subtitle?: string;
  scores: { dimension: string; score: number }[];
  overallScore?: number;
  userName?: string;
}

export function SharePoster({
  title = '我的能力雷达',
  subtitle = '芒得职训 · AI岗位胜任力智能服务平台',
  scores,
  overallScore,
  userName,
}: SharePosterProps) {
  const posterRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);

  const handleDownload = useCallback(async () => {
    if (!posterRef.current) return;
    setGenerating(true);
    try {
      const canvas = await html2canvas(posterRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
      });
      const link = document.createElement('a');
      link.download = `能力雷达-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success('海报已下载');
    } catch {
      toast.error('生成海报失败，请重试');
    } finally {
      setGenerating(false);
    }
  }, []);

  const avgScore = overallScore ?? (scores.length > 0
    ? Math.round(scores.reduce((s, d) => s + d.score, 0) / scores.length)
    : 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button onClick={handleDownload} disabled={generating} size="sm">
          {generating ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Download className="h-4 w-4 mr-1" />}
          {generating ? '生成中...' : '下载分享海报'}
        </Button>
        <Badge variant="outline" className="text-xs gap-1">
          <Share2 className="h-3 w-3" />PNG
        </Badge>
      </div>

      {/* 海报内容 */}
      <div ref={posterRef} className="rounded-2xl overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 p-6 border">
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-1.5 mb-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium text-primary">芒得职训</span>
          </div>
          <h2 className="text-lg font-bold text-foreground">{userName ? `${userName}的` : ''}{title}</h2>
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        </div>

        <div className="flex items-center gap-4">
          {/* 综合分 */}
          <div className="text-center shrink-0">
            <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center">
              <div>
                <div className="text-2xl font-bold text-primary">{avgScore}</div>
                <p className="text-[10px] text-muted-foreground">综合分</p>
              </div>
            </div>
          </div>
          {/* 雷达图 */}
          <div className="flex-1 min-w-0" style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={scores} outerRadius="70%">
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} />
                <Radar dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.25} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Award className="h-3.5 w-3.5" />
            <span>AI 智能测评 · 真实可信</span>
          </div>
          <span className="text-[10px] text-muted-foreground">{new Date().toLocaleDateString('zh-CN')}</span>
        </div>
      </div>
    </div>
  );
}

// 便捷弹窗用法示例（可在任意页面嵌入）
export function SharePosterCard(props: SharePosterProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <SharePoster {...props} />
      </CardContent>
    </Card>
  );
}