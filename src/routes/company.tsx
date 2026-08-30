import { lazy, Suspense, type ComponentType } from 'react';
import type { RouteObject } from 'react-router-dom';
import { PageLoader } from './shared';
import { AuthGuard } from '@/components/auth/AuthGuard';

const CompanyLayout = lazy(() => import('@/components/layouts/CompanyLayout'));
const CompanyLogin = lazy(() => import('@/pages/company/LoginPage'));
const CompanyDashboard = lazy(() => import('@/pages/company/DashboardPage'));
const CreatePosition = lazy(() => import('@/pages/company/CreatePositionPage'));
const PositionManage = lazy(() => import('@/pages/company/PositionManagePage'));
const PositionAnalytics = lazy(() => import('@/pages/company/PositionAnalyticsPage'));
const PositionEdit = lazy(() => import('@/pages/company/PositionEditPage'));
const CompetencyModeling = lazy(() => import('@/pages/company/CompetencyModelingPage'));
const ResumeManage = lazy(() => import('@/pages/company/ResumeManagePage'));
const ResumeDetail = lazy(() => import('@/pages/company/ResumeDetailPage'));
const EvaluationManage = lazy(() => import('@/pages/company/EvaluationManagePage'));
const EvaluationDetail = lazy(() => import('@/pages/company/EvaluationDetailPage'));
const EnterpriseModelsPage = lazy(() => import('@/pages/company/EnterpriseModelsPage'));
const InterviewDesigner = lazy(() => import('@/pages/company/InterviewDesignerPage'));
const CandidateAccountsPage = lazy(() => import('@/pages/company/CandidateAccountsPage'));
const CandidateResultsPage = lazy(() => import('@/pages/company/CandidateResultsPage'));
const CandidatePortraitPage = lazy(() => import('@/pages/company/CandidatePortraitPage'));
const SubscriptionPlan = lazy(() => import('@/pages/company/SubscriptionPlanPage'));
const CompanyProfile = lazy(() => import('@/pages/company/ProfilePage'));
const CompanyNotifications = lazy(() => import('@/pages/company/NotificationsPage'));
const CompanySettings = lazy(() => import('@/pages/company/SettingsPage'));
const CompetitorAnalysis = lazy(() => import('@/pages/company/CompetitorAnalysisPage'));
const CandidatePool = lazy(() => import('@/pages/company/CandidatePoolPage'));
const CandidateCompare = lazy(() => import('@/pages/company/CandidateComparePage'));
const EnterpriseTalentInsight = lazy(() => import('@/pages/company/EnterpriseTalentInsightPage'));

const S = (C: React.LazyExoticComponent<ComponentType>) => (
  <Suspense fallback={<PageLoader />}>
    <C />
  </Suspense>
);

// 企业端（HR）路由（需登录守卫）
export const companyRoutes: RouteObject[] = [
  {
    path: 'company',
    children: [
      {
        path: 'login',
        element: S(CompanyLogin),
      },
      {
        path: '',
        element: (
          <AuthGuard role="company_hr">
            <Suspense fallback={<PageLoader />}>
              <CompanyLayout />
            </Suspense>
          </AuthGuard>
        ),
        children: [
          { path: 'dashboard', element: S(CompanyDashboard) },
          { path: 'position/create', element: S(CreatePosition) },
          { path: 'positions', element: S(PositionManage) },
          { path: 'position/:id/analytics', element: S(PositionAnalytics) },
          { path: 'position/edit/:id', element: S(PositionEdit) },
          { path: 'modeling/:id?', element: S(CompetencyModeling) },
          { path: 'resumes', element: S(ResumeManage) },
          { path: 'resume/:id', element: S(ResumeDetail) },
          { path: 'evaluations', element: S(EvaluationManage) },
          { path: 'enterprise-models', element: S(EnterpriseModelsPage) },
          { path: 'candidate-accounts', element: S(CandidateAccountsPage) },
          { path: 'candidates/results', element: S(CandidateResultsPage) },
          { path: 'candidates/portrait', element: S(CandidatePortraitPage) },
          { path: 'evaluation/:id', element: S(EvaluationDetail) },
          { path: 'subscription', element: S(SubscriptionPlan) },
          { path: 'profile', element: S(CompanyProfile) },
          { path: 'notifications', element: S(CompanyNotifications) },
          { path: 'settings', element: S(CompanySettings) },
          { path: 'competitor-analysis', element: S(CompetitorAnalysis) },
          { path: 'candidate-pool', element: S(CandidatePool) },
          { path: 'candidate-compare', element: S(CandidateCompare) },
          { path: 'talent-insight', element: S(EnterpriseTalentInsight) },
          { path: 'interview-designer', element: S(InterviewDesigner) },
        ],
      },
    ],
  },
];