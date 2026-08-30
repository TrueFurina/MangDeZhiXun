import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, Zap, Target, Sparkles, Users, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

const roles = [
  { id: 'model-engineer', name: '模型工程师', icon: Brain, description: '负责底层代码、模型优化、算法实现' },
  { id: 'ai-developer', name: 'AI应用开发者', icon: Zap, description: '负责模型调用、Agent逻辑编排与搭建' },
  { id: 'product-manager', name: '产品经理', icon: Target, description: '负责问题定义、需求拆解与分析' },
  { id: 'designer', name: '设计师', icon: Sparkles, description: '负责界面、交互体验、视觉设计' },
  { id: 'vibe-coder', name: 'Vibe Coder', icon: Zap, description: '擅长用AI/Prompt/低代码快速做出原型' },
  { id: 'industry-expert', name: '行业专家', icon: Users, description: '提供真实需求、应用场景与问题定义' },
  { id: 'content-creator', name: '内容创作者', icon: TrendingUp, description: '擅长产品表达、Demo展示、故事讲述' },
  { id: 'ai-learner', name: 'AI初学者', icon: Brain, description: '正在学习AI，希望通过实战快速成长' },
];

const skills = [
  // 技术能力
  { name: 'Python编程', category: '技术能力' },
  { name: '深度学习', category: '技术能力' },
  { name: '机器学习', category: '技术能力' },
  { name: 'API调用', category: '技术能力' },
  { name: '数据分析', category: '技术能力' },
  { name: '算法优化', category: '技术能力' },
  // 产品能力
  { name: '需求分析', category: '产品能力' },
  { name: '产品设计', category: '产品能力' },
  { name: '用户研究', category: '产品能力' },
  // 设计能力
  { name: '界面设计', category: '设计能力' },
  { name: '交互设计', category: '设计能力' },
  { name: '视觉设计', category: '设计能力' },
  // 软技能
  { name: '沟通能力', category: '软技能' },
  { name: '学习能力', category: '软技能' },
  { name: '团队协作', category: '软技能' },
  { name: '问题解决', category: '软技能' },
  { name: '创新思维', category: '软技能' },
  { name: '项目管理', category: '软技能' },
];

export default function AssessmentPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState('');
  const [skillRatings, setSkillRatings] = useState<Record<string, number>>({});

  const progress = (step / 3) * 100;

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
  };

  const handleSkillRate = (skillName: string, rating: number) => {
    setSkillRatings(prev => ({ ...prev, [skillName]: rating }));
  };

  const handleNext = () => {
    if (step === 1 && !selectedRole) {
      toast.error('请选择一个角色定位');
      return;
    }
    if (step === 2 && Object.keys(skillRatings).length < 8) {
      toast.error('请至少评估8项技能');
      return;
    }
    if (step < 3) {
      setStep(step + 1);
    } else {
      // 完成评估，生成报告ID并跳转到报告页
      toast.success('评估完成！正在生成测评报告...');
      // 模拟生成报告ID（实际应该从后端返回）
      const reportId = `report_${Date.now()}`;
      setTimeout(() => {
        navigate(`/student/report/${reportId}`);
      }, 1500);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-background to-muted/30 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* 进度条 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">评估进度</span>
            <span className="text-sm text-muted-foreground">步骤 {step}/3</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* 步骤1：选择角色 */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Badge className="mb-4">步骤 1/3</Badge>
              <h1 className="text-3xl font-bold mb-2">选择你的角色定位</h1>
              <p className="text-muted-foreground">选择最符合你核心能力定位的AI角色</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {roles.map((role) => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.id;
                return (
                  <Card
                    key={role.id}
                    className={`cursor-pointer transition-all ${
                      isSelected ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'
                    }`}
                    onClick={() => handleRoleSelect(role.id)}
                  >
                    <CardHeader>
                      <div className={`mb-2 flex h-10 w-10 items-center justify-center rounded-lg ${
                        isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      }`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-base">{role.name}</CardTitle>
                      <CardDescription className="text-xs">{role.description}</CardDescription>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* 步骤2：技能评估 */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Badge className="mb-4">步骤 2/3</Badge>
              <h1 className="text-3xl font-bold mb-2">评估你的技能水平</h1>
              <p className="text-muted-foreground">为每项技能打分（0-100分），至少评估8项技能</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {skills.map((skill) => (
                <Card key={skill.name} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{skill.name}</CardTitle>
                        <CardDescription>{skill.category}</CardDescription>
                      </div>
                      <Badge variant="outline">{skillRatings[skill.name] || 0}分</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={skillRatings[skill.name] || 0}
                      onChange={(e) => handleSkillRate(skill.name, Number(e.target.value))}
                      className="w-full accent-primary"
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* 步骤3：确认信息 */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Badge className="mb-4">步骤 3/3</Badge>
              <h1 className="text-3xl font-bold mb-2">确认评估信息</h1>
              <p className="text-muted-foreground">请确认你的评估信息</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>角色定位</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-medium">
                  {roles.find(r => r.id === selectedRole)?.name}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>技能评估</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(skillRatings).map(([skill, rating]) => (
                    <div key={skill} className="flex items-center justify-between">
                      <span>{skill}</span>
                      <Badge>{rating}分</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex items-center justify-between mt-8">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 1}
          >
            上一步
          </Button>
          <Button
            onClick={handleNext}
            className="gradient-primary"
          >
            {step === 3 ? '完成评估' : '下一步'}
          </Button>
        </div>
      </div>
    </div>
  );
}
