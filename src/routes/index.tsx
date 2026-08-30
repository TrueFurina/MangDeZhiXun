import { createBrowserRouter, Navigate } from 'react-router-dom';
import RootLayout from '@/components/layouts/RootLayout';
import { portalRoutes } from './portal';
import { studentRoutes } from './student';
import { companyRoutes } from './company';
import { universityRoutes } from './university';
import { adminRoutes } from './admin';

// 路由配置：按角色分模块管理，降低单文件复杂度
export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      ...portalRoutes,
      ...studentRoutes,
      ...companyRoutes,
      ...universityRoutes,
      ...adminRoutes,
      // 404页面
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);