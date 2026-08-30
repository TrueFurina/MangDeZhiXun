import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Edit, Trash2, Eye, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { 
  getCompetencyModelsAdmin, 
  addCompetencyModelAdmin, 
  updateCompetencyModelAdmin, 
  deleteCompetencyModelAdmin,
  getPositions,
  getCompaniesAdmin,
  type AdminCompetencyModel
} from '@/db/api';

export default function CompetencyModelsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [models, setModels] = useState<AdminCompetencyModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [positions, setPositions] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState<AdminCompetencyModel | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // 表单状态
  const [formData, setFormData] = useState({
    model_name: '',
    position_id: 0,
    company_id: 0,
    model_desc: '',
    knowledge_items: [] as any[],
    skills_items: [] as any[],
    quality_items: [] as any[],
    soft_skills_items: [] as any[]
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [modelsData, posData, compData] = await Promise.all([
        getCompetencyModelsAdmin(),
        getPositions(),
        getCompaniesAdmin()
      ]);
      setModels(modelsData);
      setPositions(posData);
      setCompanies(compData);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredModels = models.filter(
    (model) =>
      model.model_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.position_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: number) => {
    if (confirm('确定要删除该模型吗？')) {
      const success = await deleteCompetencyModelAdmin(id);
      if (success) {
        toast.success('综合能力模型已删除');
        setModels(models.filter(m => m.model_id !== id));
      } else {
        toast.error('删除失败');
      }
    }
  };

  const handleOpenCreate = () => {
    setIsEditing(false);
    setFormData({
      model_name: '',
      position_id: positions[0]?.position_id || 0,
      company_id: companies[0]?.company_id || 0,
      model_desc: '',
      knowledge_items: [],
      skills_items: [],
      quality_items: [],
      soft_skills_items: []
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (model: AdminCompetencyModel) => {
    setIsEditing(true);
    setSelectedModel(model);
    setFormData({
      model_name: model.model_name,
      position_id: model.position_id ?? 0,   // null 时 fallback 到 0
      company_id: model.company_id ?? 0,     // null 时 fallback 到 0
      model_desc: model.model_desc || '',
      knowledge_items: model.knowledge_items || [],
      skills_items: model.skills_items || [],
      quality_items: model.quality_items || [],
      soft_skills_items: model.soft_skills_items || []
    });
    setIsDialogOpen(true);
  };

  const handleView = (model: AdminCompetencyModel) => {
    setSelectedModel(model);
    setIsViewDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.model_name || !formData.position_id || !formData.company_id) {
      toast.error('请填写必要信息');
      return;
    }

    if (isEditing && selectedModel) {
      const result = await updateCompetencyModelAdmin(selectedModel.model_id, formData);
      if (result) {
        toast.success('模型更新成功');
        loadData();
        setIsDialogOpen(false);
      } else {
        toast.error('更新失败');
      }
    } else {
      const result = await addCompetencyModelAdmin(formData);
      if (result) {
        toast.success('模型创建成功');
        loadData();
        setIsDialogOpen(false);
      } else {
        toast.error('创建失败');
      }
    }
  };

  const getStatusBadge = (status?: string) => {
    return <Badge variant="default">启用中</Badge>;
  };

  return (
    <div className="space-y-6 p-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">标准综合能力模型管理</h1>
          <p className="mt-2 text-muted-foreground">
            管理和维护各标准的综合能力模型，包括知识、技能、素质、软技能四个维度
          </p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 h-4 w-4" />
          新建模型
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总模型数</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{models.length}</div>
            <p className="text-xs text-muted-foreground">已创建的综合能力模型</p>
          </CardContent>
        </Card>
        {/* 其他卡片省略或简化 */}
      </div>

      {/* 搜索和筛选 */}
      <Card>
        <CardHeader>
          <CardTitle>模型列表</CardTitle>
          <CardDescription>查看和管理所有标准综合能力模型</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索模型名称、标准或企业..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>模型名称</TableHead>
                <TableHead>关联标准</TableHead>
                <TableHead>所属企业</TableHead>
                <TableHead>维度数</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>更新时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                  </TableCell>
                </TableRow>
              ) : filteredModels.map((model) => (
                <TableRow key={model.model_id}>
                  <TableCell className="font-medium">{model.model_name}</TableCell>
                  <TableCell>{model.position_name}</TableCell>
                  <TableCell>{model.company_name}</TableCell>
                  <TableCell>4个维度</TableCell>
                  <TableCell>{getStatusBadge()}</TableCell>
                  <TableCell>{new Date(model.updated_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleView(model)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(model)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(model.model_id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {!loading && filteredModels.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              暂无匹配的综合能力模型
            </div>
          )}
        </CardContent>
      </Card>

      {/* 新建/编辑对话框 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? '编辑综合能力模型' : '新建综合能力模型'}</DialogTitle>
            <DialogDescription>
              {isEditing ? '修改综合能力模型定义' : '创建新的标准综合能力模型，定义四维度能力要求'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="model-name">模型名称</Label>
              <Input 
                id="model-name" 
                placeholder="例如：软件工程师综合能力模型" 
                value={formData.model_name}
                onChange={(e) => setFormData({ ...formData, model_name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="position">关联标准</Label>
              <Select 
                value={formData.position_id.toString()} 
                onValueChange={(value) => setFormData({ ...formData, position_id: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择标准" />
                </SelectTrigger>
                <SelectContent>
                  {positions.map((p) => (
                    <SelectItem key={p.position_id} value={p.position_id.toString()}>
                      {p.position_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="company">所属企业</Label>
              <Select 
                value={formData.company_id.toString()} 
                onValueChange={(value) => setFormData({ ...formData, company_id: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择企业" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((c) => (
                    <SelectItem key={c.company_id} value={c.company_id.toString()}>
                      {c.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">模型描述</Label>
              <Textarea
                id="description"
                placeholder="描述该综合能力模型的适用范围和特点"
                rows={3}
                value={formData.model_desc}
                onChange={(e) => setFormData({ ...formData, model_desc: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSubmit}>
              {isEditing ? '保存修改' : '立即创建'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 查看详情对话框 */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>模型详情：{selectedModel?.model_name}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">关联标准</Label>
                <p className="font-medium">{selectedModel?.position_name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">所属企业</Label>
                <p className="font-medium">{selectedModel?.company_name}</p>
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">模型描述</Label>
              <p className="text-sm">{selectedModel?.model_desc || '暂无描述'}</p>
            </div>
            
            <div className="grid gap-4">
              <h4 className="font-semibold border-b pb-2">能力维度</h4>
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="p-3">
                    <CardTitle className="text-sm">知识维度</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <p className="text-xs text-muted-foreground">
                      {Array.isArray(selectedModel?.knowledge_items) && selectedModel.knowledge_items.length > 0 
                        ? selectedModel.knowledge_items.join('、') 
                        : '未定义'}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="p-3">
                    <CardTitle className="text-sm">技能维度</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <p className="text-xs text-muted-foreground">
                      {Array.isArray(selectedModel?.skills_items) && selectedModel.skills_items.length > 0 
                        ? selectedModel.skills_items.join('、') 
                        : '未定义'}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="p-3">
                    <CardTitle className="text-sm">素质维度</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <p className="text-xs text-muted-foreground">
                      {Array.isArray(selectedModel?.quality_items) && selectedModel.quality_items.length > 0 
                        ? selectedModel.quality_items.join('、') 
                        : '未定义'}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="p-3">
                    <CardTitle className="text-sm">软技能维度</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <p className="text-xs text-muted-foreground">
                      {Array.isArray(selectedModel?.soft_skills_items) && selectedModel.soft_skills_items.length > 0 
                        ? selectedModel.soft_skills_items.join('、') 
                        : '未定义'}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
