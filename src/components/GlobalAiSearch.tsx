import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { sendStreamRequest } from '@/lib/sse';
import { supabase } from '@/lib/supabase';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Loader2, Search, Sparkles, StopCircle, ExternalLink, Command, FileText, Zap, Bot } from 'lucide-react';
import { Streamdown } from 'streamdown';
import { toast } from 'sonner';
import { navRegistry, type NavItem } from '@/lib/navRegistry';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface SearchMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ContentResult {
  id: string;
  title: string;
  subtitle: string;
  path: string;
  type: string;
}

function detectRole(pathname: string): keyof typeof navRegistry {
  if (pathname.startsWith('/student')) return 'student';
  if (pathname.startsWith('/company')) return 'company';
  if (pathname.startsWith('/university')) return 'university';
  if (pathname.startsWith('/admin')) return 'admin';
  return 'student';
}

export function GlobalAiSearch({ children }: { children?: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<'function' | 'content' | 'ai'>('function');

  // AI 搜索状态
  const [messages, setMessages] = useState<SearchMessage[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [references, setReferences] = useState<any[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 内容搜索结果
  const [contentResults, setContentResults] = useState<ContentResult[]>([]);
  const [contentLoading, setContentLoading] = useState(false);

  const role = detectRole(location.pathname);
  const navItems = navRegistry[role] || [];

  // 全局快捷键 Cmd/Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, currentAnswer, aiLoading]);

  // 功能搜索
  const functionResults = useMemo(() => {
    if (!query.trim()) return navItems;
    const q = query.trim().toLowerCase();
    return navItems.filter(item =>
      item.label.toLowerCase().includes(q) ||
      (item.keywords || []).some(k => k.toLowerCase().includes(q)) ||
      item.path.toLowerCase().includes(q)
    );
  }, [query, navItems]);

  // 内容搜索（搜索用户的历史报告）
  useEffect(() => {
    if (tab !== 'content' || !query.trim()) {
      setContentResults([]);
      return;
    }
    const q = query.trim();
    const search = async () => {
      setContentLoading(true);
      const results: ContentResult[] = [];
      try {
        if (role === 'student') {
          const email = localStorage.getItem('student_email') || '';
          if (email) {
            const [evals, interviews, resumes] = await Promise.all([
              supabase.from('evaluations').select('evaluation_id, position_id, created_at').eq('user_id', email).order('created_at', { ascending: false }).limit(5),
              supabase.from('interview_reports').select('id, position, created_at').eq('user_email', email).order('created_at', { ascending: false }).limit(5),
              supabase.from('resume_optimizations').select('id, target_position, created_at').eq('user_email', email).order('created_at', { ascending: false }).limit(5),
            ]);
            (evals.data as any[] || []).forEach(e => results.push({
              id: e.evaluation_id, title: `测评报告`, subtitle: `岗位 #${e.position_id} · ${new Date(e.created_at).toLocaleDateString('zh-CN')}`,
              path: `/student/evaluation/result/${e.evaluation_id}`, type: '测评',
            }));
            (interviews.data as any[] || []).filter(i => (i.position || '').includes(q) || q.includes('面试')).forEach(i => results.push({
              id: i.id, title: `面试报告 · ${i.position || ''}`, subtitle: new Date(i.created_at).toLocaleDateString('zh-CN'),
              path: `/student/ai-interview/report/${i.id}`, type: '面试',
            }));
            (resumes.data as any[] || []).filter(r => (r.target_position || '').includes(q) || q.includes('简历')).forEach(r => results.push({
              id: r.id, title: `简历优化 · ${r.target_position || ''}`, subtitle: new Date(r.created_at).toLocaleDateString('zh-CN'),
              path: `/student/resume-assistant`, type: '简历',
            }));
          }
        }
      } catch { /* 忽略 */ }
      setContentResults(results);
      setContentLoading(false);
    };
    const t = setTimeout(search, 300);
    return () => clearTimeout(t);
  }, [query, tab, role]);

  const handleSearch = async () => {
    if (!query.trim() || aiLoading) return;
    const newQuery = query;
    setQuery('');
    const newMessages = [...messages, { role: 'user' as const, content: newQuery }];
    setMessages(newMessages);
    setCurrentAnswer('');
    setReferences([]);
    setAiLoading(true);

    abortRef.current = new AbortController();
    let acc = '';
    await sendStreamRequest({
      functionUrl: `${supabaseUrl}/functions/v1/baidu-ai-search`,
      requestBody: { query: newQuery, messages: newMessages },
      supabaseAnonKey,
      signal: abortRef.current.signal,
      onData: (data: string) => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.type === 'answer' && parsed.content) {
            acc += parsed.content;
            setCurrentAnswer(acc);
          } else if (parsed.type === 'references' && parsed.references) {
            setReferences(parsed.references);
          } else if (parsed.type === 'error') {
            toast.error(parsed.error || '搜索失败');
          }
        } catch { /* 忽略非 JSON 块 */ }
      },
      onComplete: () => {
        setMessages((prev) => [...prev, { role: 'assistant', content: acc }]);
        setAiLoading(false);
      },
      onError: (err: Error) => {
        if (err?.name !== 'AbortError') toast.error(err?.message || '搜索失败');
        setAiLoading(false);
      },
    });
  };

  const goFunction = (item: NavItem) => {
    navigate(item.path);
    setOpen(false);
    setQuery('');
  };

  const goContent = (r: ContentResult) => {
    navigate(r.path);
    setOpen(false);
    setQuery('');
  };

  return (
    <Sheet open={open} onOpenChange={(o) => { setOpen(o); if (!o) setQuery(''); }}>
      <SheetTrigger asChild>
        {children || (
          <Button variant="outline" size="sm" className="gap-2 w-full md:w-auto justify-start md:w-64">
            <Search className="h-4 w-4 shrink-0" />
            <span className="text-muted-foreground text-sm truncate">搜索功能、内容或提问...</span>
            <kbd className="ml-auto hidden md:inline-flex h-5 items-center gap-0.5 rounded border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground shrink-0">
              <Command className="h-3 w-3" />K
            </kbd>
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="top" className="p-0 h-[85vh] md:h-[80vh] max-w-2xl mx-auto rounded-b-2xl">
        <SheetHeader className="px-4 pt-4 pb-2 border-b">
          <SheetTitle className="text-base">全局搜索</SheetTitle>
          <SheetDescription className="sr-only">搜索功能、历史内容或向 AI 提问</SheetDescription>
        </SheetHeader>

        <div className="px-4 pt-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && tab === 'ai') handleSearch(); }}
              placeholder="输入关键词搜索功能、内容，或切换到 AI 提问..."
              className="pl-9 pr-3"
              autoFocus
            />
          </div>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="px-4 pt-3">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="function" className="gap-1.5"><Zap className="h-3.5 w-3.5" />功能</TabsTrigger>
            <TabsTrigger value="content" className="gap-1.5"><FileText className="h-3.5 w-3.5" />内容</TabsTrigger>
            <TabsTrigger value="ai" className="gap-1.5"><Bot className="h-3.5 w-3.5" />AI 问答</TabsTrigger>
          </TabsList>

          {/* 功能搜索 */}
          <TabsContent value="function" className="mt-3">
            <ScrollArea className="h-[55vh]">
              <div className="space-y-1 pb-4">
                {functionResults.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-8">未找到匹配的功能</p>
                ) : functionResults.map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.path}
                      type="button"
                      onClick={() => goFunction(item)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition-colors text-left"
                    >
                      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-sm flex-1 min-w-0 truncate">{item.label}</span>
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* 内容搜索 */}
          <TabsContent value="content" className="mt-3">
            <ScrollArea className="h-[55vh]">
              <div className="space-y-1 pb-4">
                {!query.trim() ? (
                  <p className="text-center text-sm text-muted-foreground py-8">输入关键词搜索你的历史报告</p>
                ) : contentLoading ? (
                  <div className="flex items-center justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
                ) : contentResults.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-8">未找到匹配的内容</p>
                ) : contentResults.map(r => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => goContent(r)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition-colors text-left"
                  >
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm truncate">{r.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{r.subtitle}</p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">{r.type}</span>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* AI 问答 */}
          <TabsContent value="ai" className="mt-3">
            <div className="flex items-center gap-2 mb-3">
              <Button size="sm" onClick={handleSearch} disabled={aiLoading || !query.trim()}>
                {aiLoading ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 mr-1" />}
                {aiLoading ? '搜索中...' : 'AI 搜索'}
              </Button>
              {aiLoading && (
                <Button size="sm" variant="outline" onClick={() => abortRef.current?.abort()}>
                  <StopCircle className="h-3.5 w-3.5 mr-1" />停止
                </Button>
              )}
            </div>
            <ScrollArea className="h-[48vh]">
              <div ref={scrollRef} className="space-y-3 pb-4">
                {messages.map((m, i) => (
                  <div key={i} className={`p-3 rounded-lg text-sm ${m.role === 'user' ? 'bg-primary/10 ml-8' : 'bg-muted mr-8'}`}>
                    {m.role === 'assistant' ? <Streamdown>{m.content}</Streamdown> : <p className="whitespace-pre-wrap text-pretty">{m.content}</p>}
                  </div>
                ))}
                {currentAnswer && (
                  <div className="p-3 rounded-lg bg-muted mr-8 text-sm">
                    <Streamdown>{currentAnswer}</Streamdown>
                  </div>
                )}
                {references.length > 0 && (
                  <div className="space-y-1.5 mr-8">
                    {references.map((ref: any, i: number) => (
                      <a key={i} href={ref.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-start gap-2 p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors">
                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-xs font-medium truncate">{ref.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{ref.url}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
                {!messages.length && !currentAnswer && (
                  <p className="text-center text-sm text-muted-foreground py-8">
                    输入问题，按回车或点击 AI 搜索，获取实时联网回答
                  </p>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}