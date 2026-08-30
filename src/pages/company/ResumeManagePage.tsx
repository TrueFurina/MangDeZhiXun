import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Upload, Search, Download, Eye, Star, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function ResumeManagePage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState('all');
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 模拟能力档案数据
  const resumes = [
    {
      id: 1,
      name: '张三',
      position: 'AI算法工程师',
      matchScore: 92,
      education: '硕士',
      experience: '5年',
      skills: ['深度学习', 'Python', 'TensorFlow'],
      status: 'pending',
      appliedAt: '2026-03-10'
    },
    {
      id: 2,
      name: '李四',
      position: '前端开发工程师',
      matchScore: 88,
      education: '本科',
      experience: '3年',
      skills: ['React', 'TypeScript', 'Vue'],
      status: 'interview',
      appliedAt: '2026-03-09'
    },
    {
      id: 3,
      name: '王五',
      position: 'AI算法工程师',
      matchScore: 85,
      education: '硕士',
      experience: '4年',
      skills: ['机器学习', 'Python', 'PyTorch'],
      status: 'pending',
      appliedAt: '2026-03-08'
    },
    {
      id: 4,
      name: '赵六',
      position: '产品经理',
      matchScore: 78,
      education: '本科',
      experience: '6年',
      skills: ['产品设计', '需求分析', 'Axure'],
      status: 'offer',
      appliedAt: '2026-03-07'
    },
    {
      id: 5,
      name: '孙七',
      position: '前端开发工程师',
      matchScore: 72,
      education: '本科',
      experience: '2年',
      skills: ['Vue', 'JavaScript', 'CSS'],
      status: 'rejected',
      appliedAt: '2026-03-06'
    },
  ];

  const filteredResumes = resumes
    .filter(resume =>
      resume.name.includes(searchTerm) &&
      (positionFilter === 'all' || resume.position === positionFilter)
    )
    .sort((a, b) => b.matchScore - a.matchScore);

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-primary';
    return 'text-warning';
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: '待筛选', variant: 'secondary' as const },
      interview: { label: '测评中', variant: 'default' as const },
      offer: { label: '已发认证', variant: 'outline' as const },
      rejected: { label: '已淘汰', variant: 'destructive' as const },
    };
    const config = statusMap[status as keyof typeof statusMap];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleBatchUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      toast.success(`已选择 ${files.length} 个文件，正在解析...`);
      // 这里应该调用API上传和解析能力档案
      setTimeout(() => {
        toast.success('能力档案导入成功！');
      }, 1500);
    }
  };

  const handleExportData = () => {
    try {
      // 准备导出数据
      const exportData = filteredResumes.map(resume => ({
        '姓名': resume.name,
        '应聘标准': resume.position,
        '匹配度': `${resume.matchScore}%`,
        '学历': resume.education,
        '工作经验': resume.experience,
        '技能': resume.skills.join(', '),
        '状态': resume.status === 'pending' ? '待处理' : resume.status === 'interviewed' ? '已测评' : '已拒绝',
        '提交时间': resume.appliedAt
      }));

      // 转换为CSV格式
      const headers = Object.keys(exportData[0]);
      const csvContent = [
        headers.join(','),
        ...exportData.map(row => 
          headers.map(header => {
            const value = row[header as keyof typeof row];
            // 处理包含逗号的值，用引号包裹
            return typeof value === 'string' && value.includes(',') 
              ? `"${value}"` 
              : value;
          }).join(',')
        )
      ].join('\n');

      // 添加BOM以支持中文
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      
      // 创建下载链接
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `能力档案数据_${new Date().toISOString().split('T')[0]}.csv`;
      
      // 触发下载
      document.body.appendChild(link);
      link.click();
      
      // 清理
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('数据导出成功！');
    } catch (error) {
      console.error('导出数据失败:', error);
      toast.error('导出失败，请重试');
    }
  };

  const handleToggleFavorite = (id: number) => {
    setFavoriteIds(prev => 
      prev.includes(id) 
        ? prev.filter(fid => fid !== id)
        : [...prev, id]
    );
    toast.success(favoriteIds.includes(id) ? '已取消收藏' : '已收藏');
  };

  return (
    <div className="space-y-6 p-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">能力档案管理</h1>
          <p className="mt-1 text-muted-foreground">
            AI智能解析能力档案，按人标准匹配度自动排序
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleBatchUpload}>
            <Upload className="mr-2 h-4 w-4" />
            批量导入
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
          <Button variant="outline" onClick={handleExportData}>
            <Download className="mr-2 h-4 w-4" />
            导出数据
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              能力档案总数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">856</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success">+128</span> 本周新增
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              高匹配度（≥80%）
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">89</div>
            <p className="text-xs text-muted-foreground">占比 10.4%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              待筛选
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">43</div>
            <p className="text-xs text-muted-foreground">需及时处理</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              测评中
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">27</div>
            <p className="text-xs text-muted-foreground">进行中</p>
          </CardContent>
        </Card>
      </div>

      {/* 能力档案列表 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>能力档案列表</CardTitle>
              <CardDescription>按人标准匹配度从高到低排序</CardDescription>
            </div>
            <div className="flex items-center space-x-3">
              <Select value={positionFilter} onValueChange={setPositionFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="筛选标准" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部标准</SelectItem>
                  <SelectItem value="AI算法工程师">AI算法工程师</SelectItem>
                  <SelectItem value="前端开发工程师">前端开发工程师</SelectItem>
                  <SelectItem value="产品经理">产品经理</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索学员..."
                  className="w-64 pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>学员</TableHead>
                <TableHead>应聘标准</TableHead>
                <TableHead>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="h-4 w-4" />
                    <span>匹配度</span>
                  </div>
                </TableHead>
                <TableHead>学历</TableHead>
                <TableHead>工作经验</TableHead>
                <TableHead>核心技能</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResumes.map((resume) => (
                <TableRow key={resume.id}>
                  <TableCell className="font-medium">{resume.name}</TableCell>
                  <TableCell>{resume.position}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className={`text-lg font-bold ${getMatchScoreColor(resume.matchScore)}`}>
                        {resume.matchScore}%
                      </div>
                      <Progress value={resume.matchScore} className="h-1.5 w-20" />
                    </div>
                  </TableCell>
                  <TableCell>{resume.education}</TableCell>
                  <TableCell>{resume.experience}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {resume.skills.slice(0, 2).map((skill, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {resume.skills.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{resume.skills.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(resume.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => navigate(`/company/resume/${resume.id}`)}
                        title="查看能力档案详情"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleToggleFavorite(resume.id)}
                        title={favoriteIds.includes(resume.id) ? '取消收藏' : '收藏'}
                      >
                        <Star 
                          className={`h-4 w-4 ${favoriteIds.includes(resume.id) ? 'fill-yellow-400 text-yellow-400' : ''}`} 
                        />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
