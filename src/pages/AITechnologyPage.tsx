import React from 'react';
import { Network, Database, BrainCircuit, Bot, Search, Layout, Settings, FileText, Code2, Users, LineChart, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function AITechnologyPage() {
  return (
    <div className="container py-12 max-w-6xl">
      <div className="text-center mb-12 space-y-4">
        <Badge variant="outline" className="px-4 py-1 text-sm bg-primary/5 text-primary border-primary/20">
          核心技术揭秘
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">四端协同Agent架构与RAG引擎</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          不是简单的大模型问答，而是基于行业标准、多智能体协同、知识图谱的深度学习评估系统。
        </p>
      </div>

      {/* 5-Layer Architecture */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Layers className="h-6 w-6 text-primary" />
          系统五层架构蓝图
        </h2>
        <Card className="border-2 shadow-sm overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Architecture Layers */}
            <div className="flex-1 p-0">
              <div className="grid grid-cols-1 divide-y">
                {/* User Layer */}
                <div className="p-6 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col md:flex-row gap-4 items-start md:items-center">
                  <div className="w-40 shrink-0 font-semibold text-primary flex items-center gap-2">
                    <Layout className="h-5 w-5" /> 用户交互层
                  </div>
                  <div className="flex-1 flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-white">学员端 (能力提升)</Badge>
                    <Badge variant="outline" className="bg-white">企业端 (行业标准中心)</Badge>
                    <Badge variant="outline" className="bg-white">院校端 (追踪看板)</Badge>
                    <Badge variant="outline" className="bg-white">系统管理后台</Badge>
                  </div>
                </div>

                {/* Agent Layer */}
                <div className="p-6 bg-blue-50/30 hover:bg-blue-50/50 transition-colors flex flex-col md:flex-row gap-4 items-start md:items-center">
                  <div className="w-40 shrink-0 font-semibold text-blue-600 flex items-center gap-2">
                    <Bot className="h-5 w-5" /> Agent协同层
                  </div>
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="border bg-white rounded p-3 text-sm shadow-sm">
                      <span className="font-semibold text-blue-700 block mb-1">标准生成 Agent</span>
                      将企业需求自动转化为学习目标
                    </div>
                    <div className="border bg-white rounded p-3 text-sm shadow-sm">
                      <span className="font-semibold text-blue-700 block mb-1">档案解析 Agent</span>
                      深度解析学员学习档案与能力画像
                    </div>
                    <div className="border bg-white rounded p-3 text-sm shadow-sm">
                      <span className="font-semibold text-blue-700 block mb-1">自适应测评 Agent</span>
                      基于知识库动态生成评测题并批改
                    </div>
                    <div className="border bg-white rounded p-3 text-sm shadow-sm">
                      <span className="font-semibold text-blue-700 block mb-1">流式答疑 Agent</span>
                      提供多轮记忆、带打字机效果的互动实训
                    </div>
                  </div>
                </div>

                {/* Knowledge Layer */}
                <div className="p-6 bg-purple-50/30 hover:bg-purple-50/50 transition-colors flex flex-col md:flex-row gap-4 items-start md:items-center">
                  <div className="w-40 shrink-0 font-semibold text-purple-600 flex items-center gap-2">
                    <Network className="h-5 w-5" /> 知识增强层
                  </div>
                  <div className="flex-1 flex flex-wrap gap-3">
                    <Link to="/knowledge-graph" className="flex-1 min-w-[200px]">
                      <div className="border bg-white rounded p-3 text-sm shadow-sm hover:border-purple-300 transition-colors cursor-pointer group">
                        <span className="font-semibold text-purple-700 flex items-center justify-between mb-1">
                          RAG 知识图谱 <Sparkles className="h-3 w-3 text-purple-400 group-hover:text-purple-600" />
                        </span>
                        90道题行业标准节点 + 向量检索增强
                      </div>
                    </Link>
                  </div>
                </div>

                {/* Tool Layer */}
                <div className="p-6 bg-amber-50/30 hover:bg-amber-50/50 transition-colors flex flex-col md:flex-row gap-4 items-start md:items-center">
                  <div className="w-40 shrink-0 font-semibold text-amber-600 flex items-center gap-2">
                    <Code2 className="h-5 w-5" /> 工具调用层
                  </div>
                  <div className="flex-1 flex flex-wrap gap-2">
                    <Badge variant="secondary" className="bg-white">文心大模型 (ERNIE)</Badge>
                    <Badge variant="secondary" className="bg-white">Edge Function 边缘计算</Badge>
                    <Badge variant="secondary" className="bg-white">Supabase 后端</Badge>
                    <Badge variant="secondary" className="bg-white">SSE 流式传输接口</Badge>
                  </div>
                </div>

                {/* Storage Layer */}
                <div className="p-6 bg-slate-50 hover:bg-slate-100 transition-colors flex flex-col md:flex-row gap-4 items-start md:items-center">
                  <div className="w-40 shrink-0 font-semibold text-slate-600 flex items-center gap-2">
                    <Database className="h-5 w-5" /> 数据存储层
                  </div>
                  <div className="flex-1 flex flex-wrap gap-2">
                    <span className="text-sm px-3 py-1 bg-white border rounded text-slate-600">用户数据</span>
                    <span className="text-sm px-3 py-1 bg-white border rounded text-slate-600">行业标准题库</span>
                    <span className="text-sm px-3 py-1 bg-white border rounded text-slate-600">会话记忆 (History)</span>
                    <span className="text-sm px-3 py-1 bg-white border rounded text-slate-600">pgvector 向量库</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Detail Sections */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <Card className="border-t-4 border-t-primary">
          <CardHeader>
            <BrainCircuit className="h-8 w-8 text-primary mb-2" />
            <CardTitle>多智能体协同 (Multi-Agent)</CardTitle>
            <CardDescription>各司其职，打破单一大模型的能力瓶颈</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              系统内置4个具备独立角色的Agent。比如，<strong>标准生成Agent</strong>负责处理企业的生肉需求；<strong>测评Agent</strong>则根据学员雷达图缺陷，动态组织考题。Agent之间通过结构化上下文传递数据，完成复杂的教育评估闭环。
            </p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-purple-500">
          <CardHeader>
            <Network className="h-8 w-8 text-purple-500 mb-2" />
            <CardTitle>RAG知识检索增强</CardTitle>
            <CardDescription>让AI回答拥有真实行业数据支撑</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              为了避免大模型“幻觉”，我们构建了包含90道企业真实用人标准的知识库，使用 <strong>Supabase pgvector</strong> 进行向量化存储。AI 答疑时会先进行语义召回，将行业标准作为 Context 注入 Prompt。
            </p>
            <Button variant="outline" className="w-full text-purple-600 border-purple-200 hover:bg-purple-50" asChild>
              <Link to="/knowledge-graph">查看知识图谱演示</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-success">
          <CardHeader>
            <Sparkles className="h-8 w-8 text-success mb-2" />
            <CardTitle>流式输出与多轮记忆</CardTitle>
            <CardDescription>媲美真人对话的丝滑交互体验</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              引入 <strong>SSE (Server-Sent Events)</strong> 流式接口，实现打字机效果，彻底消除模型生成等待焦虑。同时引入 <strong>conversation_history</strong> 会话管理，Agent 能记住你错过的知识点并持续跟进。
            </p>
            <Button variant="outline" className="w-full text-success border-success/30 hover:bg-success/10" asChild>
              <Link to="/student/ai-interview">体验流式互动答疑</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-amber-500">
          <CardHeader>
            <LineChart className="h-8 w-8 text-amber-500 mb-2" />
            <CardTitle>学习效果外部验证体系</CardTitle>
            <CardDescription>能力不仅被诊断，更被真实生态验证</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              不是传统做题平台，我们将 <strong>行业真实用人标准</strong> 转化为学习评估题。学生端测得能力，企业端反馈真实达标率，院校端宏观追踪。三方数据互通，形成闭环数据飞轮。
            </p>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}

function Layers(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}
