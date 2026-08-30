import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Target, Users, Clock, CheckCircle2, Plus, Send, ListChecks } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import {
  getClasses,
  createClass,
  getClassStudents,
  getTrainingTasks,
  createTrainingTask,
} from '@/db/training';
import { SCENE_OPTIONS, type SceneType, type ClassInfo, type TrainingTask } from '@/types/training';

export default function ClassAssessmentConfigPage() {
  const { user } = useAuth();
  const email = user?.email || localStorage.getItem('university_email') || '';

  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [studentCount, setStudentCount] = useState(0);
  const [tasks, setTasks] = useState<TrainingTask[]>([]);
  const [loading, setLoading] = useState(false);

  // 新建班级
  const [newClassName, setNewClassName] = useState('');
  const [newClassDesc, setNewClassDesc] = useState('');

  // 新建任务
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [sceneType, setSceneType] = useState<SceneType>('project_defense');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [deadline, setDeadline] = useState('');

  const loadClasses = useCallback(async () => {
    if (!email) return;
    const list = await getClasses(email);
    setClasses(list);
    if (list.length > 0 && !selectedClassId) setSelectedClassId(list[0].id);
  }, [email, selectedClassId]);

  useEffect(() => { loadClasses(); }, [loadClasses]);

  useEffect(() => {
    const loadStudents = async () => {
      if (!selectedClassId) { setStudentCount(0); return; }
      const students = await getClassStudents(selectedClassId);
      setStudentCount(students.length);
    };
    loadStudents();
  }, [selectedClassId]);

  useEffect(() => {
    const loadTasks = async () => {
      if (!email) return;
      const list = await getTrainingTasks(email);
      setTasks(list);
    };
    loadTasks();
  }, [email]);

  const handleCreateClass = async () => {
    if (!newClassName.trim()) { toast.error('请输入班级名称'); return; }
    setLoading(true);
    try {
      const cls = await createClass({ name: newClassName.trim(), university_email: email, description: newClassDesc || undefined });
      toast.success('班级创建成功');
      setNewClassName('');
      setNewClassDesc('');
      if (cls) setSelectedClassId(cls.id);
      await loadClasses();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '创建失败';
      toast.error(msg);
    } finally { setLoading(false); }
  };

  const handlePublishTask = async () => {
    if (!taskTitle.trim()) { toast.error('请输入任务标题'); return; }
    if (!selectedClassId) { toast.error('请先选择或创建班级'); return; }
    setLoading(true);
    try {
      await createTrainingTask({
        title: taskTitle.trim(),
        description: taskDesc.trim() || '基于学生软能力画像的个性化对抗实训任务',
        class_id: selectedClassId,
        scene_type: sceneType,
        difficulty,
        deadline: deadline || undefined,
        university_email: email,
      });
      toast.success('实训任务已下发至班级');
      setTaskTitle('');
      setTaskDesc('');
      const list = await getTrainingTasks(email);
      setTasks(list);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '下发失败';
      toast.error(msg);
    } finally { setLoading(false); }
  };

  const selectedClass = classes.find((c) => c.id === selectedClassId);

  return (
    <div className="container py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">班级实训任务设置</h1>
        <p className="text-muted-foreground mt-2">新建班级、导入脱敏学生名单，下发软素养对话式对抗实训任务，用于课程过程性考核。</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* 左列：班级管理 */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> 新建班级</CardTitle>
              <CardDescription>导入脱敏学生名单（仅学号后4位+性别+政治面貌）</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">班级名称</label>
                <Input value={newClassName} onChange={(e) => setNewClassName(e.target.value)} placeholder="如：信息安全1班" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">班级说明（选填）</label>
                <Textarea value={newClassDesc} onChange={(e) => setNewClassDesc(e.target.value)} placeholder="试点班级描述" rows={2} />
              </div>
              <Button onClick={handleCreateClass} disabled={loading} className="w-full">
                <Plus className="h-4 w-4 mr-1" /> 创建班级
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ListChecks className="h-5 w-5 text-primary" /> 已建班级</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {classes.length === 0 ? (
                <p className="text-sm text-muted-foreground">暂无班级，请先创建</p>
              ) : (
                classes.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedClassId(c.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${selectedClassId === c.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{c.name}</span>
                      {selectedClassId === c.id && <CheckCircle2 className="h-4 w-4 text-primary" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{studentCount > 0 && selectedClassId === c.id ? `${studentCount} 名脱敏学生` : '点击查看学生数'}</p>
                  </button>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* 右列：任务下发 */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5 text-primary" /> 下发实训任务</CardTitle>
              <CardDescription>
                {selectedClass ? <>目标班级：<Badge variant="secondary">{selectedClass.name}</Badge></> : '请先选择班级'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">任务标题</label>
                <Input value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="如：项目结题答辩对抗实训" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">任务说明（选填）</label>
                <Textarea value={taskDesc} onChange={(e) => setTaskDesc(e.target.value)} placeholder="说明实训要求与评分维度" rows={2} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">实训场景</label>
                <select className="w-full h-10 px-3 rounded-md border border-input bg-background" value={sceneType} onChange={(e) => setSceneType(e.target.value as SceneType)}>
                  {SCENE_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}（{s.desc}）</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">难度等级</label>
                  <select className="w-full h-10 px-3 rounded-md border border-input bg-background" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                    <option value="basic">基础</option>
                    <option value="intermediate">进阶</option>
                    <option value="advanced">高级</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">截止时间</label>
                  <Input type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
                </div>
              </div>
              <Button onClick={handlePublishTask} disabled={loading || !selectedClassId} className="w-full">
                <Send className="h-4 w-4 mr-1" /> 下发实训任务
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5 text-primary" /> 已下发任务</CardTitle>
            </CardHeader>
            <CardContent>
              {tasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">暂无任务</p>
              ) : (
                <div className="space-y-3">
                  {tasks.map((t) => {
                    const cls = classes.find((c) => c.id === t.class_id);
                    const scene = SCENE_OPTIONS.find((s) => s.value === t.scene_type);
                    return (
                      <div key={t.id} className="p-3 rounded-lg border border-border bg-muted/30">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-sm truncate">{t.title}</span>
                          <Badge variant="outline" className="shrink-0">{scene?.label || t.scene_type}</Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Users className="h-3 w-3" />{cls?.name || '未关联班级'}</span>
                          {t.deadline && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(t.deadline).toLocaleString('zh-CN')}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}