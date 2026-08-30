import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Sparkles, ArrowRight, ArrowLeft, Check, Loader2, Zap, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
import ReactECharts from 'echarts-for-react';
import { addCompetencyModelAdmin, updateCompetencyModelAdmin, getPositionById, getCompetencyModelByPositionId, type AdminCompetencyModel } from '@/db/api';
import { supabase, getCurrentUserEmail } from '@/lib/supabase';

// AI生成的标准模型数据库
const AI_JOB_MODELS: Record<string, any> = {
  '跨境电商运营': {
    dimensions: [
      { 
        name: '专业知识', 
        weight: 35, 
        items: ['跨境电商平台规则', '国际贸易知识', '海外市场分析', '供应链管理'],
        description: '掌握跨境电商核心业务知识和国际贸易规则'
      },
      { 
        name: '专业技能', 
        weight: 30, 
        items: ['数据分析', '广告投放', '选品能力', 'SEO优化'],
        description: '具备跨境电商运营的核心技能和工具使用能力'
      },
      { 
        name: '职业素养', 
        weight: 20, 
        items: ['市场敏感度', '风险意识', '客户服务', '合规意识'],
        description: '具备跨境电商从业者应有的职业素养和意识'
      },
      { 
        name: '软实力', 
        weight: 15, 
        items: ['跨文化沟通', '学习能力', '抗压能力', '团队协作'],
        description: '具备跨境业务所需的软技能和综合素质'
      }
    ],
    interviewQuestions: [
      {
        category: '专业知识',
        question: '请介绍一下亚马逊和速卖通平台的主要区别，以及各自的运营策略？',
        purpose: '考察对主流跨境电商平台的了解程度'
      },
      {
        category: '专业技能',
        question: '如何通过数据分析来优化产品listing和提升认证率？请举例说明。',
        purpose: '考察数据分析能力和实战经验'
      },
      {
        category: '问题解决',
        question: '如果遇到产品被投诉侵权，你会如何处理？',
        purpose: '考察风险应对和问题解决能力'
      },
      {
        category: '市场洞察',
        question: '请分析一个你认为有潜力的海外市场，并说明选品思路。',
        purpose: '考察市场分析和选品能力'
      },
      {
        category: '软实力',
        question: '在与海外客户沟通时，遇到文化差异导致的误解，你如何处理？',
        purpose: '考察跨文化沟通能力'
      }
    ]
  },
  'AI算法工程师': {
    dimensions: [
      { 
        name: '专业知识', 
        weight: 40, 
        items: ['深度学习理论', '机器学习算法', '数学基础', '计算机视觉/NLP'],
        description: '扎实的AI理论基础和专业知识体系'
      },
      { 
        name: '专业技能', 
        weight: 35, 
        items: ['Python编程', 'PyTorch/TensorFlow', '模型训练优化', '算法实现'],
        description: '熟练的AI开发技能和工具使用能力'
      },
      { 
        name: '职业素养', 
        weight: 15, 
        items: ['技术追踪', '代码规范', '文档能力', '工程思维'],
        description: '良好的工程素养和职业习惯'
      },
      { 
        name: '软实力', 
        weight: 10, 
        items: ['问题分析', '学习能力', '团队协作', '沟通表达'],
        description: '综合软技能和团队协作能力'
      }
    ],
    interviewQuestions: [
      {
        category: '专业知识',
        question: '请解释一下Transformer架构的核心原理，以及为什么它在NLP领域如此成功？',
        purpose: '考察对前沿AI技术的理解深度'
      },
      {
        category: '专业技能',
        question: '在模型训练过程中遇到过拟合问题，你会采取哪些方法来解决？',
        purpose: '考察实际问题解决能力'
      },
      {
        category: '项目经验',
        question: '请介绍一个你参与的AI项目，包括技术选型、遇到的挑战和最终效果。',
        purpose: '考察项目经验和技术深度'
      },
      {
        category: '算法优化',
        question: '如何优化模型的推理速度？请从算法和工程两个角度说明。',
        purpose: '考察性能优化能力'
      },
      {
        category: '技术视野',
        question: '你如何看待大模型的发展趋势？对你的工作有什么影响？',
        purpose: '考察技术视野和学习能力'
      }
    ]
  },
  '产品经理': {
    dimensions: [
      { 
        name: '专业知识', 
        weight: 30, 
        items: ['产品方法论', '用户研究', '行业知识', '商业模式'],
        description: '系统的产品知识和行业理解'
      },
      { 
        name: '专业技能', 
        weight: 30, 
        items: ['需求分析', '原型设计', '数据分析', '项目管理'],
        description: '产品设计和管理的核心技能'
      },
      { 
        name: '职业素养', 
        weight: 20, 
        items: ['用户思维', '数据驱动', '结果导向', '创新意识'],
        description: '产品经理应有的思维方式和工作习惯'
      },
      { 
        name: '软实力', 
        weight: 20, 
        items: ['沟通协调', '逻辑思维', '学习能力', '抗压能力'],
        description: '跨部门协作和综合软技能'
      }
    ],
    interviewQuestions: [
      {
        category: '产品思维',
        question: '如果让你设计一款针对老年人的社交产品，你会如何思考？',
        purpose: '考察产品思维和用户洞察'
      },
      {
        category: '需求分析',
        question: '当技术、运营、老板对需求优先级有不同意见时，你如何决策？',
        purpose: '考察需求判断和决策能力'
      },
      {
        category: '数据分析',
        question: '产品上线后，你会关注哪些核心指标？如何通过数据优化产品？',
        purpose: '考察数据驱动能力'
      },
      {
        category: '项目管理',
        question: '项目延期风险很高，你会如何推动项目按时交付？',
        purpose: '考察项目管理和推动能力'
      },
      {
        category: '产品案例',
        question: '请分析一款你喜欢的产品，说说它的优缺点和改进建议。',
        purpose: '考察产品分析能力'
      }
    ]
  }
};

export default function CompetencyModelingPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [step, setStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quickInput, setQuickInput] = useState('');
  const [positionId, setPositionId] = useState<number | null>(null);
  const [companyId, setCompanyId] = useState<number | null>(null); // 动态获取，不硬编码
  const [existingModel, setExistingModel] = useState<AdminCompetencyModel | null>(null);
  const [jobInfo, setJobInfo] = useState({
    title: '',
    description: '',
    requirements: ''
  });

  // 页面初始化：获取企业ID + 如有 id 参数则加载标准信息
  useEffect(() => {
    // 动态查询当前登录用户所属企业
    const fetchCompanyId = async () => {
      const email = getCurrentUserEmail();
      if (!email) return;
      const { data } = await supabase
        .from('companies')
        .select('company_id')
        .eq('contact_email', email)
        .maybeSingle();
      if (data?.company_id) setCompanyId(data.company_id);
    };
    fetchCompanyId();

    if (id) loadPositionInfo(parseInt(id));
  }, [id]);

  const loadPositionInfo = async (posId: number) => {
    setLoading(true);
    try {
      const position = await getPositionById(posId);
      if (position) {
        setPositionId(posId);
        setJobInfo({
          title: position.position_name,
          description: position.responsibilities || '',
          requirements: position.requirements || ''
        });

        // 尝试加载已保存的胜任力模型
        const savedModel = await getCompetencyModelByPositionId(posId);
        if (savedModel) {
          setExistingModel(savedModel);
          
          // 解析模型数据
          try {
            const modelDesc = typeof savedModel.model_desc === 'string' 
              ? JSON.parse(savedModel.model_desc) 
              : savedModel.model_desc;
            
            if (modelDesc && modelDesc.dimensions) {
              setModel({
                dimensions: modelDesc.dimensions,
                interviewQuestions: modelDesc.interviewQuestions || []
              });
              // 如果已有模型，直接跳到步骤2
              setStep(2);
              toast.success('已加载保存的胜任力模型');
            }
          } catch (error) {
            console.error('解析模型数据失败:', error);
          }
        }
      }
    } catch (error) {
      console.error('加载标准信息失败:', error);
      toast.error('加载标准信息失败');
    } finally {
      setLoading(false);
    }
  };

  // AI生成的胜任力模型
  const [model, setModel] = useState<{
    dimensions: Array<{
      name: string;
      weight: number;
      items: string[];
      description: string;
    }>;
    interviewQuestions: Array<{
      category: string;
      question: string;
      purpose: string;
    }>;
  }>({
    dimensions: [
      { name: '专业技能', weight: 40, items: ['深度学习', 'Python编程', '算法优化', '模型调优'], description: '' },
      { name: '通用能力', weight: 30, items: ['问题分析', '逻辑思维', '学习能力', '沟通协作'], description: '' },
      { name: '行为特质', weight: 20, items: ['责任心', '抗压能力', '创新意识', '团队精神'], description: '' },
      { name: '经验背景', weight: 10, items: ['项目经验', '行业经验', '学历背景', '技术栈'], description: '' }
    ],
    interviewQuestions: []
  });

  // 雷达图配置
  const radarOption = {
    tooltip: {},
    radar: {
      indicator: model.dimensions.map(d => ({ name: d.name, max: 100 })),
      radius: '60%'
    },
    series: [
      {
        name: '权重分布',
        type: 'radar',
        data: [
          {
            value: model.dimensions.map(d => d.weight),
            name: '胜任力模型',
            areaStyle: {
              color: 'rgba(22, 93, 255, 0.2)'
            },
            lineStyle: {
              color: '#165DFF'
            },
            itemStyle: {
              color: '#165DFF'
            }
          }
        ]
      }
    ]
  };

  // 一键生成（输入一句话）
  const handleQuickGenerate = () => {
    if (!quickInput.trim()) {
      toast.error('请输入标准名称或描述');
      return;
    }
    
    setGenerating(true);
    
    // 模拟AI分析过程
    setTimeout(() => {
      // 查找匹配的模型
      let matchedModel = null;
      let matchedTitle = '';
      
      for (const [key, value] of Object.entries(AI_JOB_MODELS)) {
        if (quickInput.includes(key) || key.includes(quickInput)) {
          matchedModel = value;
          matchedTitle = key;
          break;
        }
      }
      
      // 如果没有匹配，使用默认模型
      if (!matchedModel) {
        matchedModel = {
          dimensions: [
            { 
              name: '专业知识', 
              weight: 35, 
              items: ['行业知识', '专业理论', '政策法规', '业务流程'],
              description: '标准所需的专业知识体系'
            },
            { 
              name: '专业技能', 
              weight: 30, 
              items: ['核心技能', '工具使用', '方法应用', '实操能力'],
              description: '标准核心技能和工具使用能力'
            },
            { 
              name: '职业素养', 
              weight: 20, 
              items: ['职业道德', '工作态度', '责任意识', '质量意识'],
              description: '职业素养和工作态度'
            },
            { 
              name: '软实力', 
              weight: 15, 
              items: ['沟通能力', '学习能力', '团队协作', '抗压能力'],
              description: '综合软技能'
            }
          ],
          interviewQuestions: [
            {
              category: '专业知识',
              question: `请介绍一下${quickInput}标准需要掌握的核心专业知识？`,
              purpose: '考察专业知识掌握程度'
            },
            {
              category: '专业技能',
              question: `在${quickInput}工作中，你最常使用哪些工具和方法？`,
              purpose: '考察实际技能和经验'
            },
            {
              category: '问题解决',
              question: `请分享一个你在${quickInput}工作中解决复杂问题的案例。`,
              purpose: '考察问题解决能力'
            },
            {
              category: '职业规划',
              question: `你对${quickInput}这个标准的职业发展有什么规划？`,
              purpose: '考察职业目标和发展意愿'
            },
            {
              category: '综合素质',
              question: `你认为做好${quickInput}工作最重要的素质是什么？`,
              purpose: '考察对标准的理解和自我认知'
            }
          ]
        };
        matchedTitle = quickInput;
      }
      
      setJobInfo({
        title: matchedTitle,
        description: `负责${matchedTitle}相关工作，包括业务规划、执行落地、效果优化等`,
        requirements: `具备${matchedTitle}相关专业背景和工作经验，熟悉行业规则和业务流程`
      });
      
      setModel({
        dimensions: matchedModel.dimensions,
        interviewQuestions: matchedModel.interviewQuestions
      });
      
      setGenerating(false);
      setStep(2);
      toast.success(`已为"${matchedTitle}"生成胜任力模型`);
    }, 6000); // 改为6秒，更符合AI处理时间
  };

  // 传统方式生成
  const handleGenerate = () => {
    if (!jobInfo.description || !jobInfo.requirements) {
      toast.error('请填写完整的标准信息');
      return;
    }
    
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setStep(2);
      toast.success('AI模型生成成功');
    }, 6000); // 改为6秒，更符合AI处理时间
  };

  // 调整权重
  const handleWeightChange = (index: number, value: number[]) => {
    const newDimensions = [...model.dimensions];
    newDimensions[index].weight = value[0];
    setModel({ ...model, dimensions: newDimensions });
  };

  // 保存模型（Bug修复：移除positionId强制校验；动态company_id；existingModel时走update）
  const handleSave = async () => {
    if (!jobInfo.title.trim()) {
      toast.error('请先填写或生成标准信息');
      return;
    }

    setSaving(true);
    try {
      const userEmail = getCurrentUserEmail();
      if (!userEmail) {
        toast.error('请先登录');
        return;
      }

      const modelData = {
        model_name: `${jobInfo.title}-胜任力模型`,
        position_id: positionId ?? null,      // 无标准关联时传 null，数据库允许
        company_id: companyId ?? null,         // 动态查询结果，查不到则 null
        knowledge_items: model.dimensions.find(d => d.name === '专业知识')?.items || [],
        skills_items: model.dimensions.find(d => d.name === '专业技能')?.items || [],
        quality_items: model.dimensions.find(d => d.name === '职业素养')?.items || [],
        soft_skills_items: model.dimensions.find(d => d.name === '软实力')?.items || [],
        model_desc: JSON.stringify({
          dimensions: model.dimensions,
          interviewQuestions: model.interviewQuestions
        })
      };

      let result: AdminCompetencyModel | null = null;

      if (existingModel?.model_id) {
        // Bug修复：已有模型时走 update，避免重复创建
        result = await updateCompetencyModelAdmin(existingModel.model_id, modelData);
      } else {
        result = await addCompetencyModelAdmin(modelData);
      }

      if (result) {
        toast.success('胜任力模型保存成功');
        setTimeout(() => navigate('/company/positions'), 1000);
      } else {
        toast.error('保存失败，请重试');
      }
    } catch (error) {
      console.error('保存模型失败:', error);
      toast.error('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {loading ? (
        <div className="flex h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">标准自动生成</h1>
          <p className="mt-1 text-muted-foreground">
            AI智能生成标准胜任力模型，快速完成标准能力画像
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/company/positions')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回标准列表
        </Button>
      </div>

      {/* 进度条 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                step >= 1 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
              }`}>
                {step > 1 ? <Check className="h-5 w-5" /> : '1'}
              </div>
              <div>
                <div className="font-semibold">输入标准信息</div>
                <div className="text-xs text-muted-foreground">填写标准描述和要求</div>
              </div>
            </div>
            <div className="h-px w-24 bg-border" />
            <div className="flex items-center space-x-2">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                step >= 2 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
              }`}>
                {step > 2 ? <Check className="h-5 w-5" /> : '2'}
              </div>
              <div>
                <div className="font-semibold">AI生成模型</div>
                <div className="text-xs text-muted-foreground">智能分析生成</div>
              </div>
            </div>
            <div className="h-px w-24 bg-border" />
            <div className="flex items-center space-x-2">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                step >= 3 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
              }`}>
                3
              </div>
              <div>
                <div className="font-semibold">调整确认</div>
                <div className="text-xs text-muted-foreground">手动微调权重</div>
              </div>
            </div>
          </div>
          <Progress value={(step / 3) * 100} className="mt-6" />
        </CardContent>
      </Card>

      {/* 步骤1：输入标准信息 */}
      {step === 1 && (
        <div className="space-y-6">
          {/* 一键生成卡片（新功能） */}
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Zap className="h-6 w-6 text-primary" />
                <CardTitle>一键生成（推荐）</CardTitle>
                <Badge variant="default" className="animate-pulse">
                  新功能
                </Badge>
              </div>
              <CardDescription>
                只需输入一句话标准描述，AI自动生成完整的胜任力模型、能力权重和测评问题
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="quickInput">标准名称或描述</Label>
                <div className="flex space-x-2">
                  <Input
                    id="quickInput"
                    value={quickInput}
                    onChange={(e) => setQuickInput(e.target.value)}
                    placeholder="如：跨境电商运营、AI算法工程师、产品经理..."
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleQuickGenerate();
                      }
                    }}
                  />
                  <Button 
                    onClick={handleQuickGenerate} 
                    disabled={generating}
                    size="lg"
                    className="bg-primary hover:bg-primary/90"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        生成中...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        一键生成
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              {/* 示例标签 */}
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-muted-foreground">示例：</span>
                {['跨境电商运营', 'AI算法工程师', '产品经理'].map((example) => (
                  <Badge
                    key={example}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-white"
                    onClick={() => {
                      setQuickInput(example);
                    }}
                  >
                    {example}
                  </Badge>
                ))}
              </div>

              {/* 功能说明 */}
              <div className="rounded-lg bg-muted p-3">
                <div className="flex items-start space-x-2">
                  <HelpCircle className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p><strong>自动生成内容：</strong></p>
                    <ul className="ml-4 list-disc space-y-1">
                      <li>4维度胜任力模型（专业知识、专业技能、职业素养、软实力）</li>
                      <li>各维度能力权重（可手动调整）</li>
                      <li>5-8道针对性测评问题</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 分隔线 */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-dashed" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-4 text-sm text-muted-foreground">
                或使用传统方式
              </span>
            </div>
          </div>

          {/* 传统方式 */}
          <Card>
            <CardHeader>
              <CardTitle>传统方式：详细输入</CardTitle>
              <CardDescription>
                请详细描述标准职责和任职要求，AI将基于此生成胜任力模型
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">标准名称</Label>
                <Input
                  id="title"
                  value={jobInfo.title}
                  onChange={(e) => setJobInfo({ ...jobInfo, title: e.target.value })}
                  placeholder="如：AI算法工程师"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">标准职责</Label>
                <Textarea
                  id="description"
                  value={jobInfo.description}
                  onChange={(e) => setJobInfo({ ...jobInfo, description: e.target.value })}
                  placeholder="请输入标准职责，如：负责深度学习模型的设计、训练和优化..."
                  rows={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="requirements">任职要求</Label>
                <Textarea
                  id="requirements"
                  value={jobInfo.requirements}
                  onChange={(e) => setJobInfo({ ...jobInfo, requirements: e.target.value })}
                  placeholder="请输入任职要求，如：计算机相关专业本科及以上学历，3年以上AI算法开发经验..."
                  rows={6}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => navigate('/company/positions')}>
                  取消
                </Button>
                <Button onClick={handleGenerate} disabled={generating} className="bg-success hover:bg-success/90">
                  {generating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      AI生成中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      AI智能生成
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 步骤2：AI生成结果 */}
      {step === 2 && (
        <div className="space-y-6">
          {/* 胜任力模型卡片 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>步骤2：AI生成的胜任力模型</CardTitle>
                  <CardDescription>
                    基于标准信息，AI已自动生成4维度胜任力模型和测评问题
                  </CardDescription>
                </div>
                <Badge className="bg-success">
                  <Sparkles className="mr-1 h-3 w-3" />
                  AI生成
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 lg:grid-cols-2">
                {/* 左侧：维度列表 */}
                <div className="space-y-4">
                  {model.dimensions.map((dimension, index) => (
                    <Card key={index} className="border-l-4 border-l-primary">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{dimension.name}</CardTitle>
                          <Badge variant="outline">{dimension.weight}%</Badge>
                        </div>
                        {dimension.description && (
                          <CardDescription className="mt-2 flex items-start space-x-2">
                            <HelpCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                            <span className="text-sm">{dimension.description}</span>
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {dimension.items.map((item, idx) => (
                            <Badge key={idx} variant="secondary">
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* 右侧：雷达图 */}
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>权重分布可视化</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ReactECharts option={radarOption} style={{ height: '400px' }} />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 测评问题卡片 */}
          {model.interviewQuestions && model.interviewQuestions.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>AI生成的测评问题</CardTitle>
                    <CardDescription>
                      基于胜任力模型，AI为你生成了{model.interviewQuestions.length}道针对性测评问题
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">
                    {model.interviewQuestions.length}道题目
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {model.interviewQuestions.map((q, index) => (
                    <Card key={index} className="border-l-4 border-l-success">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">
                                {q.category}
                              </Badge>
                              <span className="text-sm text-muted-foreground">问题 {index + 1}</span>
                            </div>
                            <CardTitle className="mt-2 text-base">{q.question}</CardTitle>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-start space-x-2 rounded-lg bg-muted p-3">
                          <HelpCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                          <div className="text-sm">
                            <strong className="text-primary">为什么问这个问题：</strong>
                            <span className="ml-1 text-muted-foreground">{q.purpose}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 操作按钮 */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setStep(1)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              上一步
            </Button>
            <Button onClick={() => setStep(3)}>
              下一步：调整权重
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* 步骤3：调整权重 */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>步骤3：调整权重</CardTitle>
            <CardDescription>
              可以手动微调各维度权重，确保模型符合实际需求
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {model.dimensions.map((dimension, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>{dimension.name}</Label>
                  <span className="text-sm font-semibold text-primary">{dimension.weight}%</span>
                </div>
                <Slider
                  value={[dimension.weight]}
                  onValueChange={(value) => handleWeightChange(index, value)}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>
            ))}

            <div className="rounded-lg bg-muted p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">总权重</span>
                <span className={`text-lg font-bold ${
                  model.dimensions.reduce((sum, d) => sum + d.weight, 0) === 100
                    ? 'text-success'
                    : 'text-destructive'
                }`}>
                  {model.dimensions.reduce((sum, d) => sum + d.weight, 0)}%
                </span>
              </div>
              {model.dimensions.reduce((sum, d) => sum + d.weight, 0) !== 100 && (
                <p className="mt-2 text-xs text-destructive">
                  提示：总权重需要等于100%
                </p>
              )}
            </div>

            {/* 权重分布饼图 */}
            <div className="rounded-lg border bg-card p-4">
              <h3 className="mb-4 text-sm font-medium">权重分布可视化</h3>
              <ReactECharts
                option={{
                  tooltip: {
                    trigger: 'item',
                    formatter: '{b}: {c}% ({d}%)'
                  },
                  legend: {
                    orient: 'vertical',
                    right: 10,
                    top: 'center',
                    textStyle: {
                      fontSize: 12
                    }
                  },
                  series: [
                    {
                      name: '权重分布',
                      type: 'pie',
                      radius: ['40%', '70%'],
                      center: ['40%', '50%'],
                      avoidLabelOverlap: false,
                      itemStyle: {
                        borderRadius: 10,
                        borderColor: '#fff',
                        borderWidth: 2
                      },
                      label: {
                        show: true,
                        formatter: '{b}\n{c}%',
                        fontSize: 12
                      },
                      emphasis: {
                        label: {
                          show: true,
                          fontSize: 14,
                          fontWeight: 'bold'
                        }
                      },
                      data: model.dimensions.map((d, idx) => ({
                        value: d.weight,
                        name: d.name,
                        itemStyle: {
                          color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][idx]
                        }
                      }))
                    }
                  ]
                }}
                style={{ height: '300px' }}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                上一步
              </Button>
              <Button
                onClick={handleSave}
                disabled={model.dimensions.reduce((sum, d) => sum + d.weight, 0) !== 100 || saving}
                className="bg-success hover:bg-success/90"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    保存中...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    保存模型
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
        </>
      )}
    </div>
  );
}
