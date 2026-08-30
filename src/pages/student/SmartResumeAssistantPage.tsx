import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ImageUploader } from '@/components/ImageUploader';
import { Badge } from '@/components/ui/badge';
import { Target, FileText, CheckCircle2, AlertCircle, ArrowRight, Loader2, Cpu, GraduationCap, PlayCircle, Star, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import mammoth from 'mammoth';

export default function SmartResumeAssistantPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [jdText, setJdText] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [resumeImageUrl, setResumeImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const jdData = localStorage.getItem('target_jd_analysis');
    if (jdData) {
      const parsed = JSON.parse(jdData);
      if (parsed.company && parsed.jobTitle) {
        setJdText(`目标企业：${parsed.company}\n目标岗位：${parsed.jobTitle}\n核心要求：${parsed.requirements?.join(', ')}`);
      }
    }
  }, []);

  const handleWordUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const name = file.name.toLowerCase();
    if (!name.endsWith('.docx')) {
      toast.error('请上传 .docx 格式的 Word 简历（旧版 .doc 暂不支持）');
      e.target.value = '';
      return;
    }
    setParsing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      const text = result.value?.trim();
      if (!text) {
        toast.error('未能从文档中提取到文本，请确认文件内容');
      } else {
        setResumeText(text);
        toast.success('Word 简历解析成功，已填入下方文本框');
      }
    } catch (err: any) {
      console.error('Word 简历解析失败:', err);
      toast.error('Word 简历解析失败，请重试或直接粘贴文本');
    } finally {
      setParsing(false);
      e.target.value = '';
    }
  };

  const handleDiagnose = async () => {
    if (!jdText.trim() || !resumeText.trim()) {
      toast.error('请填写完整的目标JD和现有简历内容');
      return;
    }

    setLoading(true);
    toast.loading('正在联动画像进行多维诊断并重写简历...', { id: 'resume' });

    try {
      let portrait = {};
      if (user?.id) {
         const { data } = await supabase.from('user_portrait').select('*').eq('user_id', user.id).maybeSingle();
         if (data) portrait = data;
      }

      const { data, error } = await supabase.functions.invoke('ai-resume-optimizer', {
        body: {
          action: 'optimize',
          resumeText,
          targetJd: jdText,
          portrait
        }
      });
      
      if (error) throw error;
      setResult(data);
      toast.success('诊断与优化完成！', { id: 'resume' });
    } catch (err: any) {
      toast.error('诊断失败，请重试: ' + err.message, { id: 'resume' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">智能简历诊断与优化助手</h1>
        <p className="text-muted-foreground mt-2">融合您的新文科素养画像，运用 STAR 法则靶向重写简历，从根本上解决“有经历但写不好”的痛点。</p>
      </div>

      {!result ? (
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5 text-primary"/> 1. 目标岗位要求 (JD)</CardTitle>
              <CardDescription>粘贴您想投递的真实岗位描述</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea 
                className="min-h-[300px] resize-none" 
                value={jdText} 
                onChange={e => setJdText(e.target.value)}
                placeholder="请粘贴完整的职位描述、关键要求和加分项..." 
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary"/> 2. 原始个人简历</CardTitle>
              <CardDescription>粘贴您当前的简历或个人经历草稿</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <label className="cursor-pointer">
                  <input type="file" accept=".docx" className="hidden" onChange={handleWordUpload} />
                  <Button variant="outline" size="sm" asChild disabled={parsing}>
                    <span>
                      {parsing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                      上传 Word 简历
                    </span>
                  </Button>
                </label>
                <span className="text-xs text-muted-foreground">支持 .docx 格式，解析后自动填入下方文本框</span>
              </div>
              <Textarea 
                className="min-h-[300px] resize-none" 
                value={resumeText} 
                onChange={e => setResumeText(e.target.value)}
                placeholder="请粘贴您现有的工作经历、项目经历、自我评价..." 
              />
              <div className="flex items-start gap-4 p-3 rounded-lg bg-muted/50">
                <ImageUploader
                  currentUrl={resumeImageUrl}
                  onUploaded={setResumeImageUrl}
                  folder="resumes"
                  label="上传简历图片"
                />
                <div className="text-xs text-muted-foreground pt-1">
                  <p>支持上传简历截图/证件照（可选）</p>
                  <p>超过 1MB 将自动压缩为 WEBP 格式</p>
                </div>
              </div>
              <Button onClick={handleDiagnose} disabled={loading} className="w-full" size="lg">
                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Star className="mr-2 h-5 w-5" />}
                开始深度诊断与重写
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => setResult(null)}>
              返回重新录入
            </Button>
            <Button onClick={() => {}} className="bg-primary text-white">
              导出求职材料套件 (PDF)
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="md:col-span-1 border-primary/20 shadow-md">
              <CardHeader className="bg-primary/5 pb-4">
                <CardTitle className="text-lg">画像与岗位匹配度</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center mb-6">
                  <div className="text-5xl font-bold text-primary mb-2">{result.match_score}</div>
                  <div className="text-sm text-muted-foreground">综合匹配度得分</div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-bold flex items-center gap-1 mb-2"><CheckCircle2 className="h-4 w-4 text-green-500"/> 符合项 (优势)</h4>
                    <ul className="space-y-2">
                      {result.match_analysis?.matched_items?.map((item: string, i: number) => (
                        <li key={i} className="text-sm text-green-700 bg-green-50 px-2 py-1 rounded">{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold flex items-center gap-1 mb-2"><AlertCircle className="h-4 w-4 text-orange-500"/> 待优化 (短板)</h4>
                    <ul className="space-y-2">
                      {result.match_analysis?.to_be_optimized?.map((item: string, i: number) => (
                        <li key={i} className="text-sm text-orange-700 bg-orange-50 px-2 py-1 rounded">{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Cpu className="h-5 w-5 text-blue-500"/> ATS 关键词匹配诊断</CardTitle>
                <CardDescription>缺少这些关键词，你的简历可能连HR的面都见不到</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="text-sm font-medium mb-2 text-muted-foreground">已命中的关键词：</div>
                    <div className="flex flex-wrap gap-2">
                      {result.keyword_analysis?.matched?.map((k: string, i: number) => (
                        <Badge key={i} variant="outline" className="border-green-500 text-green-600 bg-green-50">{k}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-2 text-muted-foreground">严重缺失的关键词：</div>
                    <div className="flex flex-wrap gap-2">
                      {result.keyword_analysis?.missing?.map((k: string, i: number) => (
                        <Badge key={i} variant="destructive">{k}</Badge>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">* 系统已在下方的优化版简历中，帮您通过合理化项目描述自然融入了这些词汇。</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-green-500/30">
            <CardHeader className="bg-green-500/5">
              <CardTitle className="text-lg text-green-700">优化后专属简历 (采用 STAR 法则重写)</CardTitle>
              <CardDescription>我们重构了您的职责描述，把“平铺直叙”变成了“用数据说话”的结果导向型表达。</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="prose max-w-none text-sm whitespace-pre-wrap">
                {result.optimized_resume}
              </div>
            </CardContent>
          </Card>

          {result.recommended_courses && result.recommended_courses.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <GraduationCap className="h-6 w-6 text-primary" />
                基于短板的闭环提升路径
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {result.recommended_courses.map((course: any, i: number) => (
                  <Card key={i} className="hover:border-primary/50 transition-colors cursor-pointer group">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-base group-hover:text-primary transition-colors">{course.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">推荐理由：{course.reason}</p>
                      </div>
                      <PlayCircle className="h-8 w-8 text-primary/20 group-hover:text-primary transition-colors" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}