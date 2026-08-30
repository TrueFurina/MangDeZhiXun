import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Star, StarOff, Trash2, Pencil, Search, Users, GitCompare, Tag, Mail, Briefcase, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { getStudentTalent, addStudentToCandidates, type StudentTalent } from '@/db/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmptyState } from '@/components/common/EmptyState';

interface Evaluation {
  dimension: string;
  score: number;
}

interface Candidate {
  id: string;
  company_email: string;
  name: string;
  email: string | null;
  position: string | null;
  tags: string[];
  notes: string | null;
  favorite: boolean;
  evaluations: Evaluation[];
  created_at: string;
}

export default function CandidatePoolPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [favOnly, setFavOnly] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Candidate | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Candidate | null>(null);
  const [tagInput, setTagInput] = useState('');

  // 平台人才库
  const [talentOpen, setTalentOpen] = useState(false);
  const [talentList, setTalentList] = useState<StudentTalent[]>([]);
  const [talentLoading, setTalentLoading] = useState(false);
  const [talentIntent, setTalentIntent] = useState<string>('all');
  const [addingId, setAddingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '', email: '', position: '', tags: [] as string[], notes: '',
  });

  const companyEmail = user?.email || localStorage.getItem('company_email') || '';

  const load = useCallback(async () => {
    if (!companyEmail) { setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from('candidates')
      .select('*')
      .eq('company_email', companyEmail)
      .order('created_at', { ascending: false });
    setCandidates((data as Candidate[]) || []);
    setLoading(false);
  }, [companyEmail]);

  useEffect(() => { load(); }, [load]);

  const allTags = Array.from(new Set(candidates.flatMap(c => c.tags || [])));

  const filtered = candidates.filter(c => {
    if (search && !c.name.includes(search) && !(c.position || '').includes(search) && !(c.email || '').includes(search)) return false;
    if (activeTag && !(c.tags || []).includes(activeTag)) return false;
    if (favOnly && !c.favorite) return false;
    return true;
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', email: '', position: '', tags: [], notes: '' });
    setTagInput('');
    setDialogOpen(true);
  };

  const openEdit = (c: Candidate) => {
    setEditing(c);
    setForm({ name: c.name, email: c.email || '', position: c.position || '', tags: c.tags || [], notes: c.notes || '' });
    setTagInput('');
    setDialogOpen(true);
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t)) {
      setForm(f => ({ ...f, tags: [...f.tags, t] }));
      setTagInput('');
    }
  };

  const removeTag = (t: string) => setForm(f => ({ ...f, tags: f.tags.filter(x => x !== t) }));

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('请填写候选人姓名'); return; }
    const payload = {
      company_email: companyEmail,
      name: form.name.trim(),
      email: form.email.trim() || null,
      position: form.position.trim() || null,
      tags: form.tags,
      notes: form.notes.trim() || null,
      updated_at: new Date().toISOString(),
    };
    if (editing) {
      const { error } = await supabase.from('candidates').update(payload).eq('id', editing.id);
      if (error) { toast.error('更新失败'); return; }
      toast.success('已更新候选人信息');
    } else {
      const { error } = await supabase.from('candidates').insert(payload);
      if (error) { toast.error('添加失败'); return; }
      toast.success('已添加候选人');
    }
    setDialogOpen(false);
    load();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from('candidates').delete().eq('id', deleteTarget.id);
    if (error) { toast.error('删除失败'); return; }
    toast.success('已删除');
    setDeleteTarget(null);
    load();
  };

  const toggleFav = async (c: Candidate) => {
    await supabase.from('candidates').update({ favorite: !c.favorite, updated_at: new Date().toISOString() }).eq('id', c.id);
    load();
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const avgScore = (c: Candidate) => {
    if (!c.evaluations || c.evaluations.length === 0) return null;
    const sum = c.evaluations.reduce((s, e) => s + (e.score || 0), 0);
    return Math.round(sum / c.evaluations.length);
  };

  const goCompare = () => {
    if (selected.size < 2) { toast.error('请至少选择 2 位候选人进行对比'); return; }
    navigate(`/company/candidate-compare?ids=${Array.from(selected).join(',')}`);
  };

  const openTalent = async () => {
    setTalentOpen(true);
    await loadTalent(talentIntent);
  };

  const loadTalent = async (intent: string) => {
    setTalentLoading(true);
    const list = await getStudentTalent(intent === 'all' ? undefined : intent);
    setTalentList(list);
    setTalentLoading(false);
  };

  const handleAddTalent = async (t: StudentTalent) => {
    setAddingId(t.user_id);
    try {
      const added = await addStudentToCandidates(companyEmail, t);
      if (added) {
        toast.success(`已将 ${t.nickname} 加入候选人池`);
      } else {
        toast.info('该学员已在候选人池中');
      }
      setTalentOpen(false);
      load();
    } catch (e: any) {
      toast.error(e.message || '添加失败');
    } finally {
      setAddingId(null);
    }
  };

  const INTENTS = ['全部方向', '前端开发', '后端开发', '算法/数据', '产品经理', 'UI/UX设计', '运营/市场', '测试/质量', '数据分析'];
  const intentValue = (label: string) => (label === '全部方向' ? 'all' : label);

  return (
    <div className="container py-8 max-w-7xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold tracking-tight">候选人人才池</h1>
          <p className="text-muted-foreground text-sm mt-1">
            沉淀历次评估候选人，打标签、收藏、备注，构建企业私有人才库
          </p>
        </div>
        <Button onClick={openCreate} className="shrink-0">
          <Plus className="h-4 w-4 mr-1" /> 新增候选人
        </Button>
        <Button variant="outline" onClick={openTalent} className="shrink-0">
          <Users className="h-4 w-4 mr-1" /> 平台人才库
        </Button>
      </div>

      {/* 筛选栏 */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-0 w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="搜索姓名、岗位或邮箱"
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {allTags.map(tag => (
            <Badge
              key={tag}
              variant={activeTag === tag ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
            >
              {tag}
            </Badge>
          ))}
          <Button variant={favOnly ? 'default' : 'outline'} size="sm" onClick={() => setFavOnly(!favOnly)}>
            <Star className={`h-3.5 w-3.5 mr-1 ${favOnly ? 'fill-current' : ''}`} />收藏
          </Button>
        </div>
      </div>

      {/* 批量操作栏 */}
      {selected.size > 0 && (
        <div className="flex items-center justify-between mb-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
          <span className="text-sm">已选择 <strong>{selected.size}</strong> 位候选人</span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setSelected(new Set())}>取消</Button>
            <Button size="sm" onClick={goCompare}>
              <GitCompare className="h-3.5 w-3.5 mr-1" />批量对比
            </Button>
          </div>
        </div>
      )}

      {/* 候选人卡片 */}
      {loading ? (
        <div className="text-center py-16 text-muted-foreground">加载中...</div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">{candidates.length === 0 ? '人才池为空' : '无匹配候选人'}</h3>
            <p className="text-muted-foreground text-sm mb-6 text-pretty max-w-md mx-auto">
              {candidates.length === 0 ? '添加你的第一位候选人，开始构建私有人才库。' : '尝试调整搜索或筛选条件。'}
            </p>
            {candidates.length === 0 && <Button onClick={openCreate}><Plus className="h-4 w-4 mr-1" />新增候选人</Button>}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(c => {
            const avg = avgScore(c);
            return (
              <Card key={c.id} className="h-full flex flex-col">
                <CardContent className="p-4 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <Checkbox checked={selected.has(c.id)} onCheckedChange={() => toggleSelect(c.id)} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="font-semibold truncate">{c.name}</p>
                          {c.favorite && <Star className="h-3.5 w-3.5 fill-chart-4 text-chart-4 shrink-0" />}
                        </div>
                        {c.position && (
                          <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                            <Briefcase className="h-3 w-3" />{c.position}
                          </p>
                        )}
                      </div>
                    </div>
                    {avg !== null && (
                      <Badge variant="outline" className="text-xs shrink-0">{avg}分</Badge>
                    )}
                  </div>

                  {c.email && (
                    <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                      <Mail className="h-3 w-3" />{c.email}
                    </p>
                  )}

                  {c.tags && c.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {c.tags.map(t => (
                        <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                      ))}
                    </div>
                  )}

                  {c.notes && (
                    <p className="text-xs text-muted-foreground line-clamp-2 text-pretty flex-1">{c.notes}</p>
                  )}

                  <div className="flex items-center gap-1 mt-3 pt-3 border-t">
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs flex-1" onClick={() => openEdit(c)}>
                      <Pencil className="h-3 w-3 mr-1" />编辑
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleFav(c)}>
                      {c.favorite ? <StarOff className="h-3 w-3" /> : <Star className="h-3 w-3" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleteTarget(c)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* 新增/编辑弹窗 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? '编辑候选人' : '新增候选人'}</DialogTitle>
            <DialogDescription>记录候选人基本信息、标签与备注</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>姓名 *</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="如：张三" />
              </div>
              <div className="space-y-1.5">
                <Label>应聘岗位</Label>
                <Input value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))} placeholder="如：前端工程师" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>邮箱</Label>
              <Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="候选人邮箱" />
            </div>
            <div className="space-y-1.5">
              <Label>标签</Label>
              <div className="flex items-center gap-2">
                <Input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }} placeholder="输入标签后回车" />
                <Button type="button" variant="outline" size="sm" onClick={addTag}><Tag className="h-3.5 w-3.5" /></Button>
              </div>
              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {form.tags.map(t => (
                    <Badge key={t} variant="secondary" className="text-xs gap-1">
                      {t}
                      <button type="button" onClick={() => removeTag(t)}><X className="h-3 w-3" /></button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>备注</Label>
              <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="面试评价、亮点、跟进事项等" rows={3} />
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
            <AlertDialogTitle>确认删除该候选人？</AlertDialogTitle>
            <AlertDialogDescription>
              将永久删除候选人「{deleteTarget?.name}」，此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>确认删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 平台人才库：从真实学员中挑选 */}
      <Dialog open={talentOpen} onOpenChange={setTalentOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>平台人才库</DialogTitle>
            <DialogDescription>从已完成胜任力测评的真实平台学员中挑选，一键加入候选人池。</DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-3 py-1">
            <Select
              value={intentValue(INTENTS.find(i => intentValue(i) === talentIntent) || '全部方向')}
              onValueChange={(v) => { setTalentIntent(v); loadTalent(v); }}
            >
              <SelectTrigger className="w-44">
                <SelectValue placeholder="求职方向" />
              </SelectTrigger>
              <SelectContent>
                {INTENTS.map(i => (
                  <SelectItem key={i} value={intentValue(i)}>{i}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">共 {talentList.length} 位学员</span>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto">
            {talentLoading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">加载中...</div>
            ) : talentList.length === 0 ? (
              <EmptyState
                icon={Users}
                title="暂无符合条件的学员"
                description="当前还没有完成测评的学员，或换个求职方向试试。"
              />
            ) : (
              <div className="space-y-2">
                {talentList.map(t => (
                  <div key={t.user_id} className="flex items-center gap-3 rounded-lg border p-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                      {t.nickname?.charAt(0) || '学'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{t.nickname}</span>
                        {t.job_intent ? <Badge variant="outline" className="shrink-0 text-xs">{t.job_intent}</Badge> : null}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {t.university_name || '院校未填'} · {t.job_title || '未测评岗位'}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-lg font-bold text-primary">{t.total_score ?? '-'}</div>
                      <div className="text-xs text-muted-foreground">综合分</div>
                    </div>
                    <Button size="sm" className="shrink-0" disabled={addingId === t.user_id} onClick={() => handleAddTalent(t)}>
                      {addingId === t.user_id ? '添加中...' : '加入'}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}