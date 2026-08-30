import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import { Search, Eye, Download, TrendingUp } from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import { toast } from 'sonner';

export default function StudentManagePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [majorFilter, setMajorFilter] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isAssessmentDialogOpen, setIsAssessmentDialogOpen] = useState(false);

  const students = [
    {
      id: 1,
      name: '张三',
      studentId: '2022001',
      major: '计算机科学与技术',
      grade: '2022级',
      competency: { tech: 85, general: 78, behavior: 82, experience: 70 },
      avgScore: 79,
      status: 'employed',
      company: '阿里巴巴',
      salary: '28K'
    },
    {
      id: 2,
      name: '李四',
      studentId: '2022002',
      major: '软件工程',
      grade: '2022级',
      competency: { tech: 78, general: 82, behavior: 85, experience: 75 },
      avgScore: 80,
      status: 'employed',
      company: '腾讯',
      salary: '30K'
    },
    {
      id: 3,
      name: '王五',
      studentId: '2022003',
      major: '数据科学',
      grade: '2022级',
      competency: { tech: 72, general: 68, behavior: 75, experience: 60 },
      avgScore: 69,
      status: 'seeking',
      company: '-',
      salary: '-'
    },
    {
      id: 4,
      name: '赵六',
      studentId: '2022004',
      major: '人工智能',
      grade: '2022级',
      competency: { tech: 88, general: 85, behavior: 80, experience: 82 },
      avgScore: 84,
      status: 'employed',
      company: '字节跳动',
      salary: '35K'
    },
  ];

  const filteredStudents = students.filter(student =>
    student.name.includes(searchTerm) &&
    (majorFilter === 'all' || student.major === majorFilter)
  );

  const getStatusBadge = (status: string) => {
    const statusMap = {
      employed: { label: '已能力发展', variant: 'default' as const },
      seeking: { label: '进阶中', variant: 'secondary' as const },
      postgraduate: { label: '升学', variant: 'outline' as const },
    };
    const config = statusMap[status as keyof typeof statusMap];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const radarOption = {
    tooltip: {},
    radar: {
      indicator: [
        { name: '专业技能', max: 100 },
        { name: '通用能力', max: 100 },
        { name: '行为特质', max: 100 },
        { name: '经验背景', max: 100 }
      ],
      radius: '60%'
    },
    series: [
      {
        name: '胜任力',
        type: 'radar',
        data: filteredStudents.slice(0, 3).map((student, index) => ({
          value: [
            student.competency.tech,
            student.competency.general,
            student.competency.behavior,
            student.competency.experience
          ],
          name: student.name,
          areaStyle: {
            color: index === 0 ? 'rgba(22, 93, 255, 0.2)' : index === 1 ? 'rgba(0, 180, 42, 0.2)' : 'rgba(255, 125, 0, 0.2)'
          },
          lineStyle: {
            color: index === 0 ? '#165DFF' : index === 1 ? '#00B42A' : '#FF7D00'
          },
          itemStyle: {
            color: index === 0 ? '#165DFF' : index === 1 ? '#00B42A' : '#FF7D00'
          }
        }))
      }
    ]
  };

  const handleExportData = () => {
    toast.success('正在导出学员数据...');
    // 模拟导出
    setTimeout(() => {
      toast.success('数据导出成功！');
    }, 1000);
  };

  const handleViewAssessment = (student: any) => {
    setSelectedStudent(student);
    setIsAssessmentDialogOpen(true);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">学员管理</h1>
          <p className="mt-1 text-muted-foreground">
            全面掌握学员能力画像和能力发展进展
          </p>
        </div>
        <Button variant="outline" onClick={handleExportData}>
          <Download className="mr-2 h-4 w-4" />
          导出报告
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              在校学员
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3,245</div>
            <p className="text-xs text-muted-foreground">2026届毕业生</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              已完成测评
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">2,856</div>
            <p className="text-xs text-muted-foreground">完成率 88%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              平均胜任力
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">78分</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success">+3分</span> 较去年
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              能力发展率
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">96.2%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success">+1.2%</span> 较去年
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>学员胜任力对比</CardTitle>
            <CardDescription>Top 3学员能力画像</CardDescription>
          </CardHeader>
          <CardContent>
            <ReactECharts option={radarOption} style={{ height: '350px' }} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>能力分布统计</CardTitle>
            <CardDescription>各维度平均得分</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: '专业技能', score: 78, color: 'bg-primary' },
              { name: '通用能力', score: 82, color: 'bg-success' },
              { name: '行为特质', score: 85, color: 'bg-warning' },
              { name: '经验背景', score: 72, color: 'bg-chart-4' },
            ].map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className="text-sm font-semibold text-primary">{item.score}分</span>
                </div>
                <Progress value={item.score} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>学员列表</CardTitle>
              <CardDescription>查看学员详细信息和能力画像</CardDescription>
            </div>
            <div className="flex items-center space-x-3">
              <Select value={majorFilter} onValueChange={setMajorFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="筛选专业" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部专业</SelectItem>
                  <SelectItem value="计算机科学与技术">计算机科学与技术</SelectItem>
                  <SelectItem value="软件工程">软件工程</SelectItem>
                  <SelectItem value="数据科学">数据科学</SelectItem>
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
                <TableHead>姓名</TableHead>
                <TableHead>学号</TableHead>
                <TableHead>专业</TableHead>
                <TableHead>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="h-4 w-4" />
                    <span>平均胜任力</span>
                  </div>
                </TableHead>
                <TableHead>能力发展状态</TableHead>
                <TableHead>能力发展单位</TableHead>
                <TableHead>薪资</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>{student.studentId}</TableCell>
                  <TableCell>{student.major}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-lg font-bold text-primary">{student.avgScore}分</div>
                      <Progress value={student.avgScore} className="h-1.5 w-20" />
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(student.status)}</TableCell>
                  <TableCell>{student.company}</TableCell>
                  <TableCell>
                    {student.salary !== '-' && (
                      <span className="font-semibold text-warning">{student.salary}</span>
                    )}
                    {student.salary === '-' && <span className="text-muted-foreground">-</span>}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleViewAssessment(student)}
                      title="查看能力测评信息"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 能力测评信息对话框 */}
      <Dialog open={isAssessmentDialogOpen} onOpenChange={setIsAssessmentDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedStudent?.name} - 能力测评信息</DialogTitle>
            <DialogDescription>
              学号：{selectedStudent?.studentId} | 专业：{selectedStudent?.major}
            </DialogDescription>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-6">
              {/* 能力雷达图 */}
              <div className="h-80">
                <ReactECharts
                  option={{
                    radar: {
                      indicator: [
                        { name: '技术能力', max: 100 },
                        { name: '通用能力', max: 100 },
                        { name: '行为能力', max: 100 },
                        { name: '实践经验', max: 100 }
                      ],
                      splitArea: {
                        areaStyle: {
                          color: ['rgba(114, 172, 209, 0.1)', 'rgba(114, 172, 209, 0.2)']
                        }
                      }
                    },
                    series: [{
                      type: 'radar',
                      data: [{
                        value: [
                          selectedStudent.competency.tech,
                          selectedStudent.competency.general,
                          selectedStudent.competency.behavior,
                          selectedStudent.competency.experience
                        ],
                        name: '能力评分',
                        areaStyle: {
                          color: 'rgba(99, 102, 241, 0.3)'
                        }
                      }]
                    }]
                  }}
                  style={{ height: '100%', width: '100%' }}
                />
              </div>

              {/* 能力详情 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="mb-2 text-sm font-medium text-muted-foreground">技术能力</p>
                  <div className="flex items-center space-x-2">
                    <Progress value={selectedStudent.competency.tech} className="flex-1" />
                    <span className="text-sm font-semibold">{selectedStudent.competency.tech}</span>
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium text-muted-foreground">通用能力</p>
                  <div className="flex items-center space-x-2">
                    <Progress value={selectedStudent.competency.general} className="flex-1" />
                    <span className="text-sm font-semibold">{selectedStudent.competency.general}</span>
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium text-muted-foreground">行为能力</p>
                  <div className="flex items-center space-x-2">
                    <Progress value={selectedStudent.competency.behavior} className="flex-1" />
                    <span className="text-sm font-semibold">{selectedStudent.competency.behavior}</span>
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium text-muted-foreground">实践经验</p>
                  <div className="flex items-center space-x-2">
                    <Progress value={selectedStudent.competency.experience} className="flex-1" />
                    <span className="text-sm font-semibold">{selectedStudent.competency.experience}</span>
                  </div>
                </div>
              </div>

              {/* 综合评分 */}
              <div className="rounded-lg bg-primary/10 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">综合评分</span>
                  <span className="text-2xl font-bold text-primary">{selectedStudent.avgScore}</span>
                </div>
              </div>

              <Button className="w-full" onClick={() => setIsAssessmentDialogOpen(false)}>
                关闭
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
