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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, Edit, Trash2, Eye, BookOpen, Video, FileText, Code, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { 
  getLearningResourcesAdmin, 
  addLearningResourceAdmin, 
  updateLearningResourceAdmin, 
  deleteLearningResourceAdmin,
  type AdminLearningResource
} from '@/db/api';

export default function LearningResourcesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [resources, setResources] = useState<AdminLearningResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResource, setSelectedResource] = useState<AdminLearningResource | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // 表单状态
  const [formData, setFormData] = useState({
    resource_name: '',
    resource_type: 'course',
    difficulty_level: 'beginner',
    skill_tags: '',
    duration: 0,
    provider: '',
    resource_url: '',
    resource_desc: ''
  });

  const loadData = async () => {
    setLoading(true);
    const data = await getLearningResourcesAdmin();
    setResources(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.resource_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (typeof resource.skill_tags === 'string' && resource.skill_tags.toLowerCase().includes(searchTerm.toLowerCase())) ||
      resource.provider.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || resource.resource_type === filterType;
    return matchesSearch && matchesType;
  });

  const getTypeIcon = (type: string) => {
    const iconMap = {
      course: <BookOpen className="h-4 w-4" />,
      video: <Video className="h-4 w-4" />,
      article: <FileText className="h-4 w-4" />,
      project: <Code className="h-4 w-4" />,
    };
    return iconMap[type as keyof typeof iconMap] || <FileText className="h-4 w-4" />;
  };

  const getTypeBadge = (type: string) => {
    const typeMap: any = {
      course: { label: '课程', variant: 'default' },
      video: { label: '视频', variant: 'secondary' },
      article: { label: '文章', variant: 'outline' },
      project: { label: '项目', variant: 'default' },
    };
    const config = typeMap[type] || { label: type, variant: 'outline' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getDifficultyBadge = (difficulty: string) => {
    const difficultyMap: any = {
      beginner: { label: '入门', variant: 'secondary' },
      intermediate: { label: '进阶', variant: 'default' },
      advanced: { label: '高级', variant: 'destructive' },
    };
    const config = difficultyMap[difficulty] || { label: difficulty, variant: 'outline' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleDelete = async (id: number) => {
    if (confirm('确定要删除该资源吗？')) {
      const success = await deleteLearningResourceAdmin(id);
      if (success) {
        toast.success('学习资源已删除');
        setResources(prev => prev.filter(r => r.resource_id !== id));
      } else {
        toast.error('删除失败');
      }
    }
  };

  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData({
      resource_name: '',
      resource_type: 'course',
      difficulty_level: 'beginner',
      skill_tags: '',
      duration: 0,
      provider: '',
      resource_url: '',
      resource_desc: ''
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (resource: AdminLearningResource) => {
    setIsEditing(true);
    setSelectedResource(resource);
    setFormData({
      resource_name: resource.resource_name,
      resource_type: resource.resource_type,
      difficulty_level: resource.difficulty_level,
      skill_tags: resource.skill_tags || '',
      duration: resource.duration,
      provider: resource.provider,
      resource_url: resource.resource_url,
      resource_desc: resource.resource_desc || ''
    });
    setIsDialogOpen(true);
  };

  const handleView = (resource: AdminLearningResource) => {
    setSelectedResource(resource);
    setIsViewDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.resource_name || !formData.provider || !formData.resource_url) {
      toast.error('请填写必要信息');
      return;
    }

    if (isEditing && selectedResource) {
      const result = await updateLearningResourceAdmin(selectedResource.resource_id, formData);
      if (result) {
        toast.success('学习资源已更新');
        loadData();
        setIsDialogOpen(false);
      } else {
        toast.error('更新失败');
      }
    } else {
      const result = await addLearningResourceAdmin(formData);
      if (result) {
        toast.success('学习资源添加成功');
        loadData();
        setIsDialogOpen(false);
      } else {
        toast.error('添加失败');
      }
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">学习资源管理</h1>
          <p className="mt-2 text-muted-foreground">
            管理和维护学习资源库，包括课程、视频、文章和项目
          </p>
        </div>
        <Button onClick={handleOpenAdd}>
          <Plus className="mr-2 h-4 w-4" />
          添加资源
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总资源数</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resources.length}</div>
            <p className="text-xs text-muted-foreground">已收录的学习资源</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">课程</CardTitle>
            <BookOpen className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {resources.filter((r) => r.resource_type === 'course').length}
            </div>
            <p className="text-xs text-muted-foreground">系统课程</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">视频</CardTitle>
            <Video className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {resources.filter((r) => r.resource_type === 'video').length}
            </div>
            <p className="text-xs text-muted-foreground">视频教程</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总浏览量</CardTitle>
            <Eye className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {resources.reduce((sum, r) => sum + (r.views || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">累计浏览次数</p>
          </CardContent>
        </Card>
      </div>

      {/* 搜索和筛选 */}
      <Card>
        <CardHeader>
          <CardTitle>资源列表</CardTitle>
          <CardDescription>查看和管理所有学习资源</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索资源标题、分类或提供方..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="资源类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                <SelectItem value="course">课程</SelectItem>
                <SelectItem value="video">视频</SelectItem>
                <SelectItem value="article">文章</SelectItem>
                <SelectItem value="project">项目</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>资源标题</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>分类</TableHead>
                <TableHead>难度</TableHead>
                <TableHead>时长</TableHead>
                <TableHead>提供方</TableHead>
                <TableHead>浏览量</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                  </TableCell>
                </TableRow>
              ) : filteredResources.map((resource) => (
                <TableRow key={resource.resource_id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(resource.resource_type)}
                      <span>{resource.resource_name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getTypeBadge(resource.resource_type)}</TableCell>
                  <TableCell>{resource.skill_tags || '未分类'}</TableCell>
                  <TableCell>{getDifficultyBadge(resource.difficulty_level)}</TableCell>
                  <TableCell>{resource.duration}分钟</TableCell>
                  <TableCell>{resource.provider}</TableCell>
                  <TableCell>{resource.views || 0}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleView(resource)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(resource)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(resource.resource_id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {!loading && filteredResources.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              暂无匹配的学习资源
            </div>
          )}
        </CardContent>
      </Card>

      {/* 添加/编辑资源对话框 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? '编辑学习资源' : '添加学习资源'}</DialogTitle>
            <DialogDescription>
              {isEditing ? '更新现有资源信息' : '添加新的学习资源到资源库'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">资源标题</Label>
              <Input 
                id="title" 
                placeholder="例如：React 从入门到精通" 
                value={formData.resource_name}
                onChange={(e) => setFormData({ ...formData, resource_name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="type">资源类型</Label>
                <Select 
                  value={formData.resource_type} 
                  onValueChange={(v) => setFormData({ ...formData, resource_type: v })}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="选择类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="course">课程</SelectItem>
                    <SelectItem value="video">视频</SelectItem>
                    <SelectItem value="article">文章</SelectItem>
                    <SelectItem value="project">项目</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="difficulty">难度等级</Label>
                <Select 
                  value={formData.difficulty_level} 
                  onValueChange={(v) => setFormData({ ...formData, difficulty_level: v })}
                >
                  <SelectTrigger id="difficulty">
                    <SelectValue placeholder="选择难度" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">入门</SelectItem>
                    <SelectItem value="intermediate">进阶</SelectItem>
                    <SelectItem value="advanced">高级</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">分类</Label>
                <Input 
                  id="category" 
                  placeholder="例如：前端开发" 
                  value={formData.skill_tags}
                  onChange={(e) => setFormData({ ...formData, skill_tags: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="duration">时长（分钟）</Label>
                <Input 
                  id="duration" 
                  type="number" 
                  placeholder="120" 
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="provider">提供方</Label>
              <Input 
                id="provider" 
                placeholder="例如：慕课网" 
                value={formData.provider}
                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="url">资源链接</Label>
              <Input 
                id="url" 
                placeholder="https://..." 
                value={formData.resource_url}
                onChange={(e) => setFormData({ ...formData, resource_url: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">资源描述</Label>
              <Textarea
                id="description"
                placeholder="描述该学习资源的内容和特点"
                rows={3}
                value={formData.resource_desc}
                onChange={(e) => setFormData({ ...formData, resource_desc: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSubmit}>
              {isEditing ? '更新' : '添加'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 查看详情对话框 */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>资源详情</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary/10 rounded-full">
                {selectedResource && getTypeIcon(selectedResource.resource_type)}
              </div>
              <div>
                <h3 className="text-xl font-bold">{selectedResource?.resource_name}</h3>
                <div className="flex space-x-2 mt-1">
                  {selectedResource && getTypeBadge(selectedResource.resource_type)}
                  {selectedResource && getDifficultyBadge(selectedResource.difficulty_level)}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">分类：</span>
                <span>{selectedResource?.skill_tags || '未分类'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">时长：</span>
                <span>{selectedResource?.duration}分钟</span>
              </div>
              <div>
                <span className="text-muted-foreground">提供方：</span>
                <span>{selectedResource?.provider}</span>
              </div>
              <div>
                <span className="text-muted-foreground">浏览量：</span>
                <span>{selectedResource?.views || 0}</span>
              </div>
            </div>
            
            <div>
              <Label className="text-muted-foreground">资源描述</Label>
              <p className="mt-1 text-sm">{selectedResource?.resource_desc || '暂无描述'}</p>
            </div>
            
            <div>
              <Label className="text-muted-foreground">资源链接</Label>
              <div className="mt-1">
                <a 
                  href={selectedResource?.resource_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline break-all"
                >
                  {selectedResource?.resource_url}
                </a>
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
