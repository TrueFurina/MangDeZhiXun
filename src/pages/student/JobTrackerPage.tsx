import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Building2, Briefcase, Trash2, Pencil, ExternalLink, GripVertical, TrendingUp, Award, XCircle, Send, Search, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

type AppStatus = 'applied' | 'screening' | 'interview' | 'offer' | 'rejected';

interface JobApp {
  id: string;
  user_email: string;
  company: string;
  position: string;
  status: AppStatus;
  salary: string | null;
  source: string | null;
  interview_rounds: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

const COLUMNS: { key: AppStatus; label: string; icon: any; accent: string }[] = [
  { key: 'applied', label: '已投递', icon: Send, accent: 'border-t-primary' },
  { key: 'screening', label: '简历筛选', icon: Search, accent: 'border-t-chart-2' },
  { key: 'interview', label: '面试中', icon: MessageSquare, accent: 'border-t-chart-3' },
  { key: 'offer', label: 'Offer', icon: Award, accent: 'border-t-chart-4' },
  { key: 'rejected', label: '已拒绝', icon: XCircle, accent: 'border-t-destructive' },
];

const STATUS_LABELS: Record<AppStatus, string> = {
  applied: '已投递', screening: '简历筛选', interview: '面试中', offer: 'Offer', rejected: '已拒绝',
};

export default function JobTrackerPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [apps, setApps] = useState<JobApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<JobApp | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<JobApp | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<AppStatus | null>(null);

  // 表单状态
  const [form, setForm] = useState({
    company: '', position: '', status: 'applied' as AppStatus,
    salary: '', source: '', interview_rounds: 0, notes: '',
  });

  const userEmail = user?.email || localStorage.getItem('student_email') || '';

  const loadApps = useCallback(async () => {
    if (!userEmail) { setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from('job_applications')
      .select('*')
      .eq('user_email', userEmail)
      .order('updated_at', { ascending: false });
    setApps((data as JobApp[]) || []);
    setLoading(false);
  }, [userEmail]);

  useEffect(() => { loadApps(); }, [loadApps]);

  const openCreate = () => {
    setEditing(null);
    setForm({ company: '', position: '', status: 'applied', salary: '', source: '', interview_rounds: 0, notes: '' });
    setDialogOpen(true);
  };

  const openEdit = (app: JobApp) => {
    setEditing(app);
    setForm({
      company: app.company,
      position: app.position,
      status: app.status,
      salary: app.salary || '',
      source: app.source || '',
      interview_rounds: app.interview_rounds,
      notes: app.notes || '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.company.trim() || !form.position.trim()) {
      toast.error('请填写企业名称和投递岗位');
      return;
    }
    const payload = {
      user_email: userEmail,
      company: form.company.trim(),
      position: form.position.trim(),
      status: form.status,
      salary: form.salary.trim() || null,
      source: form.source.trim() || null,
      interview_rounds: Number(form.interview_rounds) || 0,
      notes: form.notes.trim() || null,
      updated_at: new Date().toISOString(),
    };

    if (editing) {
      const { error } = await supabase.from('job_applications').update(payload).eq('id', editing.id);
      if (error) { toast.error('更新失败'); return; }
      toast.success('已更新投递记录');
    } else {
      const { error } = await supabase.from('job_applications').insert(payload);
      if (error) { toast.error('添加失败'); return; }
      toast.success('已添加投递记录');
    }
    setDialogOpen(false);
    loadApps();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from('job_applications').delete().eq('id', deleteTarget.id);
    if (error) { toast.error('删除失败'); return; }
    toast.success('已删除');
    setDeleteTarget(null);
    loadApps();
  };

  const handleDrop = async (status: AppStatus) => {
    if (!dragId) return;
    const app = apps.find(a => a.id === dragId);
    if (!app || app.status === status) { setDragId(null); setDragOverCol(null); return; }
    const newRounds = status === 'interview' ? Math.max(app.interview_rounds, 1) : app.interview_rounds;
    await supabase.from('job_applications')
      .update({ status, interview_rounds: newRounds, updated_at: new Date().toISOString() })
      .eq('id', dragId);
    setDragId(null);
    setDragOverCol(null);
    loadApps();
  };

  // 统计
  const stats = {
    total: apps.length,
    interviewing: apps.filter(a => a.status === 'interview').length,
    offers: apps.filter(a => a.status === 'offer').length,
    rate: apps.length > 0 ? Math.round((apps.filter(a => a.status === 'interview' || a.status === 'offer').length / apps.length) * 100) : 0,
  };

  const appsByStatus = (status: AppStatus) => apps.filter(a => a.status === status);

  return (
    <div className="container py-8 max-w-7xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold tracking-tight">求职进度看板</h1>
          <p className="text-muted-foreground text-sm mt-1">
            看板式管理投递企业、面试轮次与 Offer 状态，拖拽卡片即可更新进度
          </p>
        </div>
        <Button onClick={openCreate} className="shrink-0">
          <Plus className="h-4 w-4 mr-1" /> 新增投递
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1"><Briefcase className="h-4 w-4" />投递总数</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1"><MessageSquare className="h-4 w-4" />面试中</div>
            <div className="text-2xl font-bold text-chart-3">{stats.interviewing}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1"><Award className="h-4 w-4" />Offer</div>
            <div className="text-2xl font-bold text-chart-4">{stats.offers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1"><TrendingUp className="h-4 w-4" />面试转化率</div>
            <div className="text-2xl font-bold text-primary">{stats.rate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* 看板 */}
      {loading ? (
        <div className="text-center py-16 text-muted-foreground">加载中...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {COLUMNS.map((col) => {
            const list = appsByStatus(col.key);
            const Icon = col.icon;
            return (
              <div
                key={col.key}
                className={`rounded-lg bg-muted/40 border-t-4 ${col.accent} ${dragOverCol === col.key ? 'ring-2 ring-primary/40' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragOverCol(col.key); }}
                onDragLeave={() => setDragOverCol(null)}
                onDrop={() => handleDrop(col.key)}
              >
                <div className="flex items-center justify-between px-3 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-semibold">{col.label}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">{list.length}</Badge>
                </div>
                <div className="px-2 pb-2 space-y-2 min-h-[100px]">
                  {list.map((app) => (
                    <Card
                      key={app.id}
                      className={`cursor-grab active:cursor-grabbing transition-shadow hover:shadow-md ${dragId === app.id ? 'opacity-50' : ''}`}
                      draggable
                      onDragStart={() => setDragId(app.id)}
                      onDragEnd={() => { setDragId(null); setDragOverCol(null); }}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 mb-1">
                              <GripVertical className="h-3 w-3 text-muted-foreground shrink-0" />
                              <p className="font-semibold text-sm truncate">{app.company}</p>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{app.position}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          {app.salary && <Badge variant="outline" className="text-xs">{app.salary}</Badge>}
                          {app.interview_rounds > 0 && (
                            <Badge variant="outline" className="text-xs">{app.interview_rounds} 轮面试</Badge>
                          )}
                          {app.source && <Badge variant="outline" className="text-xs">{app.source}</Badge>}
                        </div>
                        {app.notes && (
                          <p className="text-xs text-muted-foreground mt-2 line-clamp-2 text-pretty">{app.notes}</p>
                        )}
                        <div className="flex items-center gap-1 mt-2 pt-2 border-t">
                          <Button
                            variant="ghost" size="sm" className="h-7 px-2 text-xs flex-1"
                            onClick={() => navigate(`/student/enterprise-insight?company=${encodeURIComponent(app.company)}`)}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />企业情报
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(app)}>
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleteTarget(app)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {list.length === 0 && (
                    <div className="text-center py-6 text-xs text-muted-foreground">拖拽卡片到此处</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 新增/编辑弹窗 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? '编辑投递记录' : '新增投递记录'}</DialogTitle>
            <DialogDescription>记录你投递的企业、岗位与当前进度</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>企业名称 *</Label>
                <Input value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} placeholder="如：宁德时代" />
              </div>
              <div className="space-y-1.5">
                <Label>投递岗位 *</Label>
                <Input value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))} placeholder="如：嵌入式工程师" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>当前状态</Label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as AppStatus }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {COLUMNS.map(c => <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>面试轮数</Label>
                <Input type="number" min={0} value={form.interview_rounds} onChange={e => setForm(f => ({ ...f, interview_rounds: Number(e.target.value) }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>期望/实际薪资</Label>
                <Input value={form.salary} onChange={e => setForm(f => ({ ...f, salary: e.target.value }))} placeholder="如：15-20K" />
              </div>
              <div className="space-y-1.5">
                <Label>投递渠道</Label>
                <Input value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} placeholder="如：校招/BOSS直聘" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>备注</Label>
              <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="记录面试反馈、HR联系方式等" rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
            <Button onClick={handleSave}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认 */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除该投递记录？</AlertDialogTitle>
            <AlertDialogDescription>
              将永久删除「{deleteTarget?.company} · {deleteTarget?.position}」的投递记录，此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>确认删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}