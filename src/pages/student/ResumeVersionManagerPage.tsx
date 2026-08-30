import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, FileText, Trash2, Eye, GitCompare, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface ResumeVersion {
  id: string;
  user_email: string;
  name: string;
  target_company: string | null;
  target_position: string | null;
  original_content: string;
  optimized_content: string;
  ats_score: number | null;
  created_at: string;
}

export default function ResumeVersionManagerPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [versions, setVersions] = useState<ResumeVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ResumeVersion | null>(null);
  const [comparePair, setComparePair] = useState<[ResumeVersion, ResumeVersion] | null>(null);
  const [form, setForm] = useState({ name: '', target_company: '', target_position: '' });

  const userEmail = user?.email || localStorage.getItem('student_email') || '';

  const load = useCallback(async () => {
    if (!userEmail) { setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from('resume_versions')
      .select('*')
      .eq('user_email', userEmail)
      .order('created_at', { ascending: false });
    setVersions((data as ResumeVersion[]) || []);
    setLoading(false);
  }, [userEmail]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('请填写简历版本名称'); return; }
    const { error } = await supabase.from('resume_versions').insert({
      user_email: userEmail,
      name: form.name.trim(),
      target_company: form.target_company.trim() || null,
      target_position: form.target_position.trim() || null,
      original_content: '',
      optimized_content: '',
      ats_score: null,
    });
    if (error) { toast.error('创建失败'); return; }
    toast.success('简历版本已创建，请前往简历助手编辑');
    setDialogOpen(false);
    setForm({ name: '', target_company: '', target_position: '' });
    load();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from('resume_versions').delete().eq('id', deleteTarget.id);
    if (error) { toast.error('删除失败'); return; }
    toast.success('已删除');
    setDeleteTarget(null);
    load();
  };

  return (
    <div className="container py-8 max-w-5xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold tracking-tight">简历版本管理</h1>
          <p className="text-muted-foreground text-sm mt-1">
            为不同企业/岗位维护多版本简历，对比优化前后差异
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="shrink-0">
          <Plus className="h-4 w-4 mr-1" />新建版本
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-muted-foreground">加载中...</div>
      ) : versions.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">暂无简历版本</h3>
            <p className="text-muted-foreground text-sm mb-6 text-pretty max-w-md mx-auto">
              为不同目标企业创建专属简历版本，针对性优化提升匹配度。
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />新建简历版本
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {versions.map(v => (
            <Card key={v.id} className="h-full flex flex-col">
              <CardContent className="p-4 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold truncate">{v.name}</p>
                    {v.target_position && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{v.target_position}</p>
                    )}
                  </div>
                  {v.ats_score !== null && (
                    <Badge variant="outline" className="text-xs shrink-0">ATS {v.ats_score}</Badge>
                  )}
                </div>
                {v.target_company && (
                  <Badge variant="secondary" className="text-xs w-fit mb-2">{v.target_company}</Badge>
                )}
                <p className="text-xs text-muted-foreground mb-3">
                  {new Date(v.created_at).toLocaleDateString('zh-CN')}
                </p>
                <div className="mt-auto flex items-center gap-1 pt-3 border-t">
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs flex-1" onClick={() => navigate(`/student/resume-assistant?version=${v.id}`)}>
                    <Sparkles className="h-3 w-3 mr-1" />编辑
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleteTarget(v)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 批量对比 */}
      {versions.length >= 2 && (
        <div className="mt-6">
          <Card className="border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">版本对比</p>
                  <p className="text-xs text-muted-foreground">选择两个版本横向对比优化前后差异</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setComparePair([versions[0], versions[1]])}>
                  <GitCompare className="h-3.5 w-3.5 mr-1" />对比前两个版本
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 对比弹窗 */}
      <Dialog open={!!comparePair} onOpenChange={(o) => !o && setComparePair(null)}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-4xl max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>简历版本对比</DialogTitle>
            <DialogDescription>横向对比两个版本的优化前后差异</DialogDescription>
          </DialogHeader>
          {comparePair && (
            <Tabs defaultValue="original" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="original">{comparePair[0].name}</TabsTrigger>
                <TabsTrigger value="optimized">{comparePair[1].name}</TabsTrigger>
              </TabsList>
              <TabsContent value="original" className="mt-4">
                <div className="p-4 rounded-lg bg-muted/50 border min-h-[200px]">
                  <p className="text-sm whitespace-pre-wrap text-pretty">
                    {comparePair[0].original_content || '暂无原始内容，请前往简历助手编辑'}
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="optimized" className="mt-4">
                <div className="p-4 rounded-lg bg-muted/50 border min-h-[200px]">
                  <p className="text-sm whitespace-pre-wrap text-pretty">
                    {comparePair[1].optimized_content || '暂无优化内容，请前往简历助手编辑'}
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* 新建弹窗 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md">
          <DialogHeader>
            <DialogTitle>新建简历版本</DialogTitle>
            <DialogDescription>为特定企业/岗位创建专属简历版本</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>版本名称 *</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="如：宁德时代-嵌入式岗" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>目标企业</Label>
                <Input value={form.target_company} onChange={e => setForm(f => ({ ...f, target_company: e.target.value }))} placeholder="企业名称" />
              </div>
              <div className="space-y-1.5">
                <Label>目标岗位</Label>
                <Input value={form.target_position} onChange={e => setForm(f => ({ ...f, target_position: e.target.value }))} placeholder="岗位名称" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
            <Button onClick={handleSave}>创建</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认 */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除该简历版本？</AlertDialogTitle>
            <AlertDialogDescription>
              将永久删除「{deleteTarget?.name}」，此操作不可撤销。
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