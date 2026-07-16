import { NavLink } from 'react-router-dom'
import { cn } from '@/shared/lib/utils'

const links = [
  { to: '/admin', label: 'Дашборд', end: true, testId: 'nav-dashboard' },
  { to: '/admin/organizations', label: 'Организации', testId: 'nav-organizations' },
  { to: '/admin/candidates', label: 'Кандидаты', testId: 'nav-candidates' },
  { to: '/admin/topics', label: 'Темы', testId: 'nav-topics' },
  { to: '/admin/questions', label: 'Вопросы', testId: 'nav-questions' },
  { to: '/admin/variants', label: 'Варианты', testId: 'nav-variants' },
  { to: '/admin/results', label: 'Результаты', testId: 'nav-results' },
  { to: '/admin/monitoring', label: 'Мониторинг', testId: 'nav-monitoring' },
]

export function Sidebar() {
  return (
    <nav className="flex flex-col gap-1 p-3" data-testid="admin-sidebar">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.end}
          data-testid={link.testId}
          className={({ isActive }) =>
            cn('rounded-md px-3 py-2 text-sm hover:bg-muted', isActive && 'bg-muted font-medium')
          }
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  )
}
