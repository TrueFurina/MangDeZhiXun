import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, Play, Pause, CheckCircle2, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { supabase, getCurrentUserEmail } from '@/lib/supabase';

export default function CoursePlayerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  
  // 模拟播放器状态
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0-100
  const [watchTime, setWatchTime] = useState(0); // 秒
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveTimeRef = useRef<number>(0);

  useEffect(() => {
    loadCourseData();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [id]);

  const loadCourseData = async () => {
    setLoading(true);
    try {
      const email = await getCurrentUserEmail();
      setUserEmail(email || '');
      
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();
        
      if (data) {
        setCourse(data);
        // 如果有真实视频就加载，这里使用模拟
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const togglePlay = () => {
    if (!isPlaying) {
      setIsPlaying(true);
      timerRef.current = setInterval(() => {
        setWatchTime(prev => {
          const newTime = prev + 1;
          // 每 5 秒增加 1% 进度（模拟）
          if (newTime % 5 === 0) {
            setProgress(p => {
              const newProgress = Math.min(p + 1, 100);
              // 每 30 秒或进度达到 90% 保存一次
              if (newTime - lastSaveTimeRef.current >= 30 || newProgress === 90) {
                saveProgress(newProgress);
                lastSaveTimeRef.current = newTime;
              }
              return newProgress;
            });
          }
          return newTime;
        });
      }, 1000);
    } else {
      setIsPlaying(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const saveProgress = async (currentProgress: number) => {
    if (!userEmail || !course) return;
    try {
      const { data: userData } = await supabase.from('users').select('id').eq('email', userEmail).single();
      if (!userData) return;

      const status = currentProgress >= 90 ? 2 : 1; // 2: 已完成, 1: 学习中

      // Upsert 到 course_study 表
      const { error: upsertError } = await supabase
        .from('course_study')
        .upsert({
          user_id: userData.id,
          course_id: course.id,
          study_status: status,
          progress_percent: currentProgress,
          study_time: watchTime / 60,
          update_time: new Date().toISOString(),
          complete_time: status === 2 ? new Date().toISOString() : null
        }, { onConflict: 'user_id,course_id' });

      // 为了兼容旧版 progress，同时也更新 user_courses 表
      if (status === 2) {
        await supabase
          .from('user_courses')
          .upsert({
            user_email: userEmail,
            course_id: course.id,
            progress: 100,
            is_completed: true,
            completed_at: new Date().toISOString()
          }, { onConflict: 'user_email,course_id' });
          
        toast.success('恭喜！课程学习完成！');
      }
    } catch (err) {
      console.error('保存进度失败', err);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">加载中...</div>;
  }

  if (!course) {
    return <div className="p-8 text-center">课程不存在</div>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-6 space-y-4 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <Button variant="ghost" className="w-fit" onClick={() => navigate(-1)}>
          <ChevronLeft className="mr-2 h-4 w-4" /> 返回成长中心
        </Button>
        <h1 className="text-xl font-bold truncate">{course.title}</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        <div className="lg:col-span-2 flex flex-col space-y-4">
          {/* 模拟视频播放器 */}
          <Card className="flex-1 overflow-hidden relative group bg-black flex items-center justify-center min-h-[400px]">
            <CardContent className="p-0">
              <div className="text-center text-white space-y-6">
                <div className="text-6xl mb-4 opacity-50 mx-auto w-24 h-24 rounded-full border-4 flex items-center justify-center border-white/50">
                  {isPlaying ? <Pause className="w-10 h-10" /> : <Play className="w-10 h-10 ml-2" />}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{course.title}</h2>
                  <p className="text-white/60 mt-2">内部视频播放器 (防作弊机制已开启)</p>
                </div>
              </div>
              
              {/* 控制栏 */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex items-center gap-4">
                  <Button size="icon" variant="ghost" className="text-white hover:bg-white/20" onClick={togglePlay}>
                    {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                  </Button>
                  <div className="flex-1 relative group/progress">
                    <Progress value={progress} className="h-2 cursor-not-allowed" />
                    {/* 遮罩，防止拖拽 */}
                    <div className="absolute inset-0 z-10 cursor-not-allowed" title="禁止拖拽快进" onClick={() => toast.warning("防作弊机制：已禁用快进功能")} />
                  </div>
                  <span className="text-white text-sm font-mono">{progress}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex flex-col space-y-4">
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>学习进度</CardTitle>
              <CardDescription>当前课程的实时学习追踪</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>完成度</span>
                  <span className="font-bold">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1 text-right">达到 90% 即视为完成</p>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="h-8 w-8 text-primary" />
                  <div>
                    <div className="text-sm text-muted-foreground">已学时长</div>
                    <div className="text-2xl font-bold">{Math.floor(watchTime / 60)}:{String(watchTime % 60).padStart(2, '0')}</div>
                  </div>
                </div>
              </div>

              {progress >= 90 && (
                <div className="flex items-center gap-2 p-3 bg-green-500/10 text-green-600 rounded-lg">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-sm font-medium">课程已达标，记录已同步</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
