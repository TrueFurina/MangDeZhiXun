import { lazy, Suspense, type ComponentType } from 'react';
import type { RouteObject } from 'react-router-dom';
import { PageLoader } from './shared';
import { AuthGuard } from '@/components/auth/AuthGuard';

const AdminLayout = lazy(() => import('@/components/layouts/AdminLayout'));
const AdminLogin = lazy(() => import('@/pages/admin/LoginPage'));
const AdminDashboard = lazy(() => import('@/pages/admin/DashboardPage'));
const UserManage = lazy(() => import('@/pages/admin/UserManagePage'));
const OrderManage = lazy(() => import('@/pages/admin/OrderManagePage'));
const RoleManage = lazy(() => import('@/pages/admin/RoleManagePage'));
const CompetencyModels = lazy(() => import('@/pages/admin/CompetencyModelsPage'));
const LearningResources = lazy(() => import('@/pages/admin/LearningResourcesPage'));
const QuestionBank = lazy(() => import('@/pages/admin/QuestionBankPage'));
const Analytics = lazy(() => import('@/pages/admin/AnalyticsPage'));
const SystemConfig = lazy(() => import('@/pages/admin/SystemConfigPage'));
const OperationLogs = lazy(() => import('@/pages/admin/OperationLogsPage'));
const AIEvaluationDemo = lazy(() => import('@/pages/admin/AIEvaluationDemoPage'));
const StudentEvaluations = lazy(() => import('@/pages/admin/StudentEvaluationsPage'));
const ContentManage = lazy(() => import('@/pages/admin/ContentManagePage'));
const ContentQualityManage = lazy(() => import('@/pages/admin/ContentQualityManagePage'));
const SkillEvalRecords = lazy(() => import('@/pages/admin/SkillEvalRecordsPage'));
const MonitoringDashboard = lazy(() => import('@/pages/admin/MonitoringDashboardPage'));
const AdminDeepResearchCenter = lazy(() => import('@/pages/admin/DeepResearchCenterPage'));
const AdminDeepResearchCreate = lazy(() => import('@/pages/student/DeepResearchCreatePage'));
const AdminDeepResearchProgress = lazy(() => import('@/pages/student/DeepResearchProgressPage'));
const AdminDeepResearchReport = lazy(() => import('@/pages/student/DeepResearchReportPage'));
const WebSummaryList = lazy(() => import('@/pages/shared/WebSummaryListPage'));
const WebSummaryTask = lazy(() => import('@/pages/shared/WebSummaryTaskPage'));
const HiringData = lazy(() => import('@/pages/shared/HiringDataPage'));
const AdminPaymentOrders = lazy(() => import('@/pages/admin/AdminOrdersPage'));
const TalentMap = lazy(() => import('@/pages/shared/TalentMapPage'));
const BenchmarkLibrary = lazy(() => import('@/pages/shared/BenchmarkLibraryPage'));
const AnnualReport = lazy(() => import('@/pages/shared/AnnualReportPage'));

const S = (C: React.LazyExoticComponent<ComponentType>) => (
  <Suspense fallback={<PageLoader />}>
    <C />
  </Suspense>
);

// 管理后台路由（需登录守卫）
export const adminRoutes: RouteObject[] = [
  {
    path: 'admin',
    children: [
      {
        path: 'login',
        element: S(AdminLogin),
      },
      {
        path: '',
        element: (
          <AuthGuard role="admin">
            <Suspense fallback={<PageLoader />}>
              <AdminLayout />
            </Suspense>
          </AuthGuard>
        ),
        children: [
          { path: 'dashboard', element: S(AdminDashboard) },
          { path: 'users', element: S(UserManage) },
          { path: 'orders', element: S(OrderManage) },
          { path: 'payment-orders', element: S(AdminPaymentOrders) },
          { path: 'roles', element: S(RoleManage) },
          { path: 'competency-models', element: S(CompetencyModels) },
          { path: 'learning-resources', element: S(LearningResources) },
          { path: 'question-bank', element: S(QuestionBank) },
          { path: 'analytics', element: S(Analytics) },
          { path: 'config', element: S(SystemConfig) },
          { path: 'logs', element: S(OperationLogs) },
          { path: 'student-evaluations', element: S(StudentEvaluations) },
          { path: 'ai-evaluation-demo', element: S(AIEvaluationDemo) },
          { path: 'content', element: S(ContentManage) },
          { path: 'content-quality', element: S(ContentQualityManage) },
          { path: 'skill-eval', element: S(SkillEvalRecords) },
          { path: 'monitoring', element: S(MonitoringDashboard) },
          {
            path: 'deep-research',
            children: [
              { index: true, element: S(AdminDeepResearchCenter) },
              { path: 'create', element: S(AdminDeepResearchCreate) },
              { path: 'progress/:id', element: S(AdminDeepResearchProgress) },
              { path: 'report/:id', element: S(AdminDeepResearchReport) },
            ],
          },
          {
            path: 'web-summary',
            children: [
              { index: true, element: <Suspense fallback={<PageLoader />}><WebSummaryList basePath="/admin/web-summary" /></Suspense> },
              { path: ':taskId', element: <Suspense fallback={<PageLoader />}><WebSummaryTask basePath="/admin/web-summary" /></Suspense> },
            ],
          },
          {
            path: 'hiring-data',
            element: <Suspense fallback={<PageLoader />}><HiringData basePath="/admin/hiring-data" pageTitle="行业标准中心" pageDesc="查询目标企业招聘概况，作为行业能力标准建模与实训内容方向的数据参考" /></Suspense>,
          },
          { path: 'talent-map', element: S(TalentMap) },
          { path: 'benchmark-library', element: S(BenchmarkLibrary) },
          { path: 'annual-report', element: S(AnnualReport) },
        ],
      },
    ],
  },
];