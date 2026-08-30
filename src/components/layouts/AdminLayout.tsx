import { lazy, Suspense } from 'react';
import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Users,
  Shield,
  FileText,
  BookOpen,
  HelpCircle,
  Settings,
  FileBarChart,
  BarChart3,
  Menu,
  X,
  LogOut,
  ArrowLeftRight,
  ClipboardList,
  ShoppingCart,
  CreditCard,
  MapPin,
  Database,
  Activity,
  Globe,
  Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { GlobalAiSearch } from '@/components/GlobalAiSearch';

const menuItems = [
  {
    title: '数据看板',
    icon: LayoutDashboard,
    path: '/admin/dashboard',
  },
  {
    title: '用户管理',
    icon: Users,
    path: '/admin/users',
  },
  {
    title: '订单管理',
    icon: ShoppingCart,
    path: '/admin/orders',
  },
  {
    title: '支付订单',
    icon: CreditCard,
    path: '/admin/payment-orders',
  },
  {
    title: '行业人才地图',
    icon: MapPin,
    path: '/admin/talent-map',
  },
  {
    title: '行业基准库',
    icon: Database,
    path: '/admin/benchmark-library',
  },
  {
    title: '年度报告',
    icon: FileText,
    path: '/admin/annual-report',
  },
  {
    title: '角色权限',
    icon: Shield,
    path: '/admin/roles',
  },
  {
    title: '行业标准模型',
    icon: FileText,
    path: '/admin/competency-models',
  },
  {
    title: '学习资源',
    icon: BookOpen,
    path: '/admin/learning-resources',
  },
  {
    title: '测评题库',
    icon: HelpCircle,
    path: '/admin/question-bank',
  },
  {
    title: '学员测评数据',
    icon: ClipboardList,
    path: '/admin/student-evaluations',
  },
  {
    title: '运营分析',
    icon: BarChart3,
    path: '/admin/analytics',
  },
  {
    title: '系统配置',
    icon: Settings,
    path: '/admin/config',
  },
  {
    title: '操作日志',
    icon: FileBarChart,
    path: '/admin/logs',
  },
  {
    title: '内容质量管理',
    icon: Shield,
    path: '/admin/content-quality',
  },
  {
    title: '技能评估记录',
    icon: ClipboardList,
    path: '/admin/skill-eval',
  },
  {
    title: '深度研究中心',
    icon: BookOpen,
    path: '/admin/deep-research',
  },
  {
    title: '网页内容总结',
    icon: Globe,
    path: '/admin/web-summary',
  },
  {
    title: '行业标准中心',
    icon: Building2,
    path: '/admin/hiring-data',
  },
  {
    title: '监控看板',
    icon: Activity,
    path: '/admin/monitoring',
  },
];

const ContentQualityManage = lazy(() => import('@/pages/admin/ContentQualityManagePage'));
const SkillEvalRecords = lazy(() => import('@/pages/admin/SkillEvalRecordsPage'));

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = () => {
    navigate('/admin/login');
  };

  return (
    <div className="flex h-screen w-full bg-background">
      {/* 侧边栏 */}
      <aside
        className={cn(
          'flex h-full flex-col border-r bg-card transition-all duration-300',
          isSidebarOpen ? 'w-64' : 'w-0 overflow-hidden'
        )}
      >
        {/* Logo区域 - 点击返回首页 */}
        <div className="flex items-center justify-between border-b">
          <div
            className="flex h-16 items-center px-6 cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => navigate('/admin/dashboard')}
          >
            <h1 className="text-xl font-bold text-primary">系统管理后台</h1>
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

        {/* 菜单列表 */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Button
                key={item.path}
                variant={isActive ? 'default' : 'ghost'}
                className={cn(
                  'w-full justify-start',
                  isActive && 'bg-primary text-primary-foreground'
                )}
                onClick={() => navigate(item.path)}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.title}
              </Button>
            );
          })}
        </nav>

        {/* 底部操作按钮 */}
        <div className="border-t p-4 space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => navigate('/')}
          >
            <ArrowLeftRight className="mr-3 h-5 w-5" />
            切换角色
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut className="mr-3 h-5 w-5" />
            退出登录
          </Button>
        </div>
      </aside>

      {/* 主内容区 */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* 顶部导航栏 */}
        <header className="flex h-16 items-center justify-between border-b bg-card px-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>

          <div className="flex items-center space-x-4">
            <GlobalAiSearch />
            <span className="text-sm text-muted-foreground">管理员</span>
            <div className="h-8 w-8 rounded-full bg-primary text-center leading-8 text-white">
              A
            </div>
          </div>
        </header>

        {/* 页面内容 */}
        <main className="flex-1 overflow-y-auto bg-background p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
