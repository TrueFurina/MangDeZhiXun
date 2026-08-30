import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Loader2, Download, Share2, BookOpen } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function DeepResearchReportPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTask();
  }, [id]);

  const fetchTask = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('deep_research_task')
        .select('*')
        .eq('task_id', id)
        .single();

      if (error) throw error;
      setTask(data);
      
      if (data.status !== 2) {
        toast.info('报告尚未完成生成');
        navigate(`../progress/${id}`, { replace: true });
      }
    } catch (error: any) {
      console.error('Error fetching task:', error);
      toast.error('获取报告失败');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    window.print(); // 简化实现，实际可调用前端 PDF 导出库或后端服务
    toast.success('请在打印对话框中选择"另存为PDF"');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center py-20">
          <h2 className="text-xl font-bold mb-2">报告不存在</h2>
          <Button onClick={() => navigate('..')}>返回列表</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-5xl print:max-w-none print:py-0 print:px-0">
      <div className="flex justify-between items-center mb-6 print:hidden">
        <Button 
          variant="ghost" 
          onClick={() => navigate('..')} 
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回列表
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast.info('分享功能建设中')}>
            <Share2 className="mr-2 h-4 w-4" />
            分享
          </Button>
          <Button onClick={handleExportPDF}>
            <Download className="mr-2 h-4 w-4" />
            导出 PDF
          </Button>
        </div>
      </div>

      <Card className="print:shadow-none print:border-none">
        <CardHeader className="text-center border-b pb-8 pt-8">
          <div className="mx-auto bg-primary/10 w-16 h-16 flex items-center justify-center rounded-full mb-4 print:hidden">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold mb-4">{task.task_name}</CardTitle>
          <CardDescription className="flex items-center justify-center gap-4 text-sm">
            <span>研究主题：{task.research_topic}</span>
            <span>生成时间：{format(new Date(task.update_time), 'yyyy-MM-dd')}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 md:p-12">
          <div className="prose prose-slate prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-primary hover:prose-a:underline prose-img:rounded-xl prose-img:shadow-sm">
            {task.report_content ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {task.report_content}
              </ReactMarkdown>
            ) : (
              <div className="text-center text-muted-foreground italic py-10">
                报告内容为空，请检查生成日志
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* 补充优化入口 - 暂不实现深度逻辑 */}
      <div className="mt-8 text-center print:hidden">
        <p className="text-muted-foreground mb-4">对报告不满意或需要补充内容？</p>
        <Button variant="outline" onClick={() => toast.info('补充优化功能建设中，请尝试创建新的研究任务')}>
          补充优化建议
        </Button>
      </div>
    </div>
  );
}