import { lazy, Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';
import { PageLoader } from './shared';

const PortalPage = lazy(() => import('@/pages/PortalPage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const AITechnologyPage = lazy(() => import('@/pages/AITechnologyPage'));
const KnowledgeGraphPage = lazy(() => import('@/pages/KnowledgeGraphPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const MembershipCenter = lazy(() => import('@/pages/membership/MembershipCenterPage'));
const OrderDetail = lazy(() => import('@/pages/membership/OrderDetailPage'));
const MyOrders = lazy(() => import('@/pages/membership/MyOrdersPage'));
const TalentMap = lazy(() => import('@/pages/shared/TalentMapPage'));
const BenchmarkLibrary = lazy(() => import('@/pages/shared/BenchmarkLibraryPage'));
const AnnualReport = lazy(() => import('@/pages/shared/AnnualReportPage'));

// 门户页面路由（无需登录）
export const portalRoutes: RouteObject[] = [
  {
    index: true,
    element: (
      <Suspense fallback={<PageLoader />}>
        <PortalPage />
      </Suspense>
    ),
  },
  {
    path: 'about',
    element: (
      <Suspense fallback={<PageLoader />}>
        <AboutPage />
      </Suspense>
    ),
  },
  {
    path: 'ai-technology',
    element: (
      <Suspense fallback={<PageLoader />}>
        <AITechnologyPage />
      </Suspense>
    ),
  },
  {
    path: 'knowledge-graph',
    element: (
      <Suspense fallback={<PageLoader />}>
        <KnowledgeGraphPage />
      </Suspense>
    ),
  },
  {
    path: 'login',
    element: (
      <Suspense fallback={<PageLoader />}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    path: 'membership',
    element: (
      <Suspense fallback={<PageLoader />}>
        <MembershipCenter />
      </Suspense>
    ),
  },
  {
    path: 'membership/order/:orderNo',
    element: (
      <Suspense fallback={<PageLoader />}>
        <OrderDetail />
      </Suspense>
    ),
  },
  {
    path: 'membership/orders',
    element: (
      <Suspense fallback={<PageLoader />}>
        <MyOrders />
      </Suspense>
    ),
  },
  {
    path: 'talent-map',
    element: (
      <Suspense fallback={<PageLoader />}>
        <TalentMap />
      </Suspense>
    ),
  },
  {
    path: 'benchmark-library',
    element: (
      <Suspense fallback={<PageLoader />}>
        <BenchmarkLibrary />
      </Suspense>
    ),
  },
  {
    path: 'annual-report',
    element: (
      <Suspense fallback={<PageLoader />}>
        <AnnualReport />
      </Suspense>
    ),
  },
];