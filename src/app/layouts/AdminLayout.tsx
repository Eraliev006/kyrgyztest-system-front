import { Outlet } from 'react-router-dom'

// Sidebar/header widgets land in a later epic — this is the routing/guard skeleton for Ф-1.
export function AdminLayout() {
  return (
    <div className="flex min-h-svh">
      <aside className="w-60 shrink-0 border-r" />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="h-14 shrink-0 border-b" />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
