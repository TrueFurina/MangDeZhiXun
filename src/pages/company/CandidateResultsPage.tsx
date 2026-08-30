import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download, Search, Filter, Loader2, Sparkles, AlertCircle, FileText, CheckCircle2, Eye, Target } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import ReactECharts from 'echarts-for-react';

export default function CandidateResultsPage() {
  const { user } = useAuth();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user?.id) {
      setLoading(false);
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      // 在真实业务中，需要联表 candidate_assessment_account -> enterprise_competency_model 
      // 或许评估记录表直接存在 assessment_record 中。
      // 为演示目的，我们查询所有的 assessment_record，其中 enterprise_id = 当前企业HR。
      const { data, error } = await supabase
        .from('assessment_record')
        .select(`
          *,
          user:user_profiles(id, nickname, phone, avatar_url)
        `)
        .eq('enterprise_id', user.id)
        .order('submit_time', { ascending: false });

      if (error) throw error;
      setResults(data || []);
    } catch (err: any) {
      toast.error('数据加载失败: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getRecommendationBadge = (aiReportText?: string) => {
    if (!aiReportText) return <Badge variant="outline">待评估</Badge>;
    if (aiReportText.includes('推荐录用')) return <Badge className="bg-green-500">推荐录用</Badge>;
    if (aiReportText.includes('不推荐')) return <Badge variant="destructive">不推荐</Badge>;
    return <Badge className="bg-yellow-500 text-white">待观察</Badge>;
  };

  // 生成雷达图选项
  const getRadarOption = (record: any) => {
    const defaultData = [80, 85, 75, 90];
    let candidateData = defaultData;
    let baselineData = [75, 75, 75, 75]; // 基础合格线

    if (record?.dimension_scores) {
      const { knowledge, skill, professionalism, soft_skill } = record.dimension_scores;
      candidateData = [
        knowledge || 0,
        skill || 0,
        professionalism || 0,
        soft_skill || 0
      ];
    }

    return {
      radar: {
        indicator: [
          { name: '基础知识', max: 100 },
          { name: '专业技能', max: 100 },
          { name: '职业素养', max: 100 },
          { name: '通用软实力', max: 100 }
        ],
        splitNumber: 4,
        axisName: {
          color: '#333',
          fontWeight: 'bold',
        },
        splitArea: {
          areaStyle: {
            color: ['#f8f9fa', '#fff', '#f8f9fa', '#fff'],
            shadowColor: 'rgba(0, 0, 0, 0.05)',
            shadowBlur: 10
          }
        },
        axisLine: {
          lineStyle: { color: '#e5e7eb' }
        },
        splitLine: {
          lineStyle: { color: '#e5e7eb' }
        }
      },
      series: [
        {
          name: '能力对比',
          type: 'radar',
          data: [
            {
              value: baselineData,
              name: '岗位及格线',
              itemStyle: { color: '#94a3b8' },
              lineStyle: { type: 'dashed', color: '#94a3b8' },
              areaStyle: { opacity: 0.1 }
            },
            {
              value: candidateData,
              name: '候选人得分',
              itemStyle: { color: '#165DFF' },
              areaStyle: {
                color: 'rgba(22, 93, 255, 0.2)'
              }
            }
          ]
        }
      ],
      legend: {
        bottom: 0,
        data: ['岗位及格线', '候选人得分']
      },
      tooltip: {
        trigger: 'item'
      }
    };
  };

  const filteredResults = results.filter(r => 
    (r.user?.nickname || '').includes(searchQuery) || 
    (r.user?.phone || '').includes(searchQuery)
  );

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">候选人评估结果</h1>
          <p className="text-muted-foreground mt-2">查看候选人的多维能力雷达图，获取AI协同过滤算法生成的智能录用建议。</p>
        </div>
        <Button variant="outline" onClick={() => toast.info('演示环境：批量导出功能开发中')}>
          <Download className="mr-2 h-4 w-4" />
          批量导出报告
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索候选人姓名或手机号..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => toast.info('筛选器')}>
              <Filter className="mr-2 h-4 w-4" />
              筛选器
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="rounded-md border-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>候选人</TableHead>
                  <TableHead>关联岗位</TableHead>
                  <TableHead>测试时间</TableHead>
                  <TableHead>总分</TableHead>
                  <TableHead>人岗匹配度</TableHead>
                  <TableHead>智能录用建议</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                      数据加载中...
                    </TableCell>
                  </TableRow>
                ) : filteredResults.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                      暂无候选人评估记录。
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredResults.map((r) => (
                    <TableRow key={r.record_id}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{r.user?.nickname || '未知用户'}</span>
                          <span className="text-xs text-muted-foreground">{r.user?.phone || '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell>{r.job_id || '未知岗位'}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {r.submit_time ? format(new Date(r.submit_time), 'MM-dd HH:mm') : '-'}
                      </TableCell>
                      <TableCell className="font-semibold text-lg">{r.total_score || 0}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-muted h-2 rounded-full overflow-hidden">
                            <div className="bg-primary h-full" style={{ width: `${r.match_score || 0}%` }}></div>
                          </div>
                          <span className="text-sm font-medium">{r.match_score || 0}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getRecommendationBadge(r.ai_report)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => {
                          setSelectedResult(r);
                          setDetailOpen(true);
                        }}>
                          <Eye className="h-4 w-4 mr-1" /> 查看报告
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-3xl h-[80vh] flex flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle>候选人能力评估报告</DialogTitle>
            <DialogDescription>
              基于AI多模态评估引擎与企业自定义胜任力模型生成的全景分析报告。
            </DialogDescription>
          </DialogHeader>
          
          {selectedResult && (
            <div className="flex-1 overflow-y-auto pr-2 space-y-6">
              {/* 基本信息与总体结果 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="md:col-span-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">候选人信息</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-2xl font-bold">{selectedResult.user?.nickname || '未知用户'}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          手机号：{selectedResult.user?.phone || '-'} | 测试时间：{selectedResult.submit_time ? format(new Date(selectedResult.submit_time), 'yyyy-MM-dd HH:mm') : '-'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground mb-1">测试岗位</div>
                        <Badge variant="outline" className="text-sm">{selectedResult.job_id || '未知岗位'}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-6 flex flex-col items-center justify-center h-full">
                    <div className="text-sm text-muted-foreground font-medium mb-2">人岗匹配度</div>
                    <div className="text-4xl font-black text-primary">{selectedResult.match_score || 0}<span className="text-xl">%</span></div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 雷达图 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center">
                      <Target className="w-4 h-4 mr-2 text-primary" />
                      能力维度雷达图
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ReactECharts option={getRadarOption(selectedResult)} style={{ height: '100%', width: '100%' }} />
                    </div>
                  </CardContent>
                </Card>

                {/* AI 录用建议 */}
                <Card className="flex flex-col">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center">
                      <Sparkles className="w-4 h-4 mr-2 text-yellow-500" />
                      AI 智能录用建议
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <div className="mb-4">
                      <div className="text-sm font-medium text-muted-foreground mb-2">决策建议：</div>
                      {getRecommendationBadge(selectedResult.ai_report)}
                    </div>
                    <div className="flex-1 bg-muted/50 rounded-lg p-4 text-sm leading-relaxed overflow-y-auto">
                      <span className="font-semibold block mb-2">决策依据：</span>
                      {selectedResult.ai_report ? (
                        <div dangerouslySetInnerHTML={{ __html: selectedResult.ai_report.replace(/\n/g, '<br/>') }} />
                      ) : (
                        <p className="text-muted-foreground">该候选人综合专业技能优秀，知识基础扎实，但在沟通协作等软实力维度略低于岗位基准要求。考虑到该岗位对技术要求更高，总体匹配度达标。建议在后续面试中重点考察其抗压能力与团队协作意愿，若无明显短板，推荐录用。</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
          
          <DialogFooter className="mt-4 pt-4 border-t">
            <Button variant="outline" onClick={() => setDetailOpen(false)}>关闭</Button>
            <Button onClick={() => toast.success('PDF 报告生成中...')}>
              <Download className="mr-2 h-4 w-4" />
              下载 PDF 报告
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}