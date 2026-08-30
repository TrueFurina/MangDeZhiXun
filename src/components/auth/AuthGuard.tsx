import { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

// 角色类型
export type UserRole = 'student' | 'company_hr' | 'university_staff' | 'admin';

// 各角色对应的登录页路径
const LOGIN_PATHS: Record<UserRole, string> = {
  student: '/student/login',
  company_hr: '/company/login',
  university_staff: '/university/login',
  admin: '/admin/login',
};

// 各角色对应的首页路径（角色不匹配时跳转）
const HOME_PATHS: Record<UserRole, string> = {
  student: '/student/home',
  company_hr: '/company/dashboard',
  university_staff: '/university/dashboard',
  admin: '/admin/dashboard',
};

const VALID_ROLES: UserRole[] = ['student', 'company_hr', 'university_staff', 'admin'];

interface AuthGuardProps {
  children: ReactNode;
  role: UserRole;
}

/**
 * 统一登录态校验守卫
 * 1. 未登录 → 跳转到对应角色的登录页
 * 2. 已登录但角色不匹配 → 跳转到用户自身角色的首页
 */
export function AuthGuard({ children, role }: AuthGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={LOGIN_PATHS[role]} replace state={{ from: location.pathname }} />;
  }

  // 角色匹配校验：优先使用内存中的 user_role，缺失时回退到 localStorage，确保企业用户不会误入学员页面
  const storedRole = localStorage.getItem('user_role') as UserRole | null;
  const userRole = (user?.user_role || storedRole || 'student') as UserRole;
  const normalizedRole: UserRole = VALID_ROLES.includes(userRole) ? userRole : 'student';

  if (normalizedRole !== role) {
    return <Navigate to={HOME_PATHS[normalizedRole]} replace />;
  }

  return <>{children}</>;
}