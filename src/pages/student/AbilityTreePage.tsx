import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Sparkles, Target, BookOpen, ArrowRight, Loader2, GraduationCap, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StaggerReveal } from '@/components/animations/Reveal';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface RadarPoint {
  subject: string;
  A: number;
  B: number;
  fullMark: number;
}

interface CourseItem {
  id: number;
  title: string;
  type: string;
  dimension: string;
  difficulty: string;
  duration: string;
  rating: number;
}

interface TreeNode {
  subject: string;
  current: number;
  target: number;
  gap: number;
  courses: CourseItem[];
}

const DIMENSION_MAP: Record<string, string[]> = {
  '核心技能': ['专业技能提升', '项目实战经验'],
  '软素质': ['行为特质塑造', '通用能力培养'],
  '项目经验': ['项目实战经验', '专业技能提升'],
  '学历背景': ['通用能力培养', '专业技能提升'],
  '综合竞争力': ['通用能力培养', '行为特质塑造'],
};

const BRANCH_COLORS = [
  { bg: 'bg-primary/10', border: 'border-primary/30', text: 'text-primary', bar: 'bg-primary' },
  { bg: 'bg-chart-2/10', border: 'border-chart-2/30', text: 'text-chart-2', bar: 'bg-chart-2' },
  { bg: 'bg-chart-3/10', border: 'border-chart-3/30', text: 'text-chart-3', bar: 'bg-chart-3' },
  { bg: 'bg-chart-4/10', border: 'border-chart-4/30', text: 'text-chart-4', bar: 'bg-chart-4' },
  { bg: 'bg-chart-5/10', border: 'border-chart-5/30', text: 'text-chart-5', bar: 'bg-chart-5' },
];

export default function AbilityTreePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [hasAnalysis, setHasAnalysis] = useState(false);
  const [treeNodes, setTreeNodes] = useState<TreeNode[]>([]);
  const [targetInfo, setTargetInfo] = useState<{ company?: string; position?: string }>({});
  const [expandedNode, setExpandedNode] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        let analysis: { radar_data?: RadarPoint[]; company?: string; jobTitle?: string } | null = null;
        try {
          const raw = localStorage.getItem('target_jd_analysis');
          if (raw) analysis = JSON.parse(raw);
        } catch { /* 忽略 */ }

        if (analysis?.radar_data && analysis.radar_data.length > 0) {
          setHasAnalysis(true);
          setTargetInfo({ company: analysis.company, position: analysis.jobTitle });
          await buildTree(analysis.radar_data);
        } else {
          setHasAnalysis(false);
        }
      } catch (e) {
        console.error('加载能力树失败', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const buildTree = async (radar: RadarPoint[]) => {
    const sorted = [...radar].sort((a, b) => (b.B - b.A) - (a.A - a.A));
    const allDimensions = new Set<string>();
    sorted.forEach(r => {
      const dims = DIMENSION_MAP[r.subject] || ['专业技能提升'];
      dims.forEach(d => allDimensions.add(d));
    });

    const { data: courseData } = await supabase
      .from('courses')
      .select('id, title, type, dimension, difficulty, duration, rating')
      .in('dimension', Array.from(allDimensions))
      .eq('status', 1)
      .order('rating', { ascending: false });

    const coursesByDim = new Map<string, CourseItem[]>();
    (courseData as CourseItem[] || []).forEach(c => {
      const arr = coursesByDim.get(c.dimension) || [];
      arr.push(c);
      coursesByDim.set(c.dimension, arr);
    });

    const nodes: TreeNode[] = sorted.map(r => {
      const dims = DIMENSION_MAP[r.subject] || ['专业技能提升'];
      const nodeCourses: CourseItem[] = [];
      dims.forEach(d => {
        (coursesByDim.get(d) || []).slice(0, 2).forEach(c => {
          if (!nodeCourses.find(nc => nc.id === c.id)) nodeCourses.push(c);
        });
      });
      return {
        subject: r.subject,
        current: r.A || 0,
        target: r.B || 0,
        gap: Math.max(0, (r.B || 0) - (r.A || 0)),
        courses: nodeCourses,
      };
    });

    setTreeNodes(nodes);
    if (nodes.length > 0) setExpandedNode(nodes[0].subject);
  };

  const overallScore = treeNodes.length > 0
    ? Math.round(treeNodes.reduce((s, n) => s + Math.min(n.current / (n.target || 1), 1) * 100, 0) / treeNodes.length)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-5xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">能力成长树</h1>
          <p className="text-muted-foreground text-sm mt-1">
            可视化你的能力结构，点亮每个维度的提升路径
          </p>
        </div>
      </div>

      {!hasAnalysis ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">尚未生成能力树</h3>
            <p className="text-muted-foreground text-sm mb-6 text-pretty max-w-md mx-auto">
              请先完成一次 JD 拆解分析，系统将基于你的能力雷达图自动生成专属能力成长树。
            </p>
            <Button onClick={() => navigate('/student/jd-analysis')}>
              <Sparkles className="h-4 w-4 mr-2" />
              前往 JD 拆解分析
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* 目标信息 + 总分 */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">当前目标</span>
                  </div>
                  <div className="text-lg font-semibold">
                    {targetInfo.position || '目标岗位'}
                    {targetInfo.company && <span className="text-muted-foreground font-normal"> · {targetInfo.company}</span>}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{overallScore}%</div>
                  <p className="text-xs text-muted-foreground">综合岗位匹配度</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 能力树 */}
          <div className="relative">
            {/* 根节点 */}
            <div className="flex justify-center mb-6">
              <div className="flex flex-col items-center">
                <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                  <TrendingUp className="h-8 w-8 text-primary-foreground" />
                </div>
                <span className="mt-2 text-sm font-semibold">综合胜任力</span>
                <span className="text-xs text-muted-foreground">{overallScore}%</span>
              </div>
            </div>

            {/* 连接线 */}
            <div className="hidden md:block absolute left-1/2 top-16 w-px h-8 bg-border -translate-x-1/2" />

            {/* 分支节点 */}
            <StaggerReveal className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {treeNodes.map((node, i) => {
                const color = BRANCH_COLORS[i % BRANCH_COLORS.length];
                const isExpanded = expandedNode === node.subject;
                const matchPct = Math.round(Math.min(node.current / (node.target || 1), 1) * 100);
                return (
                  <Card
                    key={node.subject}
                    className={`reveal-item cursor-pointer transition-all duration-200 ${color.border} ${isExpanded ? 'ring-2 ring-offset-2 ring-primary/20' : ''}`}
                    onClick={() => setExpandedNode(isExpanded ? null : node.subject)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`h-8 w-8 rounded-lg ${color.bg} flex items-center justify-center shrink-0`}>
                            <span className={`text-xs font-bold ${color.text}`}>{i + 1}</span>
                          </div>
                          <CardTitle className="text-base">{node.subject}</CardTitle>
                        </div>
                        {node.gap > 0 && (
                          <Badge variant="outline" className="text-destructive border-destructive/30 text-xs shrink-0">
                            缺口 {node.gap}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">当前 {node.current} / 目标 {node.target}</span>
                            <span className={`font-medium ${color.text}`}>{matchPct}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div className={`h-full ${color.bar} rounded-full transition-all`} style={{ width: `${matchPct}%` }} />
                          </div>
                        </div>
                      </div>

                      {isExpanded && node.courses.length > 0 && (
                        <div className="space-y-2 mt-3 pt-3 border-t">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                            <BookOpen className="h-3 w-3" />
                            推荐提升课程
                          </div>
                          {node.courses.map(c => (
                            <div
                              key={c.id}
                              className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                              onClick={(e) => { e.stopPropagation(); navigate(`/student/course/${c.id}`); }}
                            >
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium truncate">{c.title}</p>
                                <p className="text-xs text-muted-foreground">{c.dimension} · {c.difficulty || '入门'}</p>
                              </div>
                              <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 ml-2" />
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </StaggerReveal>
          </div>

          {/* 生成学习计划入口 */}
          <div className="flex justify-center">
            <Button size="lg" onClick={() => navigate('/student/learning-plan')}>
              <Sparkles className="h-4 w-4 mr-2" />
              基于能力树生成智能学习计划
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}