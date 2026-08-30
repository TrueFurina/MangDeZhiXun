import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GlobalAiSearch } from '@/components/GlobalAiSearch';
import {
  Brain,
  Home,
  FileText,
  TrendingUp,
  Briefcase,
  User,
  LogOut,
  Bell,
  Search,
  Crown,
  ArrowLeftRight,
  Building2,
  Sparkles,
  Swords,
  BarChart3,
  BarChart2,
  Compass,
  Target,
  CreditCard,
  Receipt,
  MapPin,
  Database,
  Calendar,
  Flame,
  GitCompare,
  Menu,
  BookOpen,
  Globe,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { checkVipStatus } from '@/db/api';

export default function StudentLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const vipStatus = checkVipStatus(user);

  // 分组导航：避免长列表超出屏幕（每组可滚动收纳）
  const menuGroups: { title: string; items: { icon: any; label: string; path: string }[] }[] = [
    {
      title: '核心功能',
      items: [
        { icon: Home,      label: '首页',           path: '/student/home' },
        { icon: Target,    label: '实训任务',        path: '/student/training-tasks' },
        { icon: Swords,    label: 'AI深度特训',      path: '/student/ai-interview' },
        { icon: BarChart2, label: '我的数据',        path: '/student/my-data' },
      ],
    },
    {
      title: '测评与成长',
      items: [
        { icon: FileText,  label: '综合测评中心',    path: '/student/evaluation' },
        { icon: TrendingUp,label: '学习路径规划',    path: '/student/growth' },
        { icon: Target,    label: '能力匹配分析',    path: '/student/ability-match' },
        { icon: TrendingUp,label: '能力成长树',      path: '/student/ability-tree' },
        { icon: Calendar,  label: '智能学习计划',    path: '/student/learning-plan' },
        { icon: Flame,     label: '学习打卡',        path: '/student/study-checkin' },
      ],
    },
    {
      title: '求职准备',
      items: [
        { icon: FileText,  label: '智能简历助手',    path: '/student/resume-assistant' },
        { icon: GitCompare,label: '简历版本管理',    path: '/student/resume-versions' },
        { icon: Building2, label: '目标企业情报局',  path: '/student/enterprise-insight' },
        { icon: BarChart3, label: '多企业对比分析',  path: '/student/company-compare' },
        { icon: Briefcase, label: '能力对标验证',    path: '/student/jobs' },
        { icon: Calendar,  label: '求职进度看板',    path: '/student/job-tracker' },
        { icon: TrendingUp,label: '薪资谈判助手',    path: '/student/salary-negotiator' },
      ],
    },
    {
      title: 'AI研究工具',
      items: [
        { icon: BookOpen,  label: '深度研究中心',    path: '/student/deep-research' },
        { icon: Globe,     label: '网页内容总结',    path: '/student/web-summary' },
        { icon: Sparkles,  label: 'AI就业咨询',      path: '/student/career-consulting' },
        { icon: Compass,   label: 'AI职业规划师',    path: '/student/career-planner' },
        { icon: MapPin,    label: '行业人才地图',    path: '/talent-map' },
        { icon: Database,  label: '行业基准库',      path: '/benchmark-library' },
      ],
    },
    {
      title: '账户',
      items: [
        { icon: CreditCard, label: '会员中心',        path: '/membership?role=student' },
        { icon: Receipt,    label: '我的订单',        path: '/membership/orders' },
      ],
    },
  ];

  const handleLogout = () => {
    logout();
    toast.success('退出登录成功');
    navigate('/student/login');
  };

  return (
    <div className="flex h-screen w-full flex-col">
      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
        <div className="flex items-center gap-3">
          {/* 移动端汉堡菜单 */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 bg-sidebar flex flex-col">
              <SheetHeader className="px-4 py-4 border-b">
                <SheetTitle className="flex items-center gap-2 text-left text-base">
                  <Brain className="h-5 w-5 text-primary" />
                  AI能力评估学习平台
                </SheetTitle>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto min-h-0 px-3 pb-4">
                {menuGroups.map((group) => (
                  <div key={group.title} className="mb-2">
                    <p className="px-3 pt-3 pb-1 text-xs font-medium text-muted-foreground">{group.title}</p>
                    <nav className="space-y-1">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                          <Button
                            key={item.path}
                            variant={isActive ? 'default' : 'ghost'}
                            className="w-full justify-start"
                            onClick={() => { navigate(item.path); setMobileOpen(false); }}
                          >
                            <Icon className="mr-3 h-5 w-5 shrink-0" />
                            <span className="truncate">{item.label}</span>
                          </Button>
                        );
                      })}
                    </nav>
                  </div>
                ))}
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <div className="flex items-center gap-2">
            <div
              className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate('/student/home')}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg overflow-hidden">
                <img
                  src="https://miaoda-conversation-file.cdn.bcebos.com/user-6m37scl45nuo/conv-a7lm1eejtyps/20260402/file-ao6wt1jg4um8.jpg@w_1659"
                  alt="芒小橘"
                  className="h-full w-full object-cover"
                />
              </div>
            <div className="hidden md:block">
              <h1 className="text-lg font-bold">AI能力评估学习平台</h1>
              <p className="text-xs text-muted-foreground">用户端（学员端）</p>
            </div>
            </div>
          </div>

          {/* 返回门户 */}
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0 text-muted-foreground"
            onClick={() => navigate('/')}
          >
            <ArrowLeftRight className="mr-1 h-4 w-4" /> 门户
          </Button>
        </div>

        {/* 搜索框 (原有静态搜索已替换为 AI 搜索按钮) */}
        <div className="flex items-center space-x-4">
          <GlobalAiSearch />

          {/* 通知 */}
          <Button variant="ghost" size="icon" className="relative" onClick={() => {}}>
            <Bell className="h-5 w-5" />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive" />
          </Button>

          {/* 用户菜单 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar>
                  <AvatarImage src={user?.avatar_url || ''} alt="用户头像" />
                  <AvatarFallback className="bg-primary text-white">
                    {user?.nickname?.substring(0, 2) || '用户'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium">{user?.nickname || '用户'}</p>
                    {vipStatus.isPremium && (
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-xs">
                        <Crown className="mr-1 h-3 w-3" />
                        高级
                      </Badge>
                    )}
                    {vipStatus.isEnterprise && (
                      <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-xs">
                        <Crown className="mr-1 h-3 w-3" />
                        企业
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {user?.email || ''}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/student/profile')}>
                <User className="mr-2 h-4 w-4" />
                个人中心
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/student/vip')}>
                <Crown className="mr-2 h-4 w-4" />
                会员中心
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/')}>
                <ArrowLeftRight className="mr-2 h-4 w-4" />
                切换角色
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                退出登录
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* 左侧侧边栏 */}
        <aside className="hidden w-64 shrink-0 border-r bg-muted/10 lg:flex flex-col">
          <nav className="flex-1 overflow-y-auto min-h-0 p-3 space-y-2" style={{ scrollbarWidth: 'thin' }}>
            {menuGroups.map((group) => (
              <div key={group.title}>
                <p className="px-3 pt-2 pb-1 text-xs font-medium text-muted-foreground">{group.title}</p>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <Button
                        key={item.path}
                        variant={isActive ? 'default' : 'ghost'}
                        className="w-full justify-start"
                        onClick={() => navigate(item.path)}
                      >
                        <Icon className="mr-3 h-5 w-5 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        {/* 主内容区 */}
        <main className="flex-1 overflow-y-auto bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
