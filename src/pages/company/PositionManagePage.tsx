import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Plus, Search, Edit, Trash2, Eye, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getPositions, deletePosition, type Position } from '@/db/api';
import { type Skill } from '@/types/platform';

export default function PositionManagePage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);

  // 加载标准数据
  useEffect(() => {
    loadPositions();
  }, []);

  const loadPositions = async () => {
    setLoading(true);
    try {
      const data = await getPositions();
      setPositions(data);
    } catch (error) {
      console.error('加载标准数据失败:', error);
      toast.error('加载标准数据失败');
    } finally {
      setLoading(false);
    }
  };

  const filteredPositions = positions.filter(pos =>
    pos.position_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateModel = (positionId: number) => {
    navigate(`/company/modeling/${positionId}`);
  };

  const handleEditPosition = (positionId: number) => {
    navigate(`/company/position/edit/${positionId}`);
  };

  const handleDeletePosition = async (positionId: number, positionName: string) => {
    if (!window.confirm(`确定要删除标准"${positionName}"吗？`)) {
      return;
    }

    try {
      await deletePosition(positionId);
      toast.success('标准删除成功');
      // 重新加载标准列表
      loadPositions();
    } catch (error) {
      console.error('删除标准失败:', error);
      toast.error('删除失败，请重试');
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">标准管理</h1>
          <p className="mt-1 text-muted-foreground">管理标准推介标准和胜任力模型</p>
        </div>
        <Button 
          className="bg-success hover:bg-success/90"
          onClick={() => navigate('/company/position/create')}
        >
          <Plus className="mr-2 h-4 w-4" />
          新增标准
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              在招标准
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              已建模标准
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">9</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              待建模标准
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">3</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              总能力档案数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">856</div>
          </CardContent>
        </Card>
      </div>

      {/* 标准列表 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>标准列表</CardTitle>
              <CardDescription>管理所有标准推介标准</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索标准..."
                  className="w-64 pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">加载中...</span>
            </div>
          ) : filteredPositions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground">暂无标准数据</p>
              <Button
                className="mt-4"
                onClick={() => navigate('/company/position/create')}
              >
                <Plus className="mr-2 h-4 w-4" />
                发布第一个标准
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>标准名称</TableHead>
                  <TableHead>薪资</TableHead>
                  <TableHead>技能要求</TableHead>
                  <TableHead>胜任力模型</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPositions.map((position) => (
                  <TableRow key={position.position_id}>
                    <TableCell className="font-medium">{position.position_name}</TableCell>
                    <TableCell>{position.salary_range}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {position.required_skills?.slice(0, 3).map((skill: string | Skill, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {typeof skill === 'string' ? skill : skill.skill_name}
                          </Badge>
                        ))}
                        {position.required_skills && position.required_skills.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{position.required_skills.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {position.competency_model_id ? (
                        <Badge variant="outline" className="border-success text-success">
                          已建模
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-warning text-warning">
                          未建模
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={position.status === 'open' ? 'default' : 'secondary'}>
                        {position.status === 'open' ? '标准推介中' : '已暂停'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => navigate(`/company/position/${position.position_id}/analytics`)}
                          title="查看数据可视化"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {!position.competency_model_id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-success hover:text-success"
                            onClick={() => handleCreateModel(position.position_id)}
                            title="创建胜任力模型"
                          >
                            <Sparkles className="h-4 w-4" />
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEditPosition(position.position_id)}
                          title="编辑标准信息"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-destructive" 
                          onClick={() => handleDeletePosition(position.position_id, position.position_name)}
                          title="删除标准"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
