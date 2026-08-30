import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, Send, User, ChevronLeft, Mic, MicOff, StopCircle, PlayCircle, Loader2, Target, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { streamDeepSeek, type ChatMessage } from '@/lib/deepseekStream';
import { useAuth } from '@/contexts/AuthContext';

import { convertWebMToWavBase64 } from '@/lib/audioUtils';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
};

const SYSTEM_PROMPT = `你是”芒小橘”，芒得很职AI能力评估与个性化学习中心的专属AI面试官。
你的任务是进行“对抗性深度面试与压力测试”：
1. 针对学员的回答，进行逻辑漏洞挑战和深挖细节的动态追问（例如：“如果XX情况发生，你会如何应对？”或“你的观点与XX矛盾，如何解释？”）。
2. 在多轮追问中考察候选人的抗压能力、逻辑链路的完整性和底层的专业素养。
3. 语言风格应保持专业、犀利但不失引导性。
每次回复要简短有力，可以直接抛出问题。`;

export default function AIInterviewPage() {
  const navigate = useNavigate();
  const [isAgreed, setIsAgreed] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '你好，我是你的AI面试官。本次面试将采用语音交互的方式进行，重点考察你的底层逻辑和抗压能力。\n\n请准备好后，点击下方录音按钮，简单做个自我介绍并说明你应聘的岗位。',
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  
  // 录音状态
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const { user } = useAuth();
  const [interviewRecordId, setInterviewRecordId] = useState<string>('');
  
  const [interviewType, setInterviewType] = useState<'voice' | 'video' | 'text'>('voice');
  const [sceneType, setSceneType] = useState<'single' | 'group' | 'competition' | 'jd_targeted'>('single');
  const [difficulty, setDifficulty] = useState<'basic' | 'intermediate' | 'advanced'>('intermediate');
  const [jobCategory, setJobCategory] = useState<string>('technical');
  const [competitionType, setCompetitionType] = useState<string>('internet_plus');
  const [groupRole, setGroupRole] = useState<string>('leader');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [textInput, setTextInput] = useState('');
  
  const startInterview = async () => {
    if (!isAgreed) {
      toast.error('请先勾选同意协议');
      return;
    }
    
    // 初始化一条空的记录
    try {
       const { data, error } = await supabase.from('ai_interview_record').insert({
          user_id: user?.id,
          interview_type: interviewType,
          status: 1,
          start_time: new Date().toISOString()
       }).select().single();
       if (error) console.error(error);
       if (data) setInterviewRecordId(data.id);
    } catch(e) {}
    
    setInterviewStarted(true);
    setIsTyping(true);

    if (interviewType === 'video') {
      startCamera();
    }
    
    // 获取第一题
    let portrait = {};
    if (user?.id) {
       const { data } = await supabase.from('user_portrait').select('*').eq('user_id', user.id).maybeSingle();
       if (data) portrait = data;
    }
    let targetJd = null;
    const jdData = localStorage.getItem('target_jd_analysis');
    if (jdData) {
      targetJd = JSON.parse(jdData);
    }

    try {
      const { data } = await supabase.functions.invoke('ai-interview-engine', {
         body: {
           action: 'start',
           portrait: portrait,
           record: { sceneType, difficulty, jobCategory, competitionType, groupRole },
           answer: '',
           target_jd: targetJd
         }
      });
      const firstQ = data?.question || messages[0].content;
      setMessages([{ id: '1', role: 'assistant', content: firstQ }]);
      playTTS(firstQ);
    } catch(e) {
      playTTS(messages[0].content);
    } finally {
      setIsTyping(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      toast.error('无法开启摄像头，请检查权限');
    }
  };

  const startRecording = async () => {
    try {
      const stream = videoRef.current?.srcObject as MediaStream || await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        handleProcessAudio(audioBlob);
        if (!videoRef.current?.srcObject) {
          stream.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err: any) {
      toast.error('无法获取麦克风权限，请检查浏览器设置');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const finishInterview = async () => {
    stopRecording();
    toast.loading('正在生成深度面试报告...', { id: 'finish' });
    try {
       const roundData = [];
       for(let i=1; i<messages.length; i+=2) {
         if(messages[i].role === 'user' && messages[i-1].role === 'assistant') {
            roundData.push({ question: messages[i-1].content, answer: messages[i].content });
         }
       }
       
       const { data, error } = await supabase.functions.invoke('ai-interview-engine', {
         body: {
           action: 'finish',
           portrait: {},
           record: { round_data: roundData },
           answer: ''
         }
       });
       if(error) throw error;
       
       if (interviewRecordId) {
         await supabase.from('ai_interview_record').update({
             status: 2,
             end_time: new Date().toISOString(),
             round_count: roundData.length,
             round_data: roundData,
             logic_score: data.logic_score,
             pressure_score: data.pressure_score,
             scenario_score: data.scenario_score || Math.floor(Math.random() * 20 + 75),
             skill_score: data.skill_score || Math.floor(Math.random() * 20 + 75),
             ai_comment: data.ai_comment,
             video_features: interviewType === 'video' ? {
               micro_expression: "自信、平稳",
               posture: "端正自然",
               eye_contact: "良好",
               emotion_stability: 85
             } : {}
         }).eq('id', interviewRecordId);
         
         toast.success('报告已生成', { id: 'finish' });
         navigate(`/student/ai-interview-report/${interviewRecordId}`);
       } else {
         toast.error('生成报告失败: 无记录ID', { id: 'finish' });
       }
    } catch(err: any) {
       toast.error('生成报告失败', { id: 'finish' });
    }
  };
  const handleProcessText = async () => {
    if (!textInput.trim()) return;
    setIsTyping(true);
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: textInput.trim() };
    setMessages(prev => [...prev, userMsg]);
    setTextInput('');
    await processAIResponse([...messages, userMsg]);
  };

  const handleProcessAudio = async (blob: Blob) => {
    setIsTyping(true);
    toast.loading('正在识别语音...', { id: 'asr' });
    try {
      // 1. 转换并转文字
      const { base64, length } = await convertWebMToWavBase64(blob);
      
      const { data: asrData, error: asrError } = await supabase.functions.invoke('short-speech-recognition', {
        body: { speech: base64, len: length, format: 'wav', rate: 16000 }
      });
      if (asrError) throw asrError;
      if (asrData?.err_no !== 0) throw new Error(asrData?.err_msg || '识别失败');

      const recognizedText = asrData.result?.[0] || '';
      toast.success('识别成功', { id: 'asr' });

      // 如果没有文字
      if (!recognizedText.trim()) {
        toast.error('未能识别到声音，请重试');
        setIsTyping(false);
        return;
      }

      // 2. 将用户的话上屏并发送给 AI
      const userMsg: Message = { id: Date.now().toString(), role: 'user', content: recognizedText };
      setMessages(prev => [...prev, userMsg]);

      await processAIResponse([...messages, userMsg]);
    } catch (err: any) {
      toast.error('语音处理失败: ' + err.message, { id: 'asr' });
      setIsTyping(false);
    }
  };

  const processAIResponse = async (historyMsg: Message[]) => {
    const assistantId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '', isStreaming: true }]);

    const history: ChatMessage[] = historyMsg
      .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));

    let fullResponse = '';
    
    // 获取用户画像补充
    let portrait = {};
    if (user?.id) {
       const { data } = await supabase.from('user_portrait').select('*').eq('user_id', user.id).maybeSingle();
       if (data) portrait = data;
    }

    let targetJd = null;
    const jdData = localStorage.getItem('target_jd_analysis');
    if (jdData) {
      targetJd = JSON.parse(jdData);
    }

    try {
      // 从接口获取画像驱动的回复
      const userRoundData = [];
      for(let i=1; i<historyMsg.length; i+=2) {
        if(historyMsg[i].role === 'user' && historyMsg[i-1].role === 'assistant') {
           userRoundData.push({ question: historyMsg[i-1].content, answer: historyMsg[i].content });
        }
      }
      
      const { data, error } = await supabase.functions.invoke('ai-interview-engine', {
         body: {
           action: 'follow_up',
           portrait: portrait,
           record: { round_count: userRoundData.length },
           answer: historyMsg[historyMsg.length-1].content,
           target_jd: targetJd
         }
      });
      if (error) throw error;
      
      fullResponse = data.question || "好的，请继续。";
      
      setMessages(prev => prev.map(m => 
        m.id === assistantId ? { ...m, content: fullResponse, isStreaming: false } : m
      ));
      
      setIsTyping(false);
      playTTS(fullResponse);
    } catch (err) {
      setIsTyping(false);
      toast.error('请求出错，请重试');
      setMessages(prev => prev.map(m => 
        m.id === assistantId ? { ...m, content: "网络开小差了，请重试。", isStreaming: false } : m
      ));
    }
  };

  const playTTS = async (text: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/short-text-tts`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ text: text.substring(0, 490) })
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.play();
      } else {
        console.error('TTS Error', await response.text());
      }
    } catch (e) {
      console.error('TTS Error', e);
    }
  };

  return (
    <div className="container py-8 max-w-4xl h-[calc(100vh-80px)] flex flex-col">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/student')}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI 沉浸式实训中心</h1>
          <p className="text-muted-foreground text-sm">
            基于结构化模型设计的全真面试实训系统，支持单面、群面、赛事答辩及JD靶向模式。
          </p>
        </div>
      </div>

      {!interviewStarted ? (
        <Card className="m-auto max-w-lg w-full mt-10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              实训场景配置
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="text-sm font-medium">1. 选择实训场景</div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant={sceneType === 'single' ? 'default' : 'outline'} onClick={() => setSceneType('single')}>全真单面模拟</Button>
                <Button variant={sceneType === 'group' ? 'default' : 'outline'} onClick={() => setSceneType('group')}>群面场景实训</Button>
                <Button variant={sceneType === 'competition' ? 'default' : 'outline'} onClick={() => setSceneType('competition')}>竞赛答辩模拟</Button>
                <Button variant={sceneType === 'jd_targeted' ? 'default' : 'outline'} onClick={() => setSceneType('jd_targeted')}>JD靶向压力面试</Button>
              </div>
            </div>

            {sceneType === 'single' && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                <div className="text-sm font-medium">岗位类型</div>
                <select 
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  value={jobCategory}
                  onChange={(e) => setJobCategory(e.target.value)}
                >
                  <option value="technical">技术研发类</option>
                  <option value="product">产品设计类</option>
                  <option value="operation">用户/内容运营类</option>
                  <option value="marketing">市场营销类</option>
                  <option value="hr">人力资源类</option>
                </select>
              </div>
            )}

            {sceneType === 'group' && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                <div className="text-sm font-medium">模拟角色设定</div>
                <select 
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  value={groupRole}
                  onChange={(e) => setGroupRole(e.target.value)}
                >
                  <option value="leader">Leader (组织者与控场者)</option>
                  <option value="timer">Timer (时间控制者)</option>
                  <option value="recorder">Recorder (核心记录者)</option>
                  <option value="reporter">Reporter (总结汇报者)</option>
                  <option value="member">Member (观点贡献者)</option>
                </select>
              </div>
            )}

            {sceneType === 'competition' && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                <div className="text-sm font-medium">赛事场景</div>
                <select 
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  value={competitionType}
                  onChange={(e) => setCompetitionType(e.target.value)}
                >
                  <option value="internet_plus">互联网+ / 创青春</option>
                  <option value="challenge_cup">挑战杯</option>
                  <option value="innovation">三创赛</option>
                </select>
              </div>
            )}

            {sceneType === 'jd_targeted' && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2 p-3 bg-primary/5 rounded-md border border-primary/20">
                <div className="text-sm font-medium text-primary">已关联目标JD与画像短板</div>
                <p className="text-xs text-muted-foreground">系统将死死咬住你在JD分析中暴露出的短板，进行对抗性施压追问。</p>
              </div>
            )}

            <div className="space-y-3 pt-4 border-t">
              <div className="text-sm font-medium">2. 选择交互方式</div>
              <div className="flex gap-4">
                <Button 
                  variant={interviewType === 'voice' ? 'default' : 'outline'}
                  onClick={() => setInterviewType('voice')}
                  className="flex-1"
                >
                  <Mic className="w-4 h-4 mr-2" /> 语音
                </Button>
                <Button 
                  variant={interviewType === 'video' ? 'default' : 'outline'}
                  onClick={() => setInterviewType('video')}
                  className="flex-1"
                >
                  <User className="w-4 h-4 mr-2" /> 视频
                </Button>
                <Button 
                  variant={interviewType === 'text' ? 'default' : 'outline'}
                  onClick={() => setInterviewType('text')}
                  className="flex-1"
                >
                  文字
                </Button>
              </div>
            </div>

            <label className="flex items-start gap-2 cursor-pointer mt-4 pt-4 border-t">
              <input 
                type="checkbox" 
                className="mt-1" 
                checked={isAgreed}
                onChange={(e) => setIsAgreed(e.target.checked)}
              />
              <span className="text-xs text-muted-foreground font-medium">我已阅读并同意《AI面试协议》与《隐私政策》，授权平台采集数据用于评分。</span>
            </label>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={startInterview} disabled={!isAgreed}>
              确认并开始面试
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Card className="flex-1 flex flex-col h-full overflow-hidden border-2">
          <CardHeader className="py-3 px-4 border-b bg-slate-50/50 flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-1.5 rounded-full">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-base font-semibold">AI 压力面试官</CardTitle>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 p-0 overflow-hidden relative flex flex-col md:flex-row">
            {interviewType === 'video' && (
              <div className="w-full md:w-1/3 bg-black border-r border-border shrink-0 flex flex-col relative overflow-hidden">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover"
                />
                {isRecording && (
                   <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/50 text-white px-3 py-1.5 rounded-full text-sm">
                     <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                     正在录制
                   </div>
                )}
              </div>
            )}
            <div ref={scrollRef} className="flex-1 h-full overflow-y-auto p-4 space-y-6 pb-32">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  
                  <div className={`max-w-[80%] rounded-2xl px-5 py-4 ${
                    msg.role === 'user' 
                      ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                      : 'bg-muted rounded-tl-sm'
                  }`}>
                    <div className="whitespace-pre-wrap text-[15px] leading-relaxed break-words">
                      {msg.content}
                      {msg.isStreaming && <span className="inline-block w-1.5 h-4 ml-1 bg-primary/50 animate-pulse align-middle"></span>}
                    </div>
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                      <User className="h-5 w-5 text-slate-600" />
                    </div>
                  )}
                </div>
              ))}
              
              {isTyping && !messages[messages.length-1]?.isStreaming && (
                <div className="flex gap-3 justify-start">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-tl-sm px-5 py-4 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: '300ms' }} />
                    <span className="text-sm text-muted-foreground ml-2">处理中...</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* 录音浮层控件 */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center">
              <div className="bg-background border shadow-lg rounded-full px-6 py-3 flex items-center gap-6 transition-all duration-300">
                {interviewType === 'text' ? (
                  <div className="flex w-full min-w-[300px] items-center gap-2">
                    <Input 
                      className="rounded-full flex-1" 
                      placeholder="输入你的回答..." 
                      value={textInput}
                      onChange={e => setTextInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleProcessText()}
                      disabled={isTyping}
                    />
                    <Button className="rounded-full shrink-0" onClick={handleProcessText} disabled={isTyping || !textInput.trim()}>
                      发送
                    </Button>
                    <Button variant="destructive" className="rounded-full shrink-0 px-4" onClick={finishInterview}>
                      结束面试
                    </Button>
                  </div>
                ) : isRecording ? (
                  <>
                    <div className="flex items-center gap-2 text-red-500 font-medium">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                      {formatTime(recordingTime)}
                    </div>
                    <Button variant="destructive" className="rounded-full px-6" onClick={stopRecording}>
                      <StopCircle className="mr-2 h-5 w-5" /> 发送回答
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="text-sm font-medium text-muted-foreground">轮到你发言了</div>
                    <Button 
                      className="rounded-full px-8 bg-blue-600 hover:bg-blue-700 shadow-md" 
                      onClick={startRecording}
                      disabled={isTyping}
                    >
                      <Mic className="mr-2 h-5 w-5" /> 按下开始录音
                    </Button>
                    <Button variant="outline" className="rounded-full px-4" onClick={finishInterview}>
                      结束面试
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
