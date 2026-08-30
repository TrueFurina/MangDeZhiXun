import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ContentManagePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // 标准模型数据
  const competencyModels = [
    {
      id: '1',
      positionName: 'AI算法工程师',
      category: '技术开发',
      status: 'active',
      indicators: 12,
      updatedAt: '2024-03-15',
    },
    {
      id: '2',
      positionName: '前端开发工程师',
      category: '技术开发',
      status: 'active',
      indicators: 10,
      updatedAt: '2024-03-10',
    },
  ];

  const handleAdd = () => {
    toast.success('添加成功');
    setIsDialogOpen(false);
  };

  const handleEdit = (id: string) => {
    toast.info(`编辑 ID: ${id}`);
  };

  const handleDelete = (id: string) => {
    toast.success('删除成功');
  };

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'published' || currentStatus === 'active' ? '下架' : '上架';
    toast.success(`已${newStatus}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">内容管理</h1>
        <p className="mt-1 text-muted-foreground">管理标准综合能力模型</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>标准综合能力模型</CardTitle>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              添加模型
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索标准名称..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>标准名称</TableHead>
                <TableHead>分类</TableHead>
                <TableHead>能力指标数</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>更新时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {competencyModels.map((model) => (
                <TableRow key={model.id}>
                  <TableCell className="font-medium">{model.positionName}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{model.category}</Badge>
                  </TableCell>
                  <TableCell>{model.indicators} 项</TableCell>
                  <TableCell>
                    <Badge variant="default">
                      {model.status === 'active' ? '启用' : '禁用'}
                    </Badge>
                  </TableCell>
                  <TableCell>{model.updatedAt}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(model.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(model.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加标准模型</DialogTitle>
            <DialogDescription>填写相关信息</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="position-name">标准名称</Label>
              <Input id="position-name" placeholder="请输入标准名称" />
            </div>
            <div>
              <Label htmlFor="category">分类</Label>
              <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="选择分类" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tech">技术开发</SelectItem>
                      <SelectItem value="product">产品运营</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="description">描述</Label>
                  <Textarea id="description" placeholder="请输入标准描述" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  取消
                </Button>
                <Button onClick={handleAdd}>确定</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      );
    }
