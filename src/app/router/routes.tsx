import { createBrowserRouter } from 'react-router-dom'
import { AdminLayout } from '@/app/layouts/AdminLayout'
import { ExaminerLayout } from '@/app/layouts/ExaminerLayout'
import { CandidateLayout } from '@/app/layouts/CandidateLayout'
import { AdminAuthGuard } from '@/shared/guards/AdminAuthGuard'
import { ExamAttemptGuard } from '@/shared/guards/ExamAttemptGuard'

export const router = createBrowserRouter([
  {
    path: '/admin/login',
    lazy: () => import('@/pages/auth/LoginPage').then((m) => ({ Component: m.default })),
  },
  {
    element: <AdminAuthGuard />,
    children: [
      {
        path: '/admin',
        element: <AdminLayout />,
        children: [
          {
            index: true,
            lazy: () =>
              import('@/pages/dashboard/DashboardPage').then((m) => ({ Component: m.default })),
          },
          {
            path: 'organizations',
            lazy: () =>
              import('@/pages/organizations/OrganizationsPage').then((m) => ({
                Component: m.default,
              })),
          },
          {
            path: 'candidates',
            lazy: () =>
              import('@/pages/candidates/CandidatesPage').then((m) => ({
                Component: m.default,
              })),
          },
          {
            path: 'topics',
            lazy: () => import('@/pages/topics/TopicsPage').then((m) => ({ Component: m.default })),
          },
          {
            path: 'questions',
            lazy: () =>
              import('@/pages/questions/QuestionsPage').then((m) => ({ Component: m.default })),
          },
          {
            path: 'variants',
            lazy: () =>
              import('@/pages/variants/VariantsPage').then((m) => ({ Component: m.default })),
          },
          {
            path: 'results',
            lazy: () =>
              import('@/pages/results/ResultsPage').then((m) => ({ Component: m.default })),
          },
          {
            path: 'monitoring',
            lazy: () =>
              import('@/pages/monitoring/MonitoringPage').then((m) => ({ Component: m.default })),
          },
          {
            path: 'users',
            lazy: () => import('@/pages/users/UsersPage').then((m) => ({ Component: m.default })),
          },
          {
            path: 'audit',
            lazy: () => import('@/pages/audit/AuditPage').then((m) => ({ Component: m.default })),
          },
        ],
      },
      {
        path: '/examiner',
        element: <ExaminerLayout />,
        children: [
          {
            index: true,
            lazy: () =>
              import('@/pages/examiner/ExaminerQueuePage').then((m) => ({
                Component: m.default,
              })),
          },
          {
            path: 'queue',
            lazy: () =>
              import('@/pages/examiner/ExaminerQueuePage').then((m) => ({
                Component: m.default,
              })),
          },
          {
            path: 'review/:attemptId',
            lazy: () =>
              import('@/pages/examiner/ExaminerReviewPage').then((m) => ({
                Component: m.default,
              })),
          },
        ],
      },
    ],
  },
  {
    path: '/exam/login',
    lazy: () => import('@/pages/exam/ExamLoginPage').then((m) => ({ Component: m.default })),
  },
  {
    element: <ExamAttemptGuard />,
    children: [
      {
        element: <CandidateLayout />,
        children: [
          {
            path: '/exam/section/:sectionCode',
            lazy: () =>
              import('@/pages/exam/ExamSectionPage').then((m) => ({ Component: m.default })),
          },
          {
            path: '/exam/finish',
            lazy: () =>
              import('@/pages/exam/ExamFinishPage').then((m) => ({ Component: m.default })),
          },
        ],
      },
    ],
  },
])
