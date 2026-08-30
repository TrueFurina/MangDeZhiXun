import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Send, Sparkles, Loader2, Compass, User, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Streamdown } from 'streamdown';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTIONS = [
  '我是计算机专业大三学生，想进大厂做后端，该怎么规划？',
  '嵌入式和前端哪个更适合我？帮我分析一下。',
  '秋招快到了，我该重点准备哪些技能？',
  '我想跨专业转行做产品经理，可行吗？',
];

export default function CareerPlannerPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const userEmail = user?.email || localStorage.getItem('student_email') || '';

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || loading) return;
    const newMessages = [...messages, { role: 'user' as const, content }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-career-planner', {
        body: {
          messages: newMessages,
          profile: { email: userEmail },
        },
      });
      if (error) {
        let msg = '咨询失败';
        try {
          const errJson = JSON.parse(await error.context?.text?.() || '{}');
          msg = errJson.error || msg;
        } catch { /* 忽略 */ }
        throw new Error(msg);
      }
      if (data?.success && data.content) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
      } else {
        throw new Error(data?.error || '咨询失败');
      }
    } catch (err: any) {
      toast.error(err?.message || '咨询失败');
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-8 max-w-3xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI 职业规划师</h1>
          <p className="text-muted-foreground text-sm mt-1">多轮对话式职业咨询，生成个性化职业发展路径</p>
        </div>
      </div>

      <Card className="flex flex-col" style={{ height: 'calc(100vh - 220px)', minHeight: 400 }}>
        <CardHeader className="pb-2 border-b shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-base">职业规划对话</CardTitle>
                <CardDescription className="text-xs">告诉我你的专业、兴趣与目标，我来为你规划</CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="text-xs">AI 助手</Badge>
          </div>
        </CardHeader>

        {/* 消息区 */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">开始你的职业规划之旅</h3>
              <p className="text-sm text-muted-foreground mb-6 text-pretty max-w-sm mx-auto">
                从下方推荐问题开始，或直接输入你的困惑
              </p>
              <div className="grid grid-cols-1 gap-2 max-w-md mx-auto">
                {SUGGESTIONS.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="text-left p-3 rounded-lg border hover:bg-accent transition-colors text-sm"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}>
                {m.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4 text-primary" />}
              </div>
              <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                m.role === 'user' ? 'bg-primary/10 rounded-tr-sm' : 'bg-muted rounded-tl-sm'
              }`}>
                {m.role === 'assistant' ? <Streamdown>{m.content}</Streamdown> : <p className="whitespace-pre-wrap text-pretty">{m.content}</p>}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="p-3 rounded-2xl bg-muted rounded-tl-sm flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">规划师思考中...</span>
              </div>
            </div>
          )}
        </div>

        {/* 输入区 */}
        <div className="p-3 border-t shrink-0">
          <div className="flex items-center gap-2">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); } }}
              placeholder="输入你的职业困惑..."
              disabled={loading}
              className="flex-1"
            />
            <Button size="icon" onClick={() => send(input)} disabled={loading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}