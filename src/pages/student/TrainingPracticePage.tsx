import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Bot, Send, User, ChevronLeft, Mic, MicOff, StopCircle, Loader2, Target, Zap, FileText, GraduationCap, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import {
  getTrainingTask,
  getMySubmission,
  createSubmission,
  updateSubmissionEvidence,
  completeSubmission,
  getStudentHistory,
  invokeOrchestrator,
} from '@/db/training';
import { SCENE_OPTIONS, type EvidenceMessage, type TrainingTask } from '@/types/training';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
};

// 试点学生身份（真实完整学号，来自学生档案名单）
function getStudentNo(): string {
  return localStorage.getItem('student_no') || '';
}

export default function TrainingPracticePage() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const studentNo = getStudentNo();

  // 学生真实档案（导师/宿舍），来自脱敏导入数据
  const [profile, setProfile] = useState<{ name: string; mentor_name?: string; mentor_title?: string; dorm_building?: string; dorm_room?: string; hometown?: string; political_status?: string } | null>(null);
  useEffect(() => {
    const loadProfile = async () => {
      if (!studentNo) return;
      const { data } = await supabase
        .from('student_profiles')
        .select('name,mentor_name,mentor_title,dorm_building,dorm_room,hometown,political_status')
        .eq('student_no', studentNo)
        .maybeSingle();
      setProfile(data as { name: string; mentor_name?: string; mentor_title?: string; dorm_building?: string; dorm_room?: string; hometown?: string; political_status?: string } | null);
    };
    loadProfile();
  }, [studentNo]);

  const [task, setTask] = useState<TrainingTask | null>(null);
  const [submissionId, setSubmissionId] = useState<string>('');
  const [script, setScript] = useState<Record<string, unknown>>({});
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [started, setStarted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop();
    };
  }, []);

  // 加载任务与已有提交
  useEffect(() => {
    const init = async () => {
      if (!taskId) return;
      const t = await getTrainingTask(taskId);
      setTask(t);
      if (!t) { toast.error('任务不存在'); return; }
      const existing = await getMySubmission(taskId, studentNo);
      if (existing) {
        setSubmissionId(existing.id);
        setScript(existing.script || {});
        if (existing.evidence_chain?.length > 0) {
          setMessages(
            existing.evidence_chain.map((m, i) => ({ id: String(i), role: m.role, content: m.content })),
          );
          setStarted(true);
        }
      }
    };
    init();
  }, [taskId, studentNo]);

  const scene = SCENE_OPTIONS.find((s) => s.value === task?.scene_type);

  // 持久化证据链
  const persistEvidence = useCallback(async (msgs: Message[]) => {
    if (!submissionId) return;
    const chain: EvidenceMessage[] = msgs
      .filter((m) => !m.isStreaming)
      .map((m) => ({ role: m.role, content: m.content, ts: new Date().toISOString() }));
    try {
      await updateSubmissionEvidence(submissionId, chain);
    } catch (e) {
      console.error('persist evidence error', e);
    }
  }, [submissionId]);

  // 开始实训：生成画像→脚本→创建提交记录→开场问题
  const handleStart = async () => {
    if (!task) return;
    setIsTyping(true);
    try {
      // 创建提交记录
      let sub = await getMySubmission(task.id, studentNo);
      if (!sub) {
        sub = await createSubmission({ task_id: task.id, class_id: task.class_id || '', student_no: studentNo });
      }
      if (sub) setSubmissionId(sub.id);

      // 角色1：画像Agent —— 基于历史实训交互构建6维度软能力画像
      const history = await getStudentHistory(studentNo);
      const portraitRes = await invokeOrchestrator({
        action: 'portrait',
        portrait: { assessment: {}, history },
        student_no: studentNo,
      });
      const portrait = (portraitRes.portrait as { dimensions?: Array<{ name: string; score: number; weakness: string }> }) || {};
      localStorage.setItem('student_portrait', JSON.stringify(portrait));

      // 角色2：脚本生成Agent —— 读取画像短板生成个性化对抗脚本
      const scriptRes = await invokeOrchestrator({
        action: 'generate_script',
        portrait,
        scene_type: task.scene_type,
        difficulty: task.difficulty,
        student_no: studentNo,
      });
      const generatedScript = (scriptRes.script as Record<string, unknown>) || {};
      setScript(generatedScript);

      const opening = (generatedScript.opening_question as string) || '请先做一个简短的自我介绍，并说明你本次实训希望重点提升的能力。';
      const firstMsg: Message = { id: '1', role: 'assistant', content: opening };
      setMessages([firstMsg]);
      setStarted(true);
      await persistEvidence([firstMsg]);
    } catch (e) {
      toast.error('启动实训失败，请重试');
    } finally {
      setIsTyping(false);
    }
  };

  // 发送学生回答 -> 对抗追问
  const handleSendText = async () => {
    if (!textInput.trim() || isTyping) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: textInput.trim() };
    const next = [...messages, userMsg];
    setMessages(next);
    setTextInput('');
    await persistEvidence(next);
    await askNext(next);
  };

  const askNext = async (history: Message[]) => {
    setIsTyping(true);
    const assistantId = (Date.now() + 1).toString();
    setMessages((prev) => [...prev, { id: assistantId, role: 'assistant', content: '', isStreaming: true }]);
    try {
      const evidence = history.filter((m) => !m.isStreaming).map((m) => ({ role: m.role, content: m.content, ts: new Date().toISOString() }));
      const res = await invokeOrchestrator({ action: 'next_question', script, evidence_chain: evidence });
      const q = (res.question as string) || '请继续。';
      setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: q, isStreaming: false } : m)));
      await persistEvidence([...history, { id: assistantId, role: 'assistant', content: q }]);
    } catch {
      setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: '网络开小差了，请重试。', isStreaming: false } : m)));
    } finally {
      setIsTyping(false);
    }
  };

  // 语音录制
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mediaRecorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach((t) => t.stop());
        await handleAudio(blob);
      };
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime((p) => p + 1), 1000);
    } catch {
      toast.error('无法获取麦克风权限');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleAudio = async (blob: Blob) => {
    setIsTyping(true);
    toast.loading('正在识别语音...', { id: 'asr' });
    try {
      const { convertWebMToWavBase64 } = await import('@/lib/audioUtils');
      const { base64, length } = await convertWebMToWavBase64(blob);
      const { data, error } = await supabase.functions.invoke('short-speech-recognition', {
        body: { speech: base64, len: length, format: 'wav', rate: 16000 },
      });
      if (error) throw error;
      const text = data?.result?.[0] || '';
      toast.dismiss('asr');
      if (!text.trim()) { toast.error('未能识别到声音，请重试'); setIsTyping(false); return; }
      const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
      const next = [...messages, userMsg];
      setMessages(next);
      await persistEvidence(next);
      await askNext(next);
    } catch (e: unknown) {
      toast.error('语音处理失败', { id: 'asr' });
      setIsTyping(false);
    }
  };

  // 完成实训 -> 评估
  const handleFinish = async () => {
    if (messages.length < 2) { toast.error('请至少完成一轮对话'); return; }
    setSubmitting(true);
    toast.loading('正在基于对话证据链生成评估报告...', { id: 'finish' });
    try {
      const evidence = messages.filter((m) => !m.isStreaming).map((m) => ({ role: m.role, content: m.content, ts: new Date().toISOString() }));
      const res = await invokeOrchestrator({ action: 'evaluate', evidence_chain: evidence });
      const scores = (res.scores as Record<string, number>) || {};
      const aiComment = (res.ai_comment as string) || '';
      await completeSubmission(submissionId, {
        evidence_chain: evidence,
        script,
        scores,
        ai_comment: aiComment,
      });
      toast.success('评估报告已生成', { id: 'finish' });
      navigate(`/student/training/report/${submissionId}`);
    } catch (e: unknown) {
      toast.error('生成报告失败', { id: 'finish' });
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  if (!task) {
    return <div className="p-8 text-center text-muted-foreground">加载中...</div>;
  }

  return (
    <div className="container py-8 max-w-4xl h-[calc(100vh-80px)] flex flex-col">
      <div className="flex items-center gap-4 mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/student/training-tasks')}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold tracking-tight truncate">{task.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline">{scene?.label || task.scene_type}</Badge>
            <span className="text-xs text-muted-foreground">难度：{task.difficulty}</span>
          </div>
        </div>
      </div>

      {!started ? (
        <Card className="m-auto max-w-lg w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Zap className="h-5 w-5 text-amber-500" /> 准备开始对抗实训</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile && (
              <div className="border rounded-lg p-4 space-y-2 bg-primary/5">
                <p className="text-sm font-medium flex items-center gap-2"><User className="h-4 w-4 text-primary" /> 我的档案（系统已识别你的身份）</p>
                <p className="text-sm"><span className="text-muted-foreground">姓名：</span>{profile.name}{profile.political_status ? ` · ${profile.political_status}` : ''}</p>
                {profile.mentor_name && (
                  <p className="text-sm flex items-center gap-1.5"><GraduationCap className="h-4 w-4 text-muted-foreground shrink-0" /><span className="text-muted-foreground">指导导师：</span>{profile.mentor_name}{profile.mentor_title ? `（${profile.mentor_title}）` : ''}</p>
                )}
                {profile.dorm_building && (
                  <p className="text-sm flex items-center gap-1.5"><Building className="h-4 w-4 text-muted-foreground shrink-0" /><span className="text-muted-foreground">宿舍：</span>{profile.dorm_building} {profile.dorm_room}室{profile.hometown ? ` · 生源地：${profile.hometown}` : ''}</p>
                )}
              </div>
            )}
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <p className="text-sm font-medium flex items-center gap-2"><FileText className="h-4 w-4 text-primary" /> 任务说明</p>
              <p className="text-sm text-muted-foreground">{task.description}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              系统将基于你的软能力画像生成个性化对抗脚本，通过多轮动态追问完整留存你的对话交互证据链，用于多维评估。
            </p>
            <Button onClick={handleStart} disabled={isTyping} className="w-full">
              {isTyping ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> 正在生成脚本...</> : <><Target className="h-4 w-4 mr-1" /> 开始实训</>}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pb-4">
            {messages.map((m) => (
              <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  {m.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <div className={`max-w-[75%] rounded-lg px-4 py-2 text-sm ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  {m.content || <Loader2 className="h-4 w-4 animate-spin" />}
                </div>
              </div>
            ))}
          </div>

          <div className="shrink-0 border-t pt-4 space-y-3">
            <div className="flex gap-2">
              <Input
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendText()}
                placeholder="输入你的回答..."
                disabled={isTyping}
              />
              <Button onClick={handleSendText} disabled={isTyping || !textInput.trim()} size="icon">
                <Send className="h-4 w-4" />
              </Button>
              <Button
                variant={isRecording ? 'destructive' : 'outline'}
                onClick={isRecording ? stopRecording : startRecording}
                size="icon"
              >
                {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            </div>
            {isRecording && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <StopCircle className="h-4 w-4 animate-pulse" /> 录音中 {formatTime(recordingTime)}，点击麦克风停止
              </div>
            )}
            <Button onClick={handleFinish} disabled={submitting || messages.length < 2} variant="secondary" className="w-full">
              {submitting ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> 评估中...</> : '完成实训并生成评估报告'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}