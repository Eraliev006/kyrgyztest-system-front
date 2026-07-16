import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/widgets/sidebar/Sidebar'
import { Header } from '@/widgets/header/Header'

export function AdminLayout() {
  return (
    <div className="flex min-h-svh">
      <aside className="w-60 shrink-0 border-r">
        <Sidebar />
      </aside>
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
