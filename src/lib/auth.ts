// 用户角色与登录后跳转路径的统一映射

export type UserRole = 'student' | 'company_hr' | 'university_staff' | 'admin';

// 根据角色返回对应端的首页路径；未传入时从 localStorage 读取当前角色
export function getRoleHomePath(role?: string | null): string {
  const r = role || localStorage.getItem('user_role') || 'student';
  switch (r) {
    case 'company_hr':
      return '/company/dashboard';
    case 'university_staff':
      return '/university/dashboard';
    case 'admin':
      return '/admin/dashboard';
    case 'student':
    default:
      return '/student/home';
  }
}