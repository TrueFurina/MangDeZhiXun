import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Building2,
  LayoutDashboard,
  Briefcase,
  Sparkles,
  FileText,
  ClipboardList,
  CreditCard,
  Bell,
  LogOut,
  Settings,
  ArrowLeftRight,
  TrendingUp,
  Users,
  BarChart2,
  Crown,
  MapPin,
  Database,
  Menu,
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { useState } from 'react';

export default function CompanyLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

    const menuItems = [
    { icon: LayoutDashboard, label: '数据看板', path: '/company/dashboard' },
    { icon: Sparkles, label: '专属胜任力模型', path: '/company/enterprise-models' },
    { icon: FileText, label: '评估账号分发', path: '/company/candidate-accounts' },
    { icon: ClipboardList, label: '候选人评估结果', path: '/company/candidates/results' },
    { icon: Briefcase, label: '画像与面试表现', path: '/company/candidates/portrait' },
    { icon: Users, label: '候选人人才池', path: '/company/candidate-pool' },
    { icon: BarChart2, label: '人才洞察', path: '/company/talent-insight' },
    { icon: TrendingUp, label: '行业标准参考', path: '/company/positions' },
    { icon: CreditCard, label: '服务订阅', path: '/company/subscription' },
    { icon: Crown, label: '会员中心', path: '/membership?role=company' },
    { icon: MapPin, label: '行业人才地图', path: '/talent-map' },
    { icon: Database, label: '行业基准库', path: '/benchmark-library' },
    { icon: ClipboardList, label: '面试设计', path: '/company/interview-designer' },
  ];

  const isActive = (path: string) => location.pathname.startsWith(path);

  const handleLogout = () => {
    navigate('/company/login');
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* 左侧侧边栏 */}
      <aside className="hidden w-64 shrink-0 border-r bg-card lg:block">
        <div className="flex h-full flex-col">
          {/* Logo - 点击返回首页 */}
          <div className="flex items-center justify-between border-b">
            <div
              className="flex h-16 items-center px-6 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => navigate('/company/dashboard')}
            >
              <div className="flex items-center space-x-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="font-bold">行业标准中心</div>
                  <div className="text-xs text-muted-foreground">企业标准配置台</div>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mr-4 shrink-0 text-muted-foreground"
              onClick={() => navigate('/')}
            >
              <ArrowLeftRight className="mr-1 h-4 w-4" /> 门户
            </Button>
          </div>

          {/* 导航菜单 */}
          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Button
                  key={item.path}
                  variant={active ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => navigate(item.path)}
                >
                  <Icon className="mr-3 h-4 w-4" />
                  {item.label}
                </Button>
              );
            })}
          </nav>

          {/* 底部用户信息 */}
          <div className="border-t p-4">
            <div className="flex items-center space-x-3 rounded-lg bg-muted p-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-success text-white">企</AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <div className="truncate font-semibold">阿里巴巴集团</div>
                <div className="truncate text-xs text-muted-foreground">基础版会员</div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* 右侧主内容区 */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* 顶部导航栏 */}
        <header className="flex h-16 items-center justify-between border-b bg-card px-6">
          <div className="flex items-center space-x-4">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0 bg-card">
                <SheetTitle className="sr-only">导航菜单</SheetTitle>
                <div className="flex h-16 items-center border-b px-6">
                  <div className="flex items-center space-x-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                      <Building2 className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                      <div className="font-bold">企业管理平台</div>
                      <div className="text-xs text-muted-foreground">企业协同平台</div>
                    </div>
                  </div>
                </div>
                <nav className="space-y-1 overflow-y-auto p-4">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    return (
                      <Button
                        key={item.path}
                        variant={active ? 'default' : 'ghost'}
                        className="w-full justify-start min-h-12"
                        onClick={() => { navigate(item.path); setMobileOpen(false); }}
                      >
                        <Icon className="mr-3 h-4 w-4" />
                        {item.label}
                      </Button>
                    );
                  })}
                </nav>
              </SheetContent>
            </Sheet>
            <h2 className="text-lg font-semibold">企业管理平台</h2>
          </div>

          <div className="flex items-center space-x-4">
            {/* 通知 */}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => navigate('/company/notifications')}
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive" />
            </Button>

            {/* 用户菜单 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-success text-white">企</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">阿里巴巴集团</p>
                    <p className="text-xs text-muted-foreground">hr@alibaba.com</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/company/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  账号设置
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/')}>
                  <ArrowLeftRight className="mr-2 h-4 w-4" />
                  切换角色
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  退出登录
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* 主内容区域 */}
        <main className="flex-1 overflow-y-auto bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
