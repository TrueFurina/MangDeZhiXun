import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getSystemConfigsAdmin, updateSystemConfigsAdmin } from '@/db/api';

export default function SystemConfigPage() {
  const [configs, setConfigs] = useState<Record<string, string>>({
    evaluation_validity_days: '30',
    ai_interview_concurrent_limit: '10',
    basic_plan_price: '999',
    professional_plan_price: '2999',
    enterprise_plan_price: '9999',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadConfigs = async () => {
      setLoading(true);
      const data = await getSystemConfigsAdmin();
      if (Object.keys(data).length > 0) {
        setConfigs((prev) => ({ ...prev, ...data }));
      }
      setLoading(false);
    };
    loadConfigs();
  }, []);

  const handleSaveConfig = async () => {
    setSaving(true);
    const success = await updateSystemConfigsAdmin(configs);
    if (success) {
      toast.success('系统配置已保存');
    } else {
      toast.error('保存失败');
    }
    setSaving(false);
  };

  const handleConfigChange = (key: string, value: string) => {
    setConfigs((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold">系统配置</h1>
        <p className="mt-1 text-muted-foreground">管理系统参数配置</p>
      </div>

      {/* 参数配置 */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>测评相关配置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="evaluation_validity_days">测评有效期（天）</Label>
              <Input
                id="evaluation_validity_days"
                type="number"
                value={configs.evaluation_validity_days}
                onChange={(e) =>
                  handleConfigChange('evaluation_validity_days', e.target.value)
                }
              />
              <p className="mt-1 text-sm text-muted-foreground">
                测评结果的有效期限，超过此期限需重新测评
              </p>
            </div>
            <div>
              <Label htmlFor="ai_interview_concurrent_limit">AI测评并发数</Label>
              <Input
                id="ai_interview_concurrent_limit"
                type="number"
                value={configs.ai_interview_concurrent_limit}
                onChange={(e) =>
                  handleConfigChange('ai_interview_concurrent_limit', e.target.value)
                }
              />
              <p className="mt-1 text-sm text-muted-foreground">
                同时进行AI测评的最大数量
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>套餐价格配置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="basic_plan_price">基础版套餐价格（元/月）</Label>
              <Input
                id="basic_plan_price"
                type="number"
                value={configs.basic_plan_price}
                onChange={(e) => handleConfigChange('basic_plan_price', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="professional_plan_price">专业版套餐价格（元/月）</Label>
              <Input
                id="professional_plan_price"
                type="number"
                value={configs.professional_plan_price}
                onChange={(e) =>
                  handleConfigChange('professional_plan_price', e.target.value)
                }
              />
            </div>
            <div>
              <Label htmlFor="enterprise_plan_price">企业定制版价格（元/月）</Label>
              <Input
                id="enterprise_plan_price"
                type="number"
                value={configs.enterprise_plan_price}
                onChange={(e) =>
                  handleConfigChange('enterprise_plan_price', e.target.value)
                }
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSaveConfig} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {saving ? '正在保存...' : '保存配置'}
          </Button>
        </div>
      </div>
    </div>
  );
}
