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
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { GlobalAiSearch } from '@/components/GlobalAiSearch';
import { ArrowLeftRight, Bell, Building2, GraduationCap, LayoutDashboard, LogOut, Settings, ShieldCheck, Users, BookOpen, Globe, Radar, BarChart2, Crown, MapPin, Database, FileText, Menu } from 'lucide-react';
import { useState } from 'react';

export default function UniversityLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: '能力发展数据看板', path: '/university/dashboard' },
    { icon: Users, label: '学员能力追踪', path: '/university/students' },
    { icon: Building2, label: '企业标准合作', path: '/university/cooperation' },
    { icon: ArrowLeftRight, label: '班级模拟考核设置', path: '/university/assessment-config' },
    { icon: LayoutDashboard, label: '班级考核成绩看板', path: '/university/assessment-report' },
    { icon: ShieldCheck, label: '教师辅用课程质检', path: '/university/course-quality' },
    { icon: Radar, label: '班级能力画像', path: '/university/class-portrait' },
    { icon: BarChart2, label: '就业质量看板', path: '/university/employment-quality' },
    { icon: Crown, label: '会员中心', path: '/membership?role=university' },
    { icon: MapPin, label: '行业人才地图', path: '/talent-map' },
    { icon: Database, label: '行业基准库', path: '/benchmark-library' },
    { icon: FileText, label: '年度报告', path: '/annual-report' },
    { icon: BookOpen, label: '深度研究中心', path: '/university/deep-research' },
    { icon: Globe, label: '网页内容总结', path: '/university/web-summary' },
    { icon: Building2, label: '人才需求分析', path: '/university/hiring-data' },
  ];

  const isActive = (path: string) => location.pathname.startsWith(path);

  const handleLogout = () => {
    navigate('/university/login');
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <aside className="hidden w-64 shrink-0 border-r bg-card lg:block">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b">
            <div
              className="flex h-16 items-center px-6 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => navigate('/university/dashboard')}
            >
              <div className="flex items-center space-x-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="font-bold">能力追踪看板</div>
                  <div className="text-xs text-muted-foreground">院校协同平台</div>
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

          <div className="border-t p-4">
            <div className="flex items-center space-x-3 rounded-lg bg-muted p-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-warning text-white">校</AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <div className="truncate font-semibold">清华大学</div>
                <div className="truncate text-xs text-muted-foreground">教务处</div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
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
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning">
                      <GraduationCap className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="font-bold">能力追踪看板</div>
                      <div className="text-xs text-muted-foreground">院校协同平台</div>
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
            <h2 className="text-lg font-semibold">教学管理平台</h2>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => navigate('/university/notifications')}
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-warning text-white">校</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">清华大学</p>
                    <p className="text-xs text-muted-foreground">employment@tsinghua.edu.cn</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/university/settings')}>
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

        <main className="flex-1 overflow-y-auto bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
