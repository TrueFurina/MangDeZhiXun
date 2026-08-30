import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Loader2, Sparkles, AlertCircle, FileText, CheckCircle2, Eye, BrainCircuit, Activity, Target } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

export default function CandidatePortraitPage() {
  const { user } = useAuth();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user?.id) {
      setLoading(false);
      setRecords([]);
      return;
    }
    setLoading(true);
    try {
      // 查询 AI 深度面试记录及画像
      const { data, error } = await supabase
        .from('ai_interview_record')
        .select(`
          *,
          user:user_profiles(id, nickname, phone, email),
          portrait:user_portrait(basic_info, ability_portrait, recommended_learning)
        `)
        .eq('enterprise_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (err: any) {
      toast.error('数据加载失败: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = records.filter(r => 
    (r.user?.nickname || '').includes(searchQuery) || 
    (r.user?.phone || '').includes(searchQuery)
  );

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">候选人画像与面试表现</h1>
          <p className="text-muted-foreground mt-1">查看候选人的底层逻辑考察、压力测试结果与全息能力画像</p>
        </div>
      </div>

      <Card className="border-border">
        <CardHeader className="pb-4 border-b">
          <div className="flex justify-between items-center">
            <CardTitle>面试记录列表</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索候选人姓名/手机号..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="w-full max-w-full overflow-x-auto">
            <Table className="[&>div]:max-w-full">
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="whitespace-nowrap">候选人信息</TableHead>
                  <TableHead className="whitespace-nowrap">面试类型</TableHead>
                  <TableHead className="whitespace-nowrap">面试时间</TableHead>
                  <TableHead className="whitespace-nowrap text-right">逻辑得分</TableHead>
                  <TableHead className="whitespace-nowrap text-right">抗压得分</TableHead>
                  <TableHead className="whitespace-nowrap">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : filteredRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      暂无面试记录
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRecords.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="whitespace-nowrap">
                        <div className="font-medium">{r.user?.nickname || '未知用户'}</div>
                        <div className="text-xs text-muted-foreground">{r.user?.phone || r.user?.email || '暂无联系方式'}</div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge variant="outline">{r.interview_type === 'voice' ? '语音深度面试' : '视频面试'}</Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {r.end_time ? format(new Date(r.end_time), 'yyyy-MM-dd HH:mm') : '未完成'}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right font-medium text-primary">
                        {r.logic_score || '-'}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right font-medium text-accent">
                        {r.pressure_score || '-'}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {
                            setSelectedRecord(r);
                            setDetailOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          查看详情
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
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>画像与面试表现详情</DialogTitle>
          </DialogHeader>
          
          {selectedRecord && (
            <div className="space-y-6 mt-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold">{selectedRecord.user?.nickname}</h3>
                  <p className="text-muted-foreground">{selectedRecord.user?.phone || selectedRecord.user?.email}</p>
                </div>
                <Badge variant={selectedRecord.status === 2 ? "default" : "secondary"}>
                  {selectedRecord.status === 2 ? '已完成' : '未完成'}
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-primary/5 border-none shadow-none">
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground flex items-center gap-1"><BrainCircuit className="h-4 w-4"/> 逻辑思维</div>
                    <div className="text-2xl font-bold text-primary mt-1">{selectedRecord.logic_score || 0}</div>
                  </CardContent>
                </Card>
                <Card className="bg-accent/5 border-none shadow-none">
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground flex items-center gap-1"><Activity className="h-4 w-4"/> 抗压能力</div>
                    <div className="text-2xl font-bold text-accent mt-1">{selectedRecord.pressure_score || 0}</div>
                  </CardContent>
                </Card>
                <Card className="bg-orange-500/5 border-none shadow-none">
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground flex items-center gap-1"><Sparkles className="h-4 w-4 text-orange-500"/> 情境应对</div>
                    <div className="text-2xl font-bold text-orange-600 mt-1">{selectedRecord.scenario_score || 0}</div>
                  </CardContent>
                </Card>
                <Card className="bg-blue-500/5 border-none shadow-none">
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground flex items-center gap-1"><FileText className="h-4 w-4 text-blue-500"/> 专业技能</div>
                    <div className="text-2xl font-bold text-blue-600 mt-1">{selectedRecord.skill_score || 0}</div>
                  </CardContent>
                </Card>
              </div>
              
              {selectedRecord.interview_type === 'video' && selectedRecord.video_features && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg border-b pb-2">视频画面特征分析</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-muted/30 p-4 rounded-lg">
                    <div>
                      <div className="text-sm text-muted-foreground">微表情</div>
                      <div className="font-medium mt-1">{selectedRecord.video_features.micro_expression || '-'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">仪态</div>
                      <div className="font-medium mt-1">{selectedRecord.video_features.posture || '-'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">眼神接触</div>
                      <div className="font-medium mt-1">{selectedRecord.video_features.eye_contact || '-'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">情绪稳定性得分</div>
                      <div className="font-medium mt-1 text-primary">{selectedRecord.video_features.emotion_stability || '-'}</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <h4 className="font-semibold text-lg border-b pb-2">用户画像同步数据</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-muted p-4 rounded-lg">
                     <div className="text-sm text-muted-foreground mb-2">历史测评记录</div>
                     <div className="text-sm whitespace-pre-wrap">{selectedRecord.portrait?.assessment_history ? JSON.stringify(selectedRecord.portrait.assessment_history, null, 2) : '暂无数据'}</div>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                     <div className="text-sm text-muted-foreground mb-2">课程学习行为记录</div>
                     <div className="text-sm whitespace-pre-wrap">{selectedRecord.portrait?.learning_behavior ? JSON.stringify(selectedRecord.portrait.learning_behavior, null, 2) : '暂无数据'}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-lg border-b pb-2">AI 面试官点评</h4>
                <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap text-sm text-foreground">
                  {selectedRecord.ai_comment || '暂无点评数据'}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-lg border-b pb-2">问答记录明细</h4>
                <div className="space-y-4">
                  {selectedRecord.round_data && selectedRecord.round_data.map((r: any, idx: number) => (
                    <div key={idx} className="p-4 border rounded-lg space-y-3">
                      <div className="flex gap-2 text-sm">
                        <span className="font-bold text-primary shrink-0">Q{idx + 1}:</span>
                        <span className="font-medium text-foreground">{r.question}</span>
                      </div>
                      <div className="flex gap-2 text-sm bg-muted/50 p-3 rounded">
                        <span className="font-bold text-muted-foreground shrink-0">A:</span>
                        <span className="text-muted-foreground">{r.answer}</span>
                      </div>
                    </div>
                  ))}
                  {(!selectedRecord.round_data || selectedRecord.round_data.length === 0) && (
                     <div className="text-sm text-muted-foreground text-center py-4">暂无问答记录</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}