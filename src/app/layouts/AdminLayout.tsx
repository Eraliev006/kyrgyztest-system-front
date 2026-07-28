import { Outlet } from 'react-router-dom'
import {
  LayoutDashboard,
  Building2,
  Users,
  BookOpen,
  HelpCircle,
  Shuffle,
  BarChart3,
  Activity,
  UserCog,
  History,
} from 'lucide-react'
import { Sidebar, type SidebarLink } from '@/widgets/sidebar/Sidebar'
import { Header } from '@/widgets/header/Header'
import { UserRole } from '@/entities/account'

const { SuperAdmin, Director, Admin, Expert } = UserRole

const links: SidebarLink[] = [
  {
    to: '/admin',
    label: 'Дашборд',
    end: true,
    icon: LayoutDashboard,
    testId: 'nav-dashboard',
    roles: [SuperAdmin, Director, Admin],
  },
  {
    to: '/admin/organizations',
    label: 'Организации',
    icon: Building2,
    testId: 'nav-organizations',
    roles: [SuperAdmin, Director],
  },
  {
    to: '/admin/candidates',
    label: 'Кандидаты',
    icon: Users,
    testId: 'nav-candidates',
    roles: [SuperAdmin, Director, Admin],
  },
  {
    to: '/admin/topics',
    label: 'Темы',
    icon: BookOpen,
    testId: 'nav-topics',
    roles: [SuperAdmin, Director, Expert],
  },
  {
    to: '/admin/questions',
    label: 'Вопросы',
    icon: HelpCircle,
    testId: 'nav-questions',
    roles: [SuperAdmin, Expert],
  },
  {
    to: '/admin/variants',
    label: 'Варианты',
    icon: Shuffle,
    testId: 'nav-variants',
    roles: [SuperAdmin, Director],
  },
  {
    to: '/admin/results',
    label: 'Результаты',
    icon: BarChart3,
    testId: 'nav-results',
    roles: [SuperAdmin, Director, Admin],
  },
  {
    to: '/admin/monitoring',
    label: 'Мониторинг',
    icon: Activity,
    testId: 'nav-monitoring',
    roles: [SuperAdmin, Director, Admin],
  },
  {
    to: '/admin/users',
    label: 'Сотрудники',
    icon: UserCog,
    testId: 'nav-users',
    roles: [SuperAdmin, Director],
  },
  {
    to: '/admin/audit',
    label: 'Аудит',
    icon: History,
    testId: 'nav-audit',
    roles: [SuperAdmin, Director],
  },
]

export function AdminLayout() {
  return (
    <div className="flex min-h-svh">
      <Sidebar title="Админ панель" links={links} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="shrink-0 border-b">
          <Header />
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
