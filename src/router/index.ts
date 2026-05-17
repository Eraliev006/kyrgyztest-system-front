import { createRouter, createWebHistory } from 'vue-router'
import ExamView from '../views/ExamView.vue'
import AdminLoginView from '../views/AdminLoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import CandidatesView from '../views/CandidatesView.vue'
import QuestionsView from '../views/QuestionsView.vue'
import VariantsView from '../views/VariantsView.vue'
import VariantDetailView from '../views/VariantDetailView.vue'
import ResultsView from '../views/ResultsView.vue'
import StatsView from '../views/StatsView.vue'
import OrganizationsView from '../views/OrganizationsView.vue'
import UsersView from '../views/UsersView.vue'
import SettingsView from '../views/SettingsView.vue'
import TopicsView from '../views/TopicsView.vue'
import AuditView from '../views/AuditView.vue'


const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: ExamView },
    { path: '/admin', component: AdminLoginView },
    {
      path: '/admin/dashboard',
      component: DashboardView,
      meta: { requiresAuth: true }
    },
    {
      path: '/admin/candidates',
      component: CandidatesView,
      meta: { requiresAuth: true }
    },
    {
      path: '/admin/questions',
      component: QuestionsView,
      meta: { requiresAuth: true, roles: ['Expert', 'SuperAdmin'] }
    },
    {
      path: '/admin/variants',
      component: VariantsView,
      meta: { requiresAuth: true, roles: ['Director', 'SuperAdmin'] }
    },
    {
      path: '/admin/variants/:id',
      component: VariantDetailView,
      meta: { requiresAuth: true, roles: ['Director', 'SuperAdmin'] }
    },
    {
      path: '/admin/results',
      component: ResultsView,
      meta: { requiresAuth: true, roles: ['Director', 'SuperAdmin'] }
    },
    {
      path: '/admin/results/stats',
      component: StatsView,
      meta: { requiresAuth: true, roles: ['Director', 'SuperAdmin'] }
    },
    {
      path: '/admin/organizations',
      component: OrganizationsView,
      meta: { requiresAuth: true, roles: ['Director', 'SuperAdmin'] }
    },
    {
      path: '/admin/users',
      component: UsersView,
      meta: { requiresAuth: true, roles: ['Director', 'SuperAdmin'] }
    },
    {
      path: '/admin/settings',
      component: SettingsView,
      meta: { requiresAuth: true, roles: ['Director', 'SuperAdmin'] }
    },
    {
      path: '/admin/topics',
      component: TopicsView,
      meta: { requiresAuth: true, roles: ['Director', 'Expert', 'SuperAdmin'] }
    },
    {
      path: '/admin/audit',
      component: AuditView,
      meta: { requiresAuth: true, roles: ['Director', 'SuperAdmin'] }
    }
  ]
})

router.beforeEach((to, _, next) => {
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')

  if (to.meta.requiresAuth && !token) {
    next('/admin')
    return
  }

  if (to.meta.roles && !(to.meta.roles as string[]).includes(role || '')) {
    next('/admin/dashboard')
    return
  }

  next()
})

export default router