import { Outlet } from 'react-router-dom'
import { ClipboardCheck } from 'lucide-react'
import { Sidebar, type SidebarLink } from '@/widgets/sidebar/Sidebar'
import { Header } from '@/widgets/header/Header'

const links: SidebarLink[] = [
  {
    to: '/examiner/queue',
    label: 'Очередь на проверку',
    icon: ClipboardCheck,
    testId: 'nav-examiner-queue',
  },
]

export function ExaminerLayout() {
  return (
    <div className="flex min-h-svh">
      <Sidebar title="Кабинет экзаменатора" links={links} testId="examiner-sidebar" />
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
