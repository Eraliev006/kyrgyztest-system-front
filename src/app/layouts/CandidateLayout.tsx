import { Outlet } from 'react-router-dom'

// Progress widget lands with the Ф-4 exam-section-runner — logo + outlet skeleton for Ф-1.
export function CandidateLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex h-14 shrink-0 items-center border-b px-6 font-medium">
        Kyrgyztest
      </header>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  )
}
