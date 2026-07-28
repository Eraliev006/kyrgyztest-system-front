import { useState } from 'react'
import { LoginForm } from '@/features/admin-auth/LoginForm'
import { ForgotPasswordForm } from '@/features/admin-auth/ForgotPasswordForm'

export default function LoginPage() {
  const [forgotPassword, setForgotPassword] = useState(false)

  return (
    <div className="flex min-h-svh items-center justify-center">
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-semibold">{forgotPassword ? 'Забыли пароль?' : 'Вход'}</h1>
        {forgotPassword ? (
          <ForgotPasswordForm onBack={() => setForgotPassword(false)} />
        ) : (
          <LoginForm onForgotPassword={() => setForgotPassword(true)} />
        )}
      </div>
    </div>
  )
}
