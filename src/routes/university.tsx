import { lazy, Suspense, type ComponentType } from 'react';
import type { RouteObject } from 'react-router-dom';
import { PageLoader } from './shared';
import { AuthGuard } from '@/components/auth/AuthGuard';

const UniversityLayout = lazy(() => import('@/components/layouts/UniversityLayout'));
const UniversityLogin = lazy(() => import('@/pages/university/LoginPage'));
const EmploymentDashboard = lazy(() => import('@/pages/university/EmploymentDashboardPage'));
const StudentManage = lazy(() => import('@/pages/university/StudentManagePage'));
const StudentDetail = lazy(() => import('@/pages/university/StudentDetailPage'));
const CompanyCooperation = lazy(() => import('@/pages/university/CompanyCooperationPage'));
const ClassAssessmentConfig = lazy(() => import('@/pages/university/ClassAssessmentConfigPage'));
const ClassAssessmentReport = lazy(() => import('@/pages/university/ClassAssessmentReportPage'));
const CourseQualityManage = lazy(() => import('@/pages/university/CourseQualityManagePage'));
const ClassPortrait = lazy(() => import('@/pages/university/ClassPortraitPage'));
const EmploymentQuality = lazy(() => import('@/pages/university/EmploymentQualityPage'));
const UniversityProfile = lazy(() => import('@/pages/university/ProfilePage'));
const UniversityNotifications = lazy(() => import('@/pages/university/NotificationsPage'));
const UniversitySettings = lazy(() => import('@/pages/university/SettingsPage'));
const UniversityDeepResearchCenter = lazy(() => import('@/pages/university/DeepResearchCenterPage'));
const UniversityDeepResearchCreate = lazy(() => import('@/pages/student/DeepResearchCreatePage'));
const UniversityDeepResearchProgress = lazy(() => import('@/pages/student/DeepResearchProgressPage'));
const UniversityDeepResearchReport = lazy(() => import('@/pages/student/DeepResearchReportPage'));
const WebSummaryList = lazy(() => import('@/pages/shared/WebSummaryListPage'));
const WebSummaryTask = lazy(() => import('@/pages/shared/WebSummaryTaskPage'));
const HiringData = lazy(() => import('@/pages/shared/HiringDataPage'));

const S = (C: React.LazyExoticComponent<ComponentType>) => (
  <Suspense fallback={<PageLoader />}>
    <C />
  </Suspense>
);

// 院校端（教务处）路由（需登录守卫）
export const universityRoutes: RouteObject[] = [
  {
    path: 'university',
    children: [
      {
        path: 'login',
        element: S(UniversityLogin),
      },
      {
        path: '',
        element: (
          <AuthGuard role="university_staff">
            <Suspense fallback={<PageLoader />}>
              <UniversityLayout />
            </Suspense>
          </AuthGuard>
        ),
        children: [
          { path: 'dashboard', element: S(EmploymentDashboard) },
          { path: 'student/:id', element: S(StudentDetail) },
          { path: 'students', element: S(StudentManage) },
          { path: 'cooperation', element: S(CompanyCooperation) },
          { path: 'assessment-config', element: S(ClassAssessmentConfig) },
          { path: 'assessment-report', element: S(ClassAssessmentReport) },
          { path: 'course-quality', element: S(CourseQualityManage) },
          { path: 'class-portrait', element: S(ClassPortrait) },
          { path: 'employment-quality', element: S(EmploymentQuality) },
          {
            path: 'deep-research',
            children: [
              { index: true, element: S(UniversityDeepResearchCenter) },
              { path: 'create', element: S(UniversityDeepResearchCreate) },
              { path: 'progress/:id', element: S(UniversityDeepResearchProgress) },
              { path: 'report/:id', element: S(UniversityDeepResearchReport) },
            ],
          },
          {
            path: 'web-summary',
            children: [
              { index: true, element: <Suspense fallback={<PageLoader />}><WebSummaryList basePath="/university/web-summary" /></Suspense> },
              { path: ':taskId', element: <Suspense fallback={<PageLoader />}><WebSummaryTask basePath="/university/web-summary" /></Suspense> },
            ],
          },
          {
            path: 'hiring-data',
            element: <Suspense fallback={<PageLoader />}><HiringData basePath="/university/hiring-data" pageTitle="人才需求分析" pageDesc="查询目标企业招聘概况，作为专业培养方案优化与就业指导课的教学素材" /></Suspense>,
          },
          { path: 'profile', element: S(UniversityProfile) },
          { path: 'notifications', element: S(UniversityNotifications) },
          { path: 'settings', element: S(UniversitySettings) },
        ],
      },
    ],
  },
];