import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, X } from 'lucide-react';
import { toast } from 'sonner';

export default function PositionEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 表单数据
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    location: '',
    salaryMin: '',
    salaryMax: '',
    experience: '',
    education: '',
    type: '',
    description: '',
    requirements: '',
    benefits: '',
    status: 'active'
  });

  // 技能标签
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    // 模拟加载标准数据
    setTimeout(() => {
      setFormData({
        title: 'AI模型工程师',
        department: '技术部',
        location: '北京',
        salaryMin: '25',
        salaryMax: '45',
        experience: '3-5年',
        education: '本科',
        type: '全职',
        description: '负责AI模型训练与优化，精通PyTorch/TensorFlow框架',
        requirements: '1. 精通Python编程\n2. 熟悉深度学习框架\n3. 有大模型训练经验',
        benefits: '五险一金、弹性工作、年度旅游、股票期权',
        status: 'active'
      });
      setSkills(['Python', 'PyTorch', '深度学习', 'TensorFlow']);
      setLoading(false);
    }, 500);
  }, [id]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const handleSave = async () => {
    // 验证必填字段
    if (!formData.title || !formData.department || !formData.location) {
      toast.error('请填写所有必填字段');
      return;
    }

    setSaving(true);
    
    // 模拟保存
    setTimeout(() => {
      toast.success('标准信息已更新');
      setSaving(false);
      navigate('/company/positions');
    }, 1000);
  };

  const handleCancel = () => {
    if (window.confirm('确定要放弃修改吗？')) {
      navigate('/company/positions');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回
          </Button>
          <div>
            <h1 className="text-3xl font-bold">编辑标准</h1>
            <p className="mt-1 text-muted-foreground">修改标准信息</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleCancel}>
            <X className="mr-2 h-4 w-4" />
            取消
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? '保存中...' : '保存'}
          </Button>
        </div>
      </div>

      {/* 基本信息 */}
      <Card>
        <CardHeader>
          <CardTitle>基本信息</CardTitle>
          <CardDescription>填写标准的基本信息</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">标准名称 *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="请输入标准名称"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">所属部门 *</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                placeholder="请输入所属部门"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">工作地点 *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="请输入工作地点"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">标准类型</Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="选择标准类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="全职">全职</SelectItem>
                  <SelectItem value="兼职">兼职</SelectItem>
                  <SelectItem value="实习">实习</SelectItem>
                  <SelectItem value="外包">外包</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>薪资范围（k/月）</Label>
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  value={formData.salaryMin}
                  onChange={(e) => handleInputChange('salaryMin', e.target.value)}
                  placeholder="最低"
                />
                <span>-</span>
                <Input
                  type="number"
                  value={formData.salaryMax}
                  onChange={(e) => handleInputChange('salaryMax', e.target.value)}
                  placeholder="最高"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience">工作经验</Label>
              <Select value={formData.experience} onValueChange={(value) => handleInputChange('experience', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="选择工作经验要求" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="不限">不限</SelectItem>
                  <SelectItem value="应届生">应届生</SelectItem>
                  <SelectItem value="1-3年">1-3年</SelectItem>
                  <SelectItem value="3-5年">3-5年</SelectItem>
                  <SelectItem value="5-10年">5-10年</SelectItem>
                  <SelectItem value="10年以上">10年以上</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="education">学历要求</Label>
              <Select value={formData.education} onValueChange={(value) => handleInputChange('education', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="选择学历要求" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="不限">不限</SelectItem>
                  <SelectItem value="专科">专科</SelectItem>
                  <SelectItem value="本科">本科</SelectItem>
                  <SelectItem value="硕士">硕士</SelectItem>
                  <SelectItem value="博士">博士</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">标准状态</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="选择标准状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">标准推介中</SelectItem>
                  <SelectItem value="paused">已暂停</SelectItem>
                  <SelectItem value="closed">已关闭</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 技能要求 */}
      <Card>
        <CardHeader>
          <CardTitle>技能要求</CardTitle>
          <CardDescription>添加标准所需的技能标签</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
              placeholder="输入技能标签，按回车添加"
            />
            <Button onClick={handleAddSkill}>添加</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <Badge key={index} variant="secondary" className="text-sm px-3 py-1">
                {skill}
                <button
                  onClick={() => handleRemoveSkill(skill)}
                  className="ml-2 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 详细描述 */}
      <Card>
        <CardHeader>
          <CardTitle>详细描述</CardTitle>
          <CardDescription>填写标准的详细信息</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">标准描述</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="请输入标准描述"
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="requirements">任职要求</Label>
            <Textarea
              id="requirements"
              value={formData.requirements}
              onChange={(e) => handleInputChange('requirements', e.target.value)}
              placeholder="请输入任职要求，每行一条"
              rows={6}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="benefits">福利待遇</Label>
            <Textarea
              id="benefits"
              value={formData.benefits}
              onChange={(e) => handleInputChange('benefits', e.target.value)}
              placeholder="请输入福利待遇"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
