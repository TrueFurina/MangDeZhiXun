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
import { Plus, Search, Edit, Trash2, Eye, HelpCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { 
  getQuestionsAdmin, 
  addQuestionAdmin, 
  updateQuestionAdmin, 
  deleteQuestionAdmin,
  type AdminQuestion 
} from '@/db/api';

export default function QuestionBankPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [questions, setQuestions] = useState<AdminQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState<AdminQuestion | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // 表单状态
  const [formData, setFormData] = useState({
    question_text: '',
    question_type: 'single_choice',
    difficulty: 'medium',
    score: 5,
    status: 'active',
    options: '',
    correct_answer: '',
    explanation: ''
  });

  const loadData = async () => {
    setLoading(true);
    const data = await getQuestionsAdmin();
    setQuestions(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredQuestions = questions.filter((question) => {
    const matchesSearch =
      question.question_text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || question.question_type === filterType;
    return matchesSearch && matchesType;
  });

  const getTypeBadge = (type: string) => {
    const typeMap: any = {
      single_choice: { label: '单选题', variant: 'default' },
      multiple_choice: { label: '多选题', variant: 'secondary' },
      scenario: { label: '场景分析', variant: 'outline' },
      practical: { label: '实操题', variant: 'default' },
      interview: { label: '测评题', variant: 'secondary' },
    };
    const config = typeMap[type] || { label: type, variant: 'outline' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getDifficultyBadge = (difficulty: string) => {
    const difficultyMap: any = {
      easy: { label: '简单', variant: 'secondary' },
      medium: { label: '中等', variant: 'default' },
      hard: { label: '困难', variant: 'destructive' },
    };
    const config = difficultyMap[difficulty] || { label: difficulty, variant: 'outline' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const statusMap: any = {
      active: { label: '启用中', variant: 'default' },
      draft: { label: '草稿', variant: 'secondary' },
      archived: { label: '已归档', variant: 'outline' },
    };
    const config = statusMap[status] || { label: status, variant: 'outline' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除该题目吗？')) {
      const success = await deleteQuestionAdmin(id);
      if (success) {
        toast.success('题目已删除');
        setQuestions(prev => prev.filter(q => q.id !== id));
      } else {
        toast.error('删除失败');
      }
    }
  };

  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData({
      question_text: '',
      question_type: 'single',
      difficulty: 'medium',
      score: 5,
      status: 'active',
      options: '',
      correct_answer: '',
      explanation: ''
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (question: AdminQuestion) => {
    setIsEditing(true);
    setSelectedQuestion(question);
    
    // 解析 options 和 correct_answer
    let optionsStr = '';
    if (question.options) {
      if (Array.isArray(question.options)) {
        optionsStr = question.options.join('\n');
      } else if (typeof question.options === 'object') {
        optionsStr = Object.entries(question.options)
          .map(([k, v]) => `${k}. ${v}`)
          .join('\n');
      }
    }

    setFormData({
      question_text: question.question_text,
      question_type: question.question_type,
      difficulty: question.difficulty,
      score: question.score,
      status: question.status,
      options: optionsStr,
      correct_answer: typeof question.correct_answer === 'string' 
        ? question.correct_answer 
        : JSON.stringify(question.correct_answer),
      explanation: question.explanation || ''
    });
    setIsDialogOpen(true);
  };

  const handleView = (question: AdminQuestion) => {
    setSelectedQuestion(question);
    setIsViewDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.question_text || !formData.correct_answer) {
      toast.error('请填写必要信息');
      return;
    }

    // 处理选项数据
    let optionsData: any = null;
    if (formData.options) {
      const lines = formData.options.split('\n').filter(l => l.trim());
      if (lines.every(l => /^[A-Z]\./.test(l))) {
        optionsData = {};
        lines.forEach(l => {
          const [key, ...rest] = l.split('.');
          optionsData[key.trim()] = rest.join('.').trim();
        });
      } else {
        optionsData = lines;
      }
    }

    const questionData = {
      ...formData,
      options: optionsData,
      correct_answer: formData.correct_answer
    };

    if (isEditing && selectedQuestion) {
      const result = await updateQuestionAdmin(selectedQuestion.id, questionData);
      if (result) {
        toast.success('题目已更新');
        loadData();
        setIsDialogOpen(false);
      } else {
        toast.error('更新失败');
      }
    } else {
      const result = await addQuestionAdmin(questionData);
      if (result) {
        toast.success('题目添加成功');
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
          <h1 className="text-3xl font-bold">测评题库管理</h1>
          <p className="mt-2 text-muted-foreground">
            管理和维护测评题库，包括单选、多选、判断和主观题
          </p>
        </div>
        <Button onClick={handleOpenAdd}>
          <Plus className="mr-2 h-4 w-4" />
          添加题目
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总题目数</CardTitle>
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{questions.length}</div>
            <p className="text-xs text-muted-foreground">题库中的题目</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">启用中</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {questions.filter((q) => q.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">正在使用的题目</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">草稿</CardTitle>
            <XCircle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {questions.filter((q) => q.status === 'draft').length}
            </div>
            <p className="text-xs text-muted-foreground">待审核的题目</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均分值</CardTitle>
            <Eye className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {questions.length > 0 
                ? (questions.reduce((sum, q) => sum + q.score, 0) / questions.length).toFixed(1)
                : 0}
            </div>
            <p className="text-xs text-muted-foreground">分值均值</p>
          </CardContent>
        </Card>
      </div>

      {/* 搜索和筛选 */}
      <Card>
        <CardHeader>
          <CardTitle>题目列表</CardTitle>
          <CardDescription>查看和管理所有测评题目</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索题目内容..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="题目类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                <SelectItem value="single_choice">单选题</SelectItem>
                <SelectItem value="multiple_choice">多选题</SelectItem>
                <SelectItem value="scenario">场景分析</SelectItem>
                <SelectItem value="practical">实操题</SelectItem>
                <SelectItem value="interview">测评题</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="max-w-[300px]">题目内容</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>难度</TableHead>
                <TableHead>分值</TableHead>
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
              ) : filteredQuestions.map((question) => (
                <TableRow key={question.id}>
                  <TableCell className="font-medium max-w-[300px] truncate">
                    {question.question_text}
                  </TableCell>
                  <TableCell>{getTypeBadge(question.question_type)}</TableCell>
                  <TableCell>{getDifficultyBadge(question.difficulty)}</TableCell>
                  <TableCell>{question.score}分</TableCell>
                  <TableCell>{getStatusBadge(question.status)}</TableCell>
                  <TableCell>{new Date(question.updated_at || question.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleView(question)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(question)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(question.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {!loading && filteredQuestions.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              暂无匹配的测评题目
            </div>
          )}
        </CardContent>
      </Card>

      {/* 添加/编辑题目对话框 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? '编辑测评题目' : '添加测评题目'}</DialogTitle>
            <DialogDescription>
              {isEditing ? '更新现有题目信息' : '添加新的测评题目到题库'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="content">题目内容</Label>
              <Textarea
                id="content"
                placeholder="请输入题目内容"
                rows={3}
                value={formData.question_text}
                onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="type">题目类型</Label>
                <Select 
                  value={formData.question_type} 
                  onValueChange={(v) => setFormData({ ...formData, question_type: v })}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="选择类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single_choice">单选题</SelectItem>
                    <SelectItem value="multiple_choice">多选题</SelectItem>
                    <SelectItem value="scenario">场景分析</SelectItem>
                    <SelectItem value="practical">实操题</SelectItem>
                    <SelectItem value="interview">测评题</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="difficulty">难度</Label>
                <Select 
                  value={formData.difficulty} 
                  onValueChange={(v) => setFormData({ ...formData, difficulty: v })}
                >
                  <SelectTrigger id="difficulty">
                    <SelectValue placeholder="选择难度" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">简单</SelectItem>
                    <SelectItem value="medium">中等</SelectItem>
                    <SelectItem value="hard">困难</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="score">分值</Label>
                <Input 
                  id="score" 
                  type="number" 
                  placeholder="5" 
                  value={formData.score}
                  onChange={(e) => setFormData({ ...formData, score: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">状态</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(v) => setFormData({ ...formData, status: v })}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="选择状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">启用</SelectItem>
                    <SelectItem value="draft">草稿</SelectItem>
                    <SelectItem value="archived">归档</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {(formData.question_type === 'single' || formData.question_type === 'multiple') && (
              <div className="grid gap-2">
                <Label htmlFor="options">选项（按行输入，例如：A. 选项内容）</Label>
                <Textarea
                  id="options"
                  placeholder="A. 选项1&#10;B. 选项2&#10;C. 选项3&#10;D. 选项4"
                  rows={4}
                  value={formData.options}
                  onChange={(e) => setFormData({ ...formData, options: e.target.value })}
                />
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="answer">正确答案</Label>
              <Input 
                id="answer" 
                placeholder="例如：A 或 ABC" 
                value={formData.correct_answer}
                onChange={(e) => setFormData({ ...formData, correct_answer: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="explanation">解析</Label>
              <Textarea
                id="explanation"
                placeholder="请输入题目解析"
                rows={2}
                value={formData.explanation}
                onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
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
            <DialogTitle>题目详情</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-muted-foreground">题目内容</Label>
              <p className="mt-1 font-medium text-lg">{selectedQuestion?.question_text}</p>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-muted-foreground">类型</Label>
                <div className="mt-1">{selectedQuestion && getTypeBadge(selectedQuestion.question_type)}</div>
              </div>
              <div>
                <Label className="text-muted-foreground">难度</Label>
                <div className="mt-1">{selectedQuestion && getDifficultyBadge(selectedQuestion.difficulty)}</div>
              </div>
              <div>
                <Label className="text-muted-foreground">分值</Label>
                <p className="mt-1 font-medium">{selectedQuestion?.score}分</p>
              </div>
            </div>

            {selectedQuestion?.options && (
              <div>
                <Label className="text-muted-foreground">选项</Label>
                <div className="mt-2 space-y-2">
                  {typeof selectedQuestion.options === 'object' && !Array.isArray(selectedQuestion.options) ? (
                    Object.entries(selectedQuestion.options).map(([k, v]) => (
                      <div key={k} className="p-2 rounded border bg-muted/50">
                        <span className="font-bold mr-2">{k}.</span>
                        <span>{String(v)}</span>
                      </div>
                    ))
                  ) : Array.isArray(selectedQuestion.options) ? (
                    selectedQuestion.options.map((opt, i) => (
                      <div key={i} className="p-2 rounded border bg-muted/50">
                        <span>{String(opt)}</span>
                      </div>
                    ))
                  ) : (
                    <p>{JSON.stringify(selectedQuestion.options)}</p>
                  )}
                </div>
              </div>
            )}
            
            <div>
              <Label className="text-muted-foreground">正确答案</Label>
              <p className="mt-1 font-bold text-primary">{selectedQuestion?.correct_answer}</p>
            </div>
            
            <div>
              <Label className="text-muted-foreground">解析</Label>
              <p className="mt-1 text-sm bg-muted p-3 rounded">{selectedQuestion?.explanation || '暂无解析'}</p>
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
