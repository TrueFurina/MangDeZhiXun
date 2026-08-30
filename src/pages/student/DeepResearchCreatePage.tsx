import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

export default function DeepResearchCreatePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    research_topic: '',
    report_type: '行业研究报告',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.research_topic.trim()) {
      toast.error('请输入研究主题');
      return;
    }

    try {
      setLoading(true);
      
      const task_name = `${formData.research_topic} - ${formData.report_type}`;
      
      // 1. 在数据库创建任务记录
      const { data: taskData, error: taskError } = await supabase
        .from('deep_research_task')
        .insert({
          user_id: user?.id,
          task_name,
          research_topic: formData.research_topic,
          report_type: formData.report_type,
          status: 1, // 生成中
          current_stage: '初始化任务',
        })
        .select()
        .single();

      if (taskError) throw taskError;

      // 2. 异步触发 Edge Function 开始研究 (不等待其完成)
      // 使用 fetch 以触发流式请求
      fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-deep-research`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          action: 'run',
          task_id: taskData.task_id,
          query: `【研究主题】${formData.research_topic}\n【报告类型】${formData.report_type}\n请基于以上要求生成结构化的大纲，并在确认后生成详细报告。`,
        }),
      }).catch(err => {
        console.error("Trigger background research failed:", err);
      });

      toast.success('研究任务创建成功');
      
      // 3. 跳转到进度页面
      navigate(`../progress/${taskData.task_id}`);

    } catch (error: any) {
      console.error('Error creating task:', error);
      toast.error('创建研究任务失败: ' + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <Button 
        variant="ghost" 
        onClick={() => navigate('..')} 
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        返回列表
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            创建深度研究任务
          </CardTitle>
          <CardDescription>
            输入研究主题与要求，AI 将自动拆解任务，进行多轮深度检索并生成结构化报告。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="topic">研究主题 (Query) <span className="text-destructive">*</span></Label>
              <Input
                id="topic"
                placeholder="例如：2025年人工智能行业人才需求分析"
                value={formData.research_topic}
                onChange={(e) => setFormData(prev => ({ ...prev, research_topic: e.target.value }))}
                className="h-12"
              />
              <p className="text-xs text-muted-foreground mt-1">
                主题越明确，包含的具体方向和范围越清晰，生成的报告质量越高。
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">报告类型 <span className="text-destructive">*</span></Label>
              <Select 
                value={formData.report_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, report_type: value }))}
              >
                <SelectTrigger id="type" className="h-12">
                  <SelectValue placeholder="选择报告类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="行业研究报告">行业研究报告</SelectItem>
                  <SelectItem value="竞品分析报告">竞品分析报告</SelectItem>
                  <SelectItem value="人才需求调研报告">人才需求调研报告</SelectItem>
                  <SelectItem value="市场调研报告">市场调研报告</SelectItem>
                  <SelectItem value="就业质量分析报告">就业质量分析报告</SelectItem>
                  <SelectItem value="白皮书">白皮书</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  创建任务并开始研究...
                </>
              ) : (
                '开始生成报告'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="bg-muted/30 border-t p-4 text-sm text-muted-foreground flex flex-col items-start gap-1">
          <p><strong>注意：</strong> 深度研究任务耗时较长（约 10~30 分钟）。</p>
          <p>提交后任务将在后台持续运行，您可以随时离开并在进度页面查看状态。</p>
        </CardFooter>
      </Card>
    </div>
  );
}