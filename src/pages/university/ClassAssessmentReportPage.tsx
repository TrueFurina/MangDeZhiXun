import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, BarChart3, AlertCircle, TrendingUp, Target, Download, Pencil, CheckCircle2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { getClasses, getTrainingTasks, getTaskSubmissions, updateTeacherOverride } from '@/db/training';
import { RADAR_DIMENSIONS, type ClassInfo, type TrainingTask, type TrainingSubmission } from '@/types/training';

// 生效分数：教师复核覆盖优先
function effectiveScores(s: TrainingSubmission): Record<string, number> {
  const base: Record<string, number> = {};
  for (const d of RADAR_DIMENSIONS) {
    const ov = s.teacher_override?.[d.key];
    base[d.key] = typeof ov === 'number' ? ov : Number(s.scores?.[d.key] ?? 0);
  }
  return base;
}

export default function ClassAssessmentReportPage() {
  const { user } = useAuth();
  const email = user?.email || localStorage.getItem('university_email') || '';

  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [tasks, setTasks] = useState<TrainingTask[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [submissions, setSubmissions] = useState<TrainingSubmission[]>([]);
  // 学生真实档案映射（完整学号 → 姓名/导师）
  const [profileMap, setProfileMap] = useState<Record<string, { name: string; mentor_name?: string }>>({});
  const [loading, setLoading] = useState(false);

  // 教师复核对话框
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<TrainingSubmission | null>(null);
  const [reviewScores, setReviewScores] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!email) return;
      const [cls, tks] = await Promise.all([getClasses(email), getTrainingTasks(email)]);
      setClasses(cls);
      setTasks(tks);
      if (cls.length > 0) setSelectedClassId(cls[0].id);
    };
    load();
  }, [email]);

  const classTasks = useMemo(() => tasks.filter((t) => t.class_id === selectedClassId), [tasks, selectedClassId]);

  useEffect(() => {
    if (classTasks.length > 0 && !classTasks.find((t) => t.id === selectedTaskId)) {
      setSelectedTaskId(classTasks[0].id);
    }
  }, [classTasks, selectedTaskId]);

  useEffect(() => {
    const loadSubs = async () => {
      if (!selectedTaskId) { setSubmissions([]); return; }
      setLoading(true);
      const list = await getTaskSubmissions(selectedTaskId);
      setSubmissions(list);
      setLoading(false);
    };
    loadSubs();
  }, [selectedTaskId]);

  // 统计聚合（生效分数：教师复核覆盖优先）
  const stats = useMemo(() => {
    const completed = submissions.filter((s) => s.status === 'completed');
    const total = submissions.length;
    const done = completed.length;
    const avgScores = RADAR_DIMENSIONS.map((d) => {
      const vals = completed.map((s) => effectiveScores(s)[d.key]).filter((v) => v > 0);
      const avg = vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
      return { subject: d.label, score: avg, fullMark: d.fullMark };
    });
    const overallAvg = avgScores.length > 0 ? Math.round(avgScores.reduce((a, b) => a + b.score, 0) / avgScores.length) : 0;
    const allScores = completed.map((s) => {
      const eff = effectiveScores(s);
      return Math.round(RADAR_DIMENSIONS.reduce((a, d) => a + eff[d.key], 0) / RADAR_DIMENSIONS.length);
    });
    const maxScore = allScores.length > 0 ? Math.max(...allScores) : 0;
    const minScore = allScores.length > 0 ? Math.min(...allScores) : 0;
    const dist = [
      { range: '90-100分', count: allScores.filter((v) => v >= 90).length },
      { range: '80-89分', count: allScores.filter((v) => v >= 80 && v < 90).length },
      { range: '70-79分', count: allScores.filter((v) => v >= 70 && v < 80).length },
      { range: '60-69分', count: allScores.filter((v) => v >= 60 && v < 70).length },
      { range: '60分以下', count: allScores.filter((v) => v < 60).length },
    ];
    const sorted = [...avgScores].sort((a, b) => a.score - b.score);
    const weakness = sorted.slice(0, 2).filter((w) => w.score > 0);
    return { total, done, overallAvg, maxScore, minScore, avgScores, dist, weakness };
  }, [submissions]);

  const openReview = (s: TrainingSubmission) => {
    setReviewTarget(s);
    setReviewScores(effectiveScores(s));
    setReviewOpen(true);
  };

  const handleSaveReview = async () => {
    if (!reviewTarget) return;
    setSaving(true);
    try {
      const override: Record<string, number> = {};
      for (const d of RADAR_DIMENSIONS) {
        override[d.key] = Math.max(0, Math.min(100, Number(reviewScores[d.key] || 0)));
      }
      await updateTeacherOverride(reviewTarget.id, override);
      setSubmissions((prev) =>
        prev.map((s) => (s.id === reviewTarget.id ? { ...s, teacher_override: override } : s)),
      );
      toast.success('复核评分已保存');
      setReviewOpen(false);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '保存失败';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleExportCSV = () => {
    if (stats.done === 0) { toast.error('暂无已完成数据可导出'); return; }
    const header = ['姓名', '完整学号', '导师', ...RADAR_DIMENSIONS.map((d) => d.label), '综合得分', '状态', '是否复核', '完成时间'];
    const rows = submissions.filter((s) => s.status === 'completed').map((s) => {
      const eff = effectiveScores(s);
      const avg = Math.round(RADAR_DIMENSIONS.reduce((a, d) => a + eff[d.key], 0) / RADAR_DIMENSIONS.length);
      const prof = profileMap[s.student_no];
      return [
        prof?.name || '',
        s.student_no,
        prof?.mentor_name || '',
        ...RADAR_DIMENSIONS.map((d) => String(eff[d.key])),
        String(avg),
        s.status,
        s.teacher_override ? '已复核' : '',
        s.completed_at ? new Date(s.completed_at).toLocaleString('zh-CN') : '',
      ];
    });
    const csv = '\﻿' + [header, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `班级学情报表_${new Date().toLocaleDateString('zh-CN')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('已导出班级学情报表');
  };

  const selectedClass = classes.find((c) => c.id === selectedClassId);

  return (
    <div className="container py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">班级学情报表</h1>
          <p className="text-muted-foreground mt-2">基于实训对话证据链的班级能力聚合分析，可直接用作课程过程性考核依据。</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedClassId} onValueChange={setSelectedClassId}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="选择班级" /></SelectTrigger>
            <SelectContent>
              {classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={selectedTaskId} onValueChange={setSelectedTaskId}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="选择任务" /></SelectTrigger>
            <SelectContent>
              {classTasks.map((t) => <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={handleExportCSV} variant="outline">
            <Download className="h-4 w-4 mr-1" /> 导出CSV
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-muted-foreground py-16">加载中...</div>
      ) : stats.done === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>暂无已完成的实训数据</p>
            <p className="text-sm mt-1">{selectedClass?.name || ''} 的学生完成实训后，学情报表将自动生成</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* 概览 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card><CardContent className="p-6"><div className="text-sm font-medium text-muted-foreground mb-2">应考人数</div><div className="text-3xl font-bold">{stats.total}</div></CardContent></Card>
            <Card><CardContent className="p-6"><div className="text-sm font-medium text-muted-foreground mb-2">已完成</div><div className="text-3xl font-bold text-primary">{stats.done}</div></CardContent></Card>
            <Card><CardContent className="p-6"><div className="text-sm font-medium text-muted-foreground mb-2">班级均分</div><div className="text-3xl font-bold text-green-600">{stats.overallAvg}</div></CardContent></Card>
            <Card><CardContent className="p-6"><div className="text-sm font-medium text-muted-foreground mb-2">最高分</div><div className="text-3xl font-bold text-orange-600">{stats.maxScore}</div></CardContent></Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="w-5 h-5 text-primary" /> 成绩区间分布</CardTitle></CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.dist} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="range" tick={{ fontSize: 12 }} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Target className="w-5 h-5 text-primary" /> 班级整体能力雷达</CardTitle></CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={stats.avgScores}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                      <Radar name="班级平均分" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 薄弱点 */}
          {stats.weakness.length > 0 && (
            <Card className="border-destructive/20 mb-8">
              <CardHeader className="bg-destructive/5">
                <CardTitle className="text-lg flex items-center gap-2"><AlertCircle className="w-5 h-5 text-destructive" /> 班级集体薄弱维度</CardTitle>
                <CardDescription>以下维度为本次实训中班级均分最低的能力项，建议针对性强化。</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {stats.weakness.map((w, idx) => (
                  <div key={idx} className="bg-muted/50 p-4 rounded-lg border border-border">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold text-sm flex items-center gap-2"><TrendingUp className="w-4 h-4 text-destructive" /> {w.subject}（均分：{w.score}）</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">该维度为班级整体薄弱项，建议在后续课程中增加针对性对抗演练。</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* 明细表 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5 text-primary" /> 学生成绩明细</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full max-w-full overflow-x-auto bg-card">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3 whitespace-nowrap font-medium">学生</th>
                      {RADAR_DIMENSIONS.map((d) => (
                        <th key={d.key} className="text-center py-2 px-3 whitespace-nowrap font-medium">{d.label}</th>
                      ))}
                      <th className="text-center py-2 px-3 whitespace-nowrap font-medium">综合得分</th>
                      <th className="text-center py-2 px-3 whitespace-nowrap font-medium">状态</th>
                      <th className="text-center py-2 px-3 whitespace-nowrap font-medium">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((s) => {
                      const eff = effectiveScores(s);
                      const avg = Math.round(RADAR_DIMENSIONS.reduce((a, d) => a + eff[d.key], 0) / RADAR_DIMENSIONS.length);
                      return (
                        <tr key={s.id} className="border-b hover:bg-muted/30">
                          <td className="py-2 px-3 whitespace-nowrap">
                            <div className="font-medium">{profileMap[s.student_no]?.name || '-'}</div>
                            <div className="text-xs text-muted-foreground">{s.student_no}</div>
                          </td>
                          {RADAR_DIMENSIONS.map((d) => (
                            <td key={d.key} className="text-center py-2 px-3 whitespace-nowrap">{eff[d.key] || '-'}</td>
                          ))}
                          <td className="text-center py-2 px-3 whitespace-nowrap font-semibold">{avg || '-'}</td>
                          <td className="text-center py-2 px-3 whitespace-nowrap">
                            <Badge variant={s.status === 'completed' ? 'default' : 'secondary'}>
                              {s.status === 'completed' ? '已完成' : '进行中'}
                            </Badge>
                          </td>
                          <td className="text-center py-2 px-3 whitespace-nowrap">
                            {s.status === 'completed' && (
                              <Button variant="ghost" size="sm" onClick={() => openReview(s)}>
                                {s.teacher_override ? <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" /> : <Pencil className="h-4 w-4 mr-1" />}
                                {s.teacher_override ? '已复核' : '复核'}
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* 教师人工复核对话框 */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
          <DialogHeader>
            <DialogTitle>教师人工复核</DialogTitle>
            <DialogDescription>
              学生：{profileMap[reviewTarget?.student_no || '']?.name || reviewTarget?.student_no}（{reviewTarget?.student_no}）。调整后的分数将覆盖AI评分，用于课程过程性考核。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {RADAR_DIMENSIONS.map((d) => (
              <div key={d.key} className="flex items-center justify-between gap-4">
                <label className="text-sm font-medium w-20 shrink-0">{d.label}</label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={reviewScores[d.key] ?? ''}
                  onChange={(e) => setReviewScores((prev) => ({ ...prev, [d.key]: Number(e.target.value) }))}
                  className="w-28"
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewOpen(false)}>取消</Button>
            <Button onClick={handleSaveReview} disabled={saving}>
              {saving ? '保存中...' : '保存复核评分'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}