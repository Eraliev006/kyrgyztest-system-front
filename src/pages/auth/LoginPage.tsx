import { LoginForm } from '@/features/admin-auth/LoginForm'

export default function LoginPage() {
  return (
    <div className="flex min-h-svh items-center justify-center">
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-semibold">Вход</h1>
        <LoginForm />
      </div>
    </div>
  )
}
