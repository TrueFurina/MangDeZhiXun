import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

export default function Breadcrumb() {
  const location = useLocation();
  const navigate = useNavigate();

  // 路径映射
  const pathMap: Record<string, string> = {
    '/student': '首页',
    '/student/home': '首页',
    '/student/evaluation': '测评中心',
    '/student/evaluation/test': '开始测评',
    '/student/evaluation/report': '测评报告',
    '/student/growth': '成长中心',
    '/student/jobs': '标准推荐',
    '/student/profile': '个人中心',
    '/company': '企业首页',
    '/company/dashboard': '数据看板',
    '/company/positions': '标准管理',
    '/company/modeling': '胜任力建模',
    '/company/resumes': '档案管理',
    '/company/evaluation': '测评管理',
    '/company/subscription': '订阅套餐',
    '/university': '院校首页',
    '/university/dashboard': '能力发展数据看板',
    '/university/students': '学员管理',
    '/university/cooperation': '校企合作',
    '/admin': '管理后台',
    '/admin/dashboard': '数据统计',
    '/admin/users': '用户管理',
    '/admin/content': '内容管理',
  };

  // 生成面包屑路径
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const paths = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    let currentPath = '';
    paths.forEach((path, index) => {
      currentPath += `/${path}`;
      const label = pathMap[currentPath] || path;
      
      // 最后一项不需要链接
      if (index === paths.length - 1) {
        breadcrumbs.push({ label });
      } else {
        breadcrumbs.push({ label, path: currentPath });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // 如果只有一级路径，不显示面包屑
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-1 hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
        <span>返回</span>
      </button>
      <ChevronRight className="h-4 w-4" />
      {breadcrumbs.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          {item.path ? (
            <>
              <Link
                to={item.path}
                className="hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
              {index < breadcrumbs.length - 1 && (
                <ChevronRight className="h-4 w-4" />
              )}
            </>
          ) : (
            <span className="font-medium text-foreground">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
