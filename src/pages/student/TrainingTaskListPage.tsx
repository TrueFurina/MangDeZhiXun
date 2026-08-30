import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Target, Clock, Users, PlayCircle, CheckCircle2, UserCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getTrainingTasks, getClasses, getClassStudents } from '@/db/training';
import { SCENE_OPTIONS, type TrainingTask, type ClassStudent } from '@/types/training';
import { supabase } from '@/lib/supabase';

// 学生真实身份（从班级名单选择，存完整学号）
function getStudentIdentity(): string {
  return localStorage.getItem('student_no') || '';
}

export default function TrainingTaskListPage() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<TrainingTask[]>([]);
  const [students, setStudents] = useState<ClassStudent[]>([]);
  const [studentNo, setStudentNo] = useState('');

  useEffect(() => {
    const load = async () => {
      // 加载真实班级名单（信息安全1班）
      try {
        const classes = await getClasses('university@miaoda.com');
        const cls = classes.find((c) => c.name === '信息安全1班') || classes[0];
        if (cls) {
          const list = await getClassStudents(cls.id);
          setStudents(list);
        }
      } catch (e) {
        console.error('班级名单加载失败', e);
      }
      // 学生端展示所有已发布任务（传空email即查询全部）
      const tl = await getTrainingTasks('');
      setTasks(tl);
    };
    load();
    setStudentNo(getStudentIdentity());
  }, []);

  // 查询当前学生已完成的提交
  const [doneSet, setDoneSet] = useState<Set<string>>(new Set());
  useEffect(() => {
    const loadDone = async () => {
      if (!studentNo) return;
      const { data } = await supabase
        .from('training_submissions')
        .select('task_id, status')
        .eq('student_no', studentNo);
      const set = new Set<string>();
      (data as { task_id: string; status: string }[] || []).forEach((r) => {
        if (r.status === 'completed') set.add(r.task_id);
      });
      setDoneSet(set);
    };
    loadDone();
  }, [studentNo]);

  const handleSelectStudent = (v: string) => {
    setStudentNo(v);
    localStorage.setItem('student_no', v);
    toast.success('身份已切换');
  };

  return (
    <div className="container py-8 max-w-4xl">
      <div className="flex items-start justify-between gap-4 mb-8">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight">实训任务</h1>
          <p className="text-muted-foreground mt-2 text-pretty">完成教师下发的软素养对话式对抗实训任务，系统将完整留存你的对话交互证据链。</p>
        </div>
        <Select value={studentNo} onValueChange={handleSelectStudent}>
          <SelectTrigger className="w-44 shrink-0"><SelectValue placeholder="选择学号" /></SelectTrigger>
          <SelectContent>
            {students.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">名单加载中，请稍候…</div>
            ) : (
              students.map((s) => (
                <SelectItem key={s.student_no} value={s.student_no}>{s.student_no} · {s.display_name}</SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      {!studentNo && (
        <Card className="mb-6 border-primary/30 bg-primary/5">
          <CardContent className="flex items-center gap-3 py-4">
            <UserCircle className="h-5 w-5 text-primary shrink-0" />
            <p className="text-sm">请先在右上角选择你的学号，完成实训后成绩将计入你的档案。</p>
          </CardContent>
        </Card>
      )}

      {tasks.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>暂无实训任务</p>
            <p className="text-sm mt-1">等待教师下发任务后即可参加</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tasks.map((t) => {
            const scene = SCENE_OPTIONS.find((s) => s.value === t.scene_type);
            return (
              <Card key={t.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-base truncate">{t.title}</h3>
                        <Badge variant="outline" className="shrink-0">{scene?.label || t.scene_type}</Badge>
                        {doneSet.has(t.id) && <Badge className="shrink-0 bg-success text-white"><CheckCircle2 className="h-3 w-3 mr-1" />已完成</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{t.description}</p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Target className="h-3 w-3" />难度：{t.difficulty}</span>
                        {t.deadline && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />截止：{new Date(t.deadline).toLocaleString('zh-CN')}</span>}
                      </div>
                    </div>
                    <Button onClick={() => navigate(`/student/training/${t.id}`)} className="shrink-0">
                      <PlayCircle className="h-4 w-4 mr-1" /> 进入实训
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}