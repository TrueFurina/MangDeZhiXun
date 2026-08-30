import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import { createPosition, checkPositionExists } from '@/db/api';

export default function CreatePositionPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    positionName: '',
    recruitCount: '',
    location: '',
    responsibilities: '',
    requirements: '',
    salaryMin: '',
    salaryMax: '',
    benefits: '',
    workTime: '',
    contactPhone: '',
    contactEmail: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 验证必填字段
    if (!formData.positionName || !formData.recruitCount || !formData.location) {
      toast.error('请填写所有必填字段');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // 检查标准名称是否已存在
      const exists = await checkPositionExists(formData.positionName);
      if (exists) {
        const confirmed = window.confirm(
          `标准"${formData.positionName}"已存在。\n\n` +
          `如果选择继续新建，将会覆盖之前的原有标准信息并新建。\n\n` +
          `是否继续？`
        );
        
        if (!confirmed) {
          setIsSubmitting(false);
          return;
        }
        
        // 用户确认覆盖，继续创建（数据库会自动覆盖同名标准）
        toast.info('将覆盖原有标准信息');
      }

      // 构建薪资范围字符串
      const salaryRange = formData.salaryMin && formData.salaryMax 
        ? `${formData.salaryMin}-${formData.salaryMax}K`
        : '面议';

      // 解析技能要求（从requirements中提取）
      const skills = formData.requirements
        .split('\n')
        .filter(line => line.trim())
        .slice(0, 5); // 最多取5个技能

      // 创建标准
      await createPosition({
        position_name: formData.positionName,
        position_type: 1, // 默认类型
        salary_range: salaryRange,
        required_skills: skills,
        position_desc: `
标准名称：${formData.positionName}
标准推介人数：${formData.recruitCount}人
工作地点：${formData.location}

标准职责：
${formData.responsibilities}

任职要求：
${formData.requirements}

薪资福利：
薪资范围：${salaryRange}
${formData.benefits}

工作时间：${formData.workTime || '标准工作时间'}

联系方式：
电话：${formData.contactPhone}
邮箱：${formData.contactEmail}
        `.trim(),
        status: 'open',
      });
      
      toast.success('标准发布成功！');
      
      // 跳转到标准管理页面
      navigate('/company/positions');
    } catch (error) {
      console.error('发布标准失败:', error);
      toast.error('发布失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">发布新标准</h1>
          <p className="mt-1 text-muted-foreground">填写标准信息，吸引优秀人才</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/company/positions')}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          返回
        </Button>
      </div>

      {/* 表单 */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>标准基本信息</CardTitle>
            <CardDescription>请填写标准的基本信息和要求</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 标准名称 */}
            <div className="grid gap-2">
              <Label htmlFor="positionName">
                标准名称 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="positionName"
                placeholder="例如：AI算法工程师"
                value={formData.positionName}
                onChange={(e) => handleInputChange('positionName', e.target.value)}
                required
              />
            </div>

            {/* 标准推介人数和工作地点 */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="recruitCount">
                  标准推介人数 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="recruitCount"
                  type="number"
                  min="1"
                  placeholder="例如：5"
                  value={formData.recruitCount}
                  onChange={(e) => handleInputChange('recruitCount', e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">
                  工作地点 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="location"
                  placeholder="例如：北京·朝阳区"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* 薪资范围 */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="salaryMin">最低薪资（K/月）</Label>
                <Input
                  id="salaryMin"
                  type="number"
                  min="0"
                  placeholder="例如：20"
                  value={formData.salaryMin}
                  onChange={(e) => handleInputChange('salaryMin', e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="salaryMax">最高薪资（K/月）</Label>
                <Input
                  id="salaryMax"
                  type="number"
                  min="0"
                  placeholder="例如：40"
                  value={formData.salaryMax}
                  onChange={(e) => handleInputChange('salaryMax', e.target.value)}
                />
              </div>
            </div>

            {/* 标准职责 */}
            <div className="grid gap-2">
              <Label htmlFor="responsibilities">标准职责（需要做什么）</Label>
              <Textarea
                id="responsibilities"
                placeholder="请描述该标准的主要工作内容和职责，每行一条"
                rows={6}
                value={formData.responsibilities}
                onChange={(e) => handleInputChange('responsibilities', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                建议格式：每行一条职责，例如：
                <br />
                - 负责AI算法研发和优化
                <br />
                - 参与模型训练和部署
              </p>
            </div>

            {/* 任职要求 */}
            <div className="grid gap-2">
              <Label htmlFor="requirements">任职要求（需要什么人）</Label>
              <Textarea
                id="requirements"
                placeholder="请描述对学员的要求，每行一条"
                rows={6}
                value={formData.requirements}
                onChange={(e) => handleInputChange('requirements', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                建议格式：每行一条要求，例如：
                <br />
                - 计算机相关专业本科及以上学历
                <br />
                - 熟练掌握Python和深度学习框架
              </p>
            </div>

            {/* 福利待遇 */}
            <div className="grid gap-2">
              <Label htmlFor="benefits">福利待遇</Label>
              <Textarea
                id="benefits"
                placeholder="请描述公司提供的福利待遇，每行一条"
                rows={4}
                value={formData.benefits}
                onChange={(e) => handleInputChange('benefits', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                例如：五险一金、年度体检、弹性工作制、股票期权等
              </p>
            </div>

            {/* 工作时间 */}
            <div className="grid gap-2">
              <Label htmlFor="workTime">工作时间</Label>
              <Input
                id="workTime"
                placeholder="例如：弹性工作制，9:30-18:30"
                value={formData.workTime}
                onChange={(e) => handleInputChange('workTime', e.target.value)}
              />
            </div>

            {/* 联系方式 */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="contactPhone">联系电话</Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  placeholder="例如：010-12345678"
                  value={formData.contactPhone}
                  onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contactEmail">投递邮箱</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="例如：hr@company.com"
                  value={formData.contactEmail}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                />
              </div>
            </div>

            {/* 提交按钮 */}
            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/company/positions')}
              >
                取消
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                <Save className="mr-2 h-4 w-4" />
                {isSubmitting ? '发布中...' : '发布标准'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
