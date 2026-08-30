import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Clock, Users, ArrowRight, Search, Loader2, ClipboardList } from 'lucide-react';
import { getAllAssessments, type Assessment } from '@/db/api';
import { EmptyState } from '@/components/common/EmptyState';

export default function EvaluationCenterPage() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [searchTerm, setSearchTerm] = useState('');
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = ['全部', '技术开发', 'AI与数据', '产品运营', '设计', '智能制造', '新兴技术'];

  // 加载测评数据
  useEffect(() => {
    loadAssessments();
  }, []);

  const loadAssessments = async () => {
    setLoading(true);
    const data = await getAllAssessments();
    setAssessments(data);
    setLoading(false);
  };

  // 难度映射
  const difficultyMap: Record<string, string> = {
    easy: '初级',
    medium: '中级',
    hard: '高级'
  };

  // 筛选测评数据
  const filteredEvaluations = assessments.filter(item => {
    const matchCategory = selectedCategory === '全部' || item.category === selectedCategory;
    const matchSearch = item.position_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchCategory && matchSearch;
  });

  const handleStartEvaluation = (assessmentId: string) => {
    navigate(`/student/evaluation/test/${assessmentId}`);
  };

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold">测评中心</h1>
        <p className="mt-2 text-muted-foreground">
          选择你感兴趣的标准，开始专业的胜任力测评
        </p>
      </div>

      {/* 搜索和筛选 */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="搜索标准名称..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* 分类标签 */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="flex-wrap h-auto">
          {categories.map((category) => (
            <TabsTrigger key={category} value={category}>
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category} value={category} className="mt-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">加载中...</span>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredEvaluations.length > 0 ? (
                  filteredEvaluations.map((assessment) => (
                    <Card key={assessment.id} className="transition-shadow hover:shadow-lg">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center space-x-2">
                              {assessment.icon && <span className="text-2xl">{assessment.icon}</span>}
                              <CardTitle className="text-lg">{assessment.position_name}</CardTitle>
                            </div>
                            <CardDescription className="line-clamp-2">
                              {assessment.description || '暂无描述'}
                            </CardDescription>
                          </div>
                          <Badge variant="outline">{assessment.category}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{assessment.duration_minutes}分钟</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Users className="h-4 w-4" />
                              <span>{assessment.participant_count}人已测</span>
                            </div>
                            <Badge
                              variant={
                                assessment.difficulty_level === 'hard'
                                  ? 'destructive'
                                  : assessment.difficulty_level === 'medium'
                                    ? 'default'
                                    : 'secondary'
                              }
                            >
                              {difficultyMap[assessment.difficulty_level]}
                            </Badge>
                          </div>
                          <Button 
                            className="w-full group" 
                            onClick={() => handleStartEvaluation(assessment.id)}
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            开始测评
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <EmptyState
                    className="col-span-full"
                    icon={ClipboardList}
                    title="暂无相关测评标准"
                    description="换个分类或搜索关键词试试，或浏览全部测评标准。"
                    action={
                      <Button variant="outline" onClick={() => { setSelectedCategory('全部'); setSearchTerm(''); }}>
                        查看全部标准
                      </Button>
                    }
                  />
                )}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* 测评说明 */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <h3 className="mb-3 font-semibold">测评说明</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• 测评基于Spencer冰山模型和McClelland胜任力理论设计</li>
            <li>• 包含专业技能、通用能力、行为特质、经验背景四个维度</li>
            <li>• 每个标准20+道专业题目，题目来源于真实工作场景</li>
            <li>• 建议在安静的环境下完成测评，确保网络稳定</li>
            <li>• 测评结果将生成详细的能力报告和成长建议</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
