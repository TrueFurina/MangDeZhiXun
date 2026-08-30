import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Plus, Edit, Trash2, Power, PowerOff, Target, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

interface CompetencyModel {
  id: string;
  job_name: string;
  model_name: string;
  dimension_config: {
    knowledge: number;
    skill: number;
    professionalism: number;
    soft_skill: number;
  };
  question_ids: string[];
  status: number;
  create_time: string;
}

export default function EnterpriseModelsPage() {
  const { user } = useAuth();
  const [models, setModels] = useState<CompetencyModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // 表单状态
  const [editingId, setEditingId] = useState<string | null>(null);
  const [jobName, setJobName] = useState('');
  const [modelName, setModelName] = useState('');
  const [dimensions, setDimensions] = useState({
    knowledge: 25,
    skill: 25,
    professionalism: 25,
    soft_skill: 25
  });

  useEffect(() => {
    if (user) {
      loadModels();
    }
  }, [user]);

  const loadModels = async () => {
    if (!user?.id) {
      setLoading(false);
      setModels([]);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('enterprise_competency_model')
        .select('*')
        .eq('enterprise_id', user.id)
        .order('create_time', { ascending: false });

      if (error) throw error;
      setModels(data || []);
    } catch (err: any) {
      toast.error('加载模型失败: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (model?: CompetencyModel) => {
    if (model) {
      setEditingId(model.id);
      setJobName(model.job_name);
      setModelName(model.model_name);
      setDimensions(model.dimension_config || {
        knowledge: 25, skill: 25, professionalism: 25, soft_skill: 25
      });
    } else {
      setEditingId(null);
      setJobName('');
      setModelName('');
      setDimensions({
        knowledge: 25, skill: 25, professionalism: 25, soft_skill: 25
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!jobName || !modelName) {
      toast.error('请填写完整的岗位名称和模型名称');
      return;
    }

    if (!user?.id) {
      toast.error('登录状态异常，请重新登录');
      return;
    }

    const totalWeight = dimensions.knowledge + dimensions.skill + dimensions.professionalism + dimensions.soft_skill;
    if (totalWeight !== 100) {
      toast.error(`权重总和必须为100%，当前为 ${totalWeight}%`);
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        const { error } = await supabase
          .from('enterprise_competency_model')
          .update({
            job_name: jobName,
            model_name: modelName,
            dimension_config: dimensions,
            update_time: new Date().toISOString()
          })
          .eq('id', editingId);
        if (error) throw error;
        toast.success('模型更新成功');
      } else {
        const { error } = await supabase
          .from('enterprise_competency_model')
          .insert({
            enterprise_id: user.id,
            job_name: jobName,
            model_name: modelName,
            dimension_config: dimensions,
            question_ids: [], // 实际业务中这里可以提供题库选择
            status: 1
          });
        if (error) throw error;
        toast.success('模型创建成功');
      }
      setDialogOpen(false);
      loadModels();
    } catch (err: any) {
      toast.error('保存失败: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: number) => {
    try {
      const { error } = await supabase
        .from('enterprise_competency_model')
        .update({ status: currentStatus === 1 ? 0 : 1 })
        .eq('id', id);
      if (error) throw error;
      toast.success(currentStatus === 1 ? '模型已停用' : '模型已启用');
      loadModels();
    } catch (err: any) {
      toast.error('操作失败: ' + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除该模型吗？该操作不可恢复。')) return;
    try {
      const { error } = await supabase
        .from('enterprise_competency_model')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast.success('模型已删除');
      loadModels();
    } catch (err: any) {
      // 外键约束可能导致删除失败
      if (err.message?.includes('foreign key constraint')) {
        toast.error('删除失败：该模型已有关联的评估记录，无法删除');
      } else {
        toast.error('删除失败: ' + err.message);
      }
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">专属胜任力模型</h1>
          <p className="text-muted-foreground mt-2">创建并管理符合企业真实需求的岗位胜任力模型，智能下发评估测试。</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          新建模型
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="rounded-md border-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>模型名称</TableHead>
                  <TableHead>关联岗位</TableHead>
                  <TableHead>维度权重配比</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                      数据加载中...
                    </TableCell>
                  </TableRow>
                ) : models.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      暂无自定义胜任力模型，请点击右上角新建。
                    </TableCell>
                  </TableRow>
                ) : (
                  models.map((model) => (
                    <TableRow key={model.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-primary" />
                          {model.model_name}
                        </div>
                      </TableCell>
                      <TableCell>{model.job_name}</TableCell>
                      <TableCell>
                        <div className="text-xs space-y-1">
                          <div className="flex gap-2">
                            <span className="text-muted-foreground w-16">知识:</span>
                            <span className="font-medium">{model.dimension_config?.knowledge || 0}%</span>
                            <span className="text-muted-foreground w-16 ml-2">专业技能:</span>
                            <span className="font-medium">{model.dimension_config?.skill || 0}%</span>
                          </div>
                          <div className="flex gap-2">
                            <span className="text-muted-foreground w-16">职业素养:</span>
                            <span className="font-medium">{model.dimension_config?.professionalism || 0}%</span>
                            <span className="text-muted-foreground w-16 ml-2">软实力:</span>
                            <span className="font-medium">{model.dimension_config?.soft_skill || 0}%</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {model.status === 1 ? (
                          <Badge className="bg-green-500">已启用</Badge>
                        ) : (
                          <Badge variant="secondary">已停用</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {format(new Date(model.create_time), 'yyyy-MM-dd')}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(model)}>
                          <Edit className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => toggleStatus(model.id, model.status)}>
                          {model.status === 1 ? (
                            <PowerOff className="h-4 w-4 text-yellow-500" />
                          ) : (
                            <Power className="h-4 w-4 text-green-500" />
                          )}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(model.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingId ? '编辑胜任力模型' : '新建胜任力模型'}</DialogTitle>
            <DialogDescription>
              企业可根据实际招聘需求，灵活调整四大评估维度的权重配比。权重总和必须为100%。
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="modelName">模型名称 <span className="text-red-500">*</span></Label>
              <Input id="modelName" value={modelName} onChange={e => setModelName(e.target.value)} placeholder="如：高级后端工程师胜任力模型 v1.0" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="jobName">关联岗位 <span className="text-red-500">*</span></Label>
              <Input id="jobName" value={jobName} onChange={e => setJobName(e.target.value)} placeholder="如：Java架构师" />
            </div>
            
            <div className="space-y-4 pt-4 border-t">
              <Label className="text-base font-semibold">评估维度权重配比</Label>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">当前总权重：</span>
                <span className={`font-bold ${dimensions.knowledge + dimensions.skill + dimensions.professionalism + dimensions.soft_skill === 100 ? 'text-green-600' : 'text-red-500'}`}>
                  {dimensions.knowledge + dimensions.skill + dimensions.professionalism + dimensions.soft_skill}%
                </span>
              </div>
              
              <div className="grid gap-2">
                <div className="flex justify-between">
                  <Label>基础知识 (Knowledge)</Label>
                  <span className="text-sm font-medium">{dimensions.knowledge}%</span>
                </div>
                <Slider 
                  value={[dimensions.knowledge]} 
                  max={100} step={5} 
                  onValueChange={v => setDimensions(d => ({ ...d, knowledge: v[0] }))} 
                />
              </div>
              
              <div className="grid gap-2">
                <div className="flex justify-between">
                  <Label>专业技能 (Professional Skill)</Label>
                  <span className="text-sm font-medium">{dimensions.skill}%</span>
                </div>
                <Slider 
                  value={[dimensions.skill]} 
                  max={100} step={5} 
                  onValueChange={v => setDimensions(d => ({ ...d, skill: v[0] }))} 
                />
              </div>
              
              <div className="grid gap-2">
                <div className="flex justify-between">
                  <Label>职业素养 (Professionalism)</Label>
                  <span className="text-sm font-medium">{dimensions.professionalism}%</span>
                </div>
                <Slider 
                  value={[dimensions.professionalism]} 
                  max={100} step={5} 
                  onValueChange={v => setDimensions(d => ({ ...d, professionalism: v[0] }))} 
                />
              </div>
              
              <div className="grid gap-2">
                <div className="flex justify-between">
                  <Label>通用软实力 (Soft Skill)</Label>
                  <span className="text-sm font-medium">{dimensions.soft_skill}%</span>
                </div>
                <Slider 
                  value={[dimensions.soft_skill]} 
                  max={100} step={5} 
                  onValueChange={v => setDimensions(d => ({ ...d, soft_skill: v[0] }))} 
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>取消</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              保存配置
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}