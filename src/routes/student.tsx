import { lazy, Suspense, type ComponentType } from 'react';
import type { RouteObject } from 'react-router-dom';
import { PageLoader } from './shared';
import { AuthGuard } from '@/components/auth/AuthGuard';

const StudentLayout = lazy(() => import('@/components/layouts/StudentLayout'));
const StudentLogin = lazy(() => import('@/pages/student/LoginPage'));
const StudentHome = lazy(() => import('@/pages/student/HomePage'));
const EvaluationCenter = lazy(() => import('@/pages/student/EvaluationCenterPage'));
const EvaluationTest = lazy(() => import('@/pages/student/EvaluationTestPage'));
const EvaluationReport = lazy(() => import('@/pages/student/EvaluationReportPage'));
const GrowthCenter = lazy(() => import('@/pages/student/GrowthCenterPage'));
const JobRecommend = lazy(() => import('@/pages/student/JobRecommendPage'));
const StudentProfile = lazy(() => import('@/pages/student/ProfilePage'));
const AIInterview = lazy(() => import('@/pages/student/AIInterviewPage'));
const AIInterviewReport = lazy(() => import('@/pages/student/AIInterviewReportPage'));
const VipCenter = lazy(() => import('@/pages/student/VipCenterPage'));
const AICareerDiagnosis = lazy(() => import('@/pages/student/AICareerDiagnosisPage'));
const AbilityProfile = lazy(() => import('@/pages/student/AbilityProfilePage'));
const CareerConsultingCenter = lazy(() => import('@/pages/student/CareerConsultingCenterPage'));
const EnterpriseHiringQuery = lazy(() => import('@/pages/student/EnterpriseHiringQueryPage'));
const EnterpriseInsight = lazy(() => import('@/pages/student/EnterpriseInsightPage'));
const CompanyCompare = lazy(() => import('@/pages/student/CompanyComparePage'));
const AbilityMatch = lazy(() => import('@/pages/student/AbilityMatchPage'));
const AbilityTree = lazy(() => import('@/pages/student/AbilityTreePage'));
const LearningPlan = lazy(() => import('@/pages/student/LearningPlanPage'));
const JobTracker = lazy(() => import('@/pages/student/JobTrackerPage'));
const StudyCheckin = lazy(() => import('@/pages/student/StudyCheckinPage'));
const SalaryNegotiator = lazy(() => import('@/pages/student/SalaryNegotiatorPage'));
const ResumeVersionManager = lazy(() => import('@/pages/student/ResumeVersionManagerPage'));
const PersonalDataDashboard = lazy(() => import('@/pages/student/PersonalDataDashboardPage'));
const CareerPlanner = lazy(() => import('@/pages/student/CareerPlannerPage'));
const JDAnalysis = lazy(() => import('@/pages/student/JDAnalysisPage'));
const AIInternshipTraining = lazy(() => import('@/pages/student/AIInternshipTrainingPage'));
const TrainingTaskList = lazy(() => import('@/pages/student/TrainingTaskListPage'));
const TrainingPractice = lazy(() => import('@/pages/student/TrainingPracticePage'));
const TrainingReport = lazy(() => import('@/pages/student/TrainingReportPage'));
const CoursePlayer = lazy(() => import('@/pages/student/CoursePlayerPage'));
const ReferralCenter = lazy(() => import('@/pages/student/ReferralCenterPage'));
const SmartResumeAssistant = lazy(() => import('@/pages/student/SmartResumeAssistantPage'));
const DeepResearchCenter = lazy(() => import('@/pages/student/DeepResearchCenterPage'));
const DeepResearchCreate = lazy(() => import('@/pages/student/DeepResearchCreatePage'));
const DeepResearchProgress = lazy(() => import('@/pages/student/DeepResearchProgressPage'));
const DeepResearchReport = lazy(() => import('@/pages/student/DeepResearchReportPage'));
const WebSummaryList = lazy(() => import('@/pages/shared/WebSummaryListPage'));
const WebSummaryTask = lazy(() => import('@/pages/shared/WebSummaryTaskPage'));

const S = (C: React.LazyExoticComponent<ComponentType>) => (
  <Suspense fallback={<PageLoader />}>
    <C />
  </Suspense>
);

// 学员端路由（需登录守卫）
export const studentRoutes: RouteObject[] = [
  {
    path: 'student',
    children: [
      {
        path: 'login',
        element: S(StudentLogin),
      },
      {
        path: '',
        element: (
          <AuthGuard role="student">
            <Suspense fallback={<PageLoader />}>
              <StudentLayout />
            </Suspense>
          </AuthGuard>
        ),
        children: [
          { path: 'home', element: S(StudentHome) },
          { path: 'evaluation', element: S(EvaluationCenter) },
          { path: 'evaluation/test/:id', element: S(EvaluationTest) },
          { path: 'evaluation/report/:id', element: S(EvaluationReport) },
          { path: 'growth', element: S(GrowthCenter) },
          { path: 'jobs', element: S(JobRecommend) },
          { path: 'profile', element: S(StudentProfile) },
          { path: 'ai-interview', element: S(AIInterview) },
          { path: 'ai-interview/report/:id', element: S(AIInterviewReport) },
          { path: 'vip', element: S(VipCenter) },
          { path: 'diagnosis', element: S(AICareerDiagnosis) },
          { path: 'ability-profile', element: S(AbilityProfile) },
          { path: 'career-consulting', element: S(CareerConsultingCenter) },
          { path: 'internship-training', element: S(AIInternshipTraining) },
          { path: 'training-tasks', element: S(TrainingTaskList) },
          { path: 'training/:taskId', element: S(TrainingPractice) },
          { path: 'training/report/:submissionId', element: S(TrainingReport) },
          { path: 'enterprise-hiring', element: S(EnterpriseHiringQuery) },
          { path: 'enterprise-insight', element: S(EnterpriseInsight) },
          { path: 'company-compare', element: S(CompanyCompare) },
          { path: 'ability-match', element: S(AbilityMatch) },
          { path: 'ability-tree', element: S(AbilityTree) },
          { path: 'learning-plan', element: S(LearningPlan) },
          { path: 'job-tracker', element: S(JobTracker) },
          { path: 'study-checkin', element: S(StudyCheckin) },
          { path: 'salary-negotiator', element: S(SalaryNegotiator) },
          { path: 'resume-versions', element: S(ResumeVersionManager) },
          { path: 'my-data', element: S(PersonalDataDashboard) },
          { path: 'career-planner', element: S(CareerPlanner) },
          { path: 'jd-analysis', element: S(JDAnalysis) },
          { path: 'jd_input', element: S(JDAnalysis) },
          { path: 'referral', element: S(ReferralCenter) },
          { path: 'resume-assistant', element: S(SmartResumeAssistant) },
          { path: 'course/:id', element: S(CoursePlayer) },
          {
            path: 'deep-research',
            children: [
              { index: true, element: S(DeepResearchCenter) },
              { path: 'create', element: S(DeepResearchCreate) },
              { path: 'progress/:id', element: S(DeepResearchProgress) },
              { path: 'report/:id', element: S(DeepResearchReport) },
            ],
          },
          {
            path: 'web-summary',
            children: [
              { index: true, element: <Suspense fallback={<PageLoader />}><WebSummaryList basePath="/student/web-summary" /></Suspense> },
              { path: ':taskId', element: <Suspense fallback={<PageLoader />}><WebSummaryTask basePath="/student/web-summary" /></Suspense> },
            ],
          },
        ],
      },
    ],
  },
];