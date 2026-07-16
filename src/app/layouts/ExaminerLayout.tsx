import { Outlet } from 'react-router-dom'

// Sidebar widget lands in a later epic — this is the routing/guard skeleton for Ф-1.
export function ExaminerLayout() {
  return (
    <div className="flex min-h-svh">
      <aside className="w-60 shrink-0 border-r" />
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  )
}
