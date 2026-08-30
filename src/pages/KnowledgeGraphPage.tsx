import React, { useEffect, useRef, useState } from 'react';
import { Network, Database, BrainCircuit, Search, ZoomIn, ZoomOut, Maximize, ChevronLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

// Mock data for the 90-question knowledge graph
const mockNodes = [
  { id: 'root', group: 0, label: '行业标准核心能力库', val: 30 },
  { id: 'frontend', group: 1, label: '前端开发', val: 20 },
  { id: 'backend', group: 2, label: '后端开发', val: 20 },
  { id: 'data', group: 3, label: '数据分析', val: 20 },
  { id: 'ai', group: 4, label: '人工智能', val: 20 },
  { id: 'product', group: 5, label: '产品经理', val: 20 },
  { id: 'operation', group: 6, label: '产品运营', val: 20 },
  { id: 'react', group: 1, label: 'React 原理', val: 10 },
  { id: 'vue', group: 1, label: 'Vue 响应式', val: 10 },
  { id: 'js', group: 1, label: 'JavaScript 闭包', val: 10 },
  { id: 'ts', group: 1, label: 'TypeScript 泛型', val: 10 },
  { id: 'java', group: 2, label: 'Java JVM', val: 10 },
  { id: 'spring', group: 2, label: 'Spring Boot', val: 10 },
  { id: 'mysql', group: 2, label: 'MySQL 索引', val: 10 },
  { id: 'redis', group: 2, label: 'Redis 缓存', val: 10 },
  { id: 'sql', group: 3, label: 'SQL 优化', val: 10 },
  { id: 'python', group: 3, label: 'Python 数据清洗', val: 10 },
  { id: 'pandas', group: 3, label: 'Pandas', val: 10 },
  { id: 'ml', group: 4, label: '机器学习基础', val: 10 },
  { id: 'dl', group: 4, label: '深度学习', val: 10 },
  { id: 'nlp', group: 4, label: 'NLP 预处理', val: 10 },
  { id: 'prd', group: 5, label: 'PRD 撰写', val: 10 },
  { id: 'axure', group: 5, label: '原型设计', val: 10 },
  { id: 'user_research', group: 5, label: '用户调研', val: 10 },
  { id: 'growth', group: 6, label: '用户增长', val: 10 },
  { id: 'content', group: 6, label: '内容运营', val: 10 },
];

const mockLinks = [
  { source: 'root', target: 'frontend' },
  { source: 'root', target: 'backend' },
  { source: 'root', target: 'data' },
  { source: 'root', target: 'ai' },
  { source: 'root', target: 'product' },
  { source: 'root', target: 'operation' },
  { source: 'frontend', target: 'react' },
  { source: 'frontend', target: 'vue' },
  { source: 'frontend', target: 'js' },
  { source: 'frontend', target: 'ts' },
  { source: 'js', target: 'react' },
  { source: 'js', target: 'vue' },
  { source: 'backend', target: 'java' },
  { source: 'backend', target: 'spring' },
  { source: 'backend', target: 'mysql' },
  { source: 'backend', target: 'redis' },
  { source: 'java', target: 'spring' },
  { source: 'data', target: 'sql' },
  { source: 'data', target: 'python' },
  { source: 'data', target: 'pandas' },
  { source: 'python', target: 'pandas' },
  { source: 'ai', target: 'ml' },
  { source: 'ai', target: 'dl' },
  { source: 'ai', target: 'nlp' },
  { source: 'ml', target: 'dl' },
  { source: 'product', target: 'prd' },
  { source: 'product', target: 'axure' },
  { source: 'product', target: 'user_research' },
  { source: 'operation', target: 'growth' },
  { source: 'operation', target: 'content' },
];

export default function KnowledgeGraphPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(true);

  // 用 ref 保存运行时状态，避免 effect 重新触发导致节点重置
  const isSimulatingRef = useRef(isSimulating);
  const activeNodeRef = useRef<string | null>(null);
  const searchQueryRef = useRef('');

  useEffect(() => { isSimulatingRef.current = isSimulating; }, [isSimulating]);
  useEffect(() => { activeNodeRef.current = activeNode; }, [activeNode]);
  useEffect(() => { searchQueryRef.current = searchQuery; }, [searchQuery]);

  // 物理引擎：只在挂载时初始化一次，节点状态保存在闭包中
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = container.clientWidth || 600;
    let height = container.clientHeight || 500;
    canvas.width = width;
    canvas.height = height;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        width = entry.contentRect.width;
        height = entry.contentRect.height;
        canvas.width = width;
        canvas.height = height;
      }
    });
    resizeObserver.observe(container);

    // 初始化节点（只执行一次）
    const nodes = mockNodes.map(n => ({
      ...n,
      x: width / 2 + (Math.random() - 0.5) * 200,
      y: height / 2 + (Math.random() - 0.5) * 200,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      color: getColor(n.group),
    }));

    const links = mockLinks.map(l => ({
      source: nodes.find(n => n.id === l.source)!,
      target: nodes.find(n => n.id === l.target)!,
    })).filter(l => l.source && l.target);

    let animationId: number;
    let draggedNode: typeof nodes[0] | null = null;
    let hoveredNode: typeof nodes[0] | null = null;

    const tick = () => {
      if (isSimulatingRef.current) {
        // 斥力
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const dx = nodes[j].x - nodes[i].x;
            const dy = nodes[j].y - nodes[i].y;
            let d = Math.sqrt(dx * dx + dy * dy) || 0.01;
            if (d < 160) {
              const f = (160 - d) / d * 0.025;
              nodes[i].vx -= dx * f; nodes[i].vy -= dy * f;
              nodes[j].vx += dx * f; nodes[j].vy += dy * f;
            }
          }
        }
        // 弹簧
        links.forEach(({ source: s, target: t }) => {
          const dx = t.x - s.x, dy = t.y - s.y;
          const d = Math.sqrt(dx * dx + dy * dy) || 0.01;
          const f = (d - 110) * 0.006;
          s.vx += dx * f; s.vy += dy * f;
          t.vx -= dx * f; t.vy -= dy * f;
        });
        // 向心 + 积分 + 阻尼 + 边界
        nodes.forEach(n => {
          if (n === draggedNode) return;
          n.vx += (width / 2 - n.x) * 0.004;
          n.vy += (height / 2 - n.y) * 0.004;
          n.vx *= 0.88; n.vy *= 0.88;
          n.x += n.vx; n.y += n.vy;
          const p = n.val + 4;
          if (n.x < p) { n.x = p; n.vx = Math.abs(n.vx) * 0.5; }
          if (n.x > width - p) { n.x = width - p; n.vx = -Math.abs(n.vx) * 0.5; }
          if (n.y < p) { n.y = p; n.vy = Math.abs(n.vy) * 0.5; }
          if (n.y > height - p) { n.y = height - p; n.vy = -Math.abs(n.vy) * 0.5; }
        });
      }

      draw();
      animationId = requestAnimationFrame(tick);
    };

    const draw = () => {
      const activeId = activeNodeRef.current;
      const query = searchQueryRef.current.toLowerCase();

      ctx.clearRect(0, 0, width, height);

      // 连线
      links.forEach(({ source: s, target: t }) => {
        const hl = activeId && (s.id === activeId || t.id === activeId);
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(t.x, t.y);
        ctx.strokeStyle = hl ? 'rgba(59,130,246,0.75)' : 'rgba(203,213,225,0.45)';
        ctx.lineWidth = hl ? 2 : 1;
        ctx.stroke();
      });

      // 节点
      nodes.forEach(n => {
        const hl = !activeId || activeId === n.id;
        const searched = query && n.label.toLowerCase().includes(query);
        const isHovered = hoveredNode === n;
        const r = searched ? n.val * 1.6 : isHovered ? n.val * 1.25 : n.val;

        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fillStyle = hl ? n.color : 'rgba(200,210,220,0.25)';
        ctx.fill();
        ctx.strokeStyle = searched ? '#f59e0b' : isHovered ? '#fff' : 'rgba(255,255,255,0.6)';
        ctx.lineWidth = searched ? 3 : 2;
        ctx.stroke();

        if (hl && (n.val >= 18 || isHovered || searched)) {
          ctx.fillStyle = '#1e293b';
          ctx.font = `${searched || isHovered ? 'bold ' : ''}${Math.max(11, r * 0.7)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(n.label, n.x, n.y);
        }
      });
    };

    tick();

    // --- 事件 ---
    const pos = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const hitTest = (x: number, y: number) => {
      for (let i = nodes.length - 1; i >= 0; i--) {
        const n = nodes[i];
        if ((n.x - x) ** 2 + (n.y - y) ** 2 < (n.val * 1.4) ** 2) return n;
      }
      return null;
    };

    const onMouseDown = (e: MouseEvent) => {
      const { x, y } = pos(e);
      const n = hitTest(x, y);
      if (n) { draggedNode = n; n.vx = 0; n.vy = 0; setActiveNode(n.id); }
    };
    const onMouseMove = (e: MouseEvent) => {
      const { x, y } = pos(e);
      if (draggedNode) {
        draggedNode.x = x; draggedNode.y = y;
        canvas.style.cursor = 'grabbing';
      } else {
        hoveredNode = hitTest(x, y);
        canvas.style.cursor = hoveredNode ? 'grab' : 'default';
      }
    };
    const onMouseUp = () => { draggedNode = null; };
    const onClick = (e: MouseEvent) => {
      const { x, y } = pos(e);
      const n = hitTest(x, y);
      setActiveNode(n ? n.id : null);
    };

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('click', onClick);

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('click', onClick);
    };
  // 空依赖：节点只初始化一次，isSimulating/activeNode/searchQuery 通过 ref 读取
  }, []);

  function getColor(group: number) {
    const colors = [
      '#3b82f6', // blue
      '#ef4444', // red
      '#10b981', // green
      '#f59e0b', // amber
      '#8b5cf6', // orange
      '#ec4899', // purple
      '#06b6d4', // cyan
    ];
    return colors[group % colors.length];
  }

  return (
    <div className="container py-8 max-w-7xl">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">知识图谱与 RAG 检索层</h1>
            <p className="text-muted-foreground">
              将90道真实行业标准题库拆解为知识节点，结合 Supabase pgvector 向量检索，为 AI 答疑提供精准上下文。
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle>标准能力知识网络图谱</CardTitle>
                <CardDescription>
                  节点大小代表考察权重，连线代表知识点关联性（支持鼠标拖拽互动）
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant={isSimulating ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => setIsSimulating(!isSimulating)}
                  className="gap-2"
                >
                  {isSimulating ? <BrainCircuit className="h-4 w-4 animate-pulse" /> : <Network className="h-4 w-4" />}
                  {isSimulating ? '动态引擎运行中' : '物理引擎已暂停'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div ref={containerRef} className="relative w-full h-[500px] border rounded-lg bg-slate-50 overflow-hidden shadow-inner">
                <canvas 
                  ref={canvasRef} 
                  className="absolute inset-0 w-full h-full"
                />
                <div className="absolute top-4 left-4 right-4 flex gap-2 pointer-events-none">
                  <div className="relative flex-1 max-w-sm pointer-events-auto">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="检索知识点 (如: React, SQL)..."
                      className="pl-8 bg-white/90 backdrop-blur shadow-sm border-primary/20 focus-visible:ring-primary"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="absolute bottom-4 left-4 flex gap-2 flex-wrap max-w-sm pointer-events-none">
                  <Badge variant="secondary" className="bg-white/80 shadow-sm">前端</Badge>
                  <Badge variant="secondary" className="bg-white/80 shadow-sm">后端</Badge>
                  <Badge variant="secondary" className="bg-white/80 shadow-sm">数据</Badge>
                  <Badge variant="secondary" className="bg-white/80 shadow-sm">AI</Badge>
                  <Badge variant="secondary" className="bg-white/80 shadow-sm">产品</Badge>
                  <Badge variant="secondary" className="bg-white/80 shadow-sm">运营</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">RAG 检索增强链路</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-2 rounded-full shrink-0">
                    <Database className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">1. 知识向量化</h4>
                    <p className="text-xs text-muted-foreground mt-1">90道题库与知识点通过 embedding 转化为高维向量，存入 pgvector。</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-success/10 p-2 rounded-full shrink-0">
                    <Search className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">2. 语义相似度检索</h4>
                    <p className="text-xs text-muted-foreground mt-1">捕捉用户提问的语义，计算余弦相似度，召回 Top-K 相关标准节点。</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-warning/10 p-2 rounded-full shrink-0">
                    <BrainCircuit className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">3. 知识上下文注入</h4>
                    <p className="text-xs text-muted-foreground mt-1">将召回的行业标准知识点作为 Context 注入 LLM Prompt 进行精准生成。</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={activeNode ? 'border-primary shadow-md transition-all' : 'transition-all'}>
              <CardHeader>
                <CardTitle className="text-lg">节点交互详情</CardTitle>
              </CardHeader>
              <CardContent>
                {activeNode && activeNode !== 'root' ? (
                  <div className="space-y-3 animate-in fade-in zoom-in duration-300">
                    <div>
                      <h4 className="font-bold text-lg text-primary">{mockNodes.find(n => n.id === activeNode)?.label}</h4>
                      <Badge className="mt-1 text-white" style={{ backgroundColor: getColor(mockNodes.find(n => n.id === activeNode)?.group || 0) }}>
                        能力模块标记
                      </Badge>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-md border text-sm text-slate-700">
                      该知识点包含在 <strong>3</strong> 道行业标准评估题中，属于核心考察技能。通过 RAG 链路，该节点已被向量化并激活。
                    </div>
                    <div className="pt-2">
                      <Button size="sm" className="w-full" onClick={() => {}}>查看关联评测题</Button>
                    </div>
                  </div>
                ) : (
                  <div className="h-[120px] flex flex-col items-center justify-center text-sm text-muted-foreground border-2 border-dashed rounded-lg bg-slate-50">
                    <Network className="h-8 w-8 text-slate-300 mb-2" />
                    <span>在左侧图谱中点击或拖拽节点</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
