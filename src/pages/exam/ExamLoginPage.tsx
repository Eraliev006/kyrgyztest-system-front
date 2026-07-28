import { useState } from 'react'
import { isKioskUnlocked } from '@/shared/lib/kiosk-session'
import { KioskUnlockForm } from '@/features/exam-access-login/KioskUnlockForm'
import { AccessCodeLoginForm } from '@/features/exam-access-login/AccessCodeLoginForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import logo from '@/assets/logo.jpeg'

export default function ExamLoginPage() {
  const [unlocked, setUnlocked] = useState(isKioskUnlocked)

  return (
    <div className="flex min-h-svh items-center justify-center px-4">
      <div className="flex w-full max-w-sm flex-col items-center gap-6">
        <img src={logo} alt="Kyrgyztest" className="h-9 w-auto" />
        <Card className="w-full">
          <CardHeader>
            <CardTitle>{unlocked ? 'Вход по коду доступа' : 'Экзаменационная комната'}</CardTitle>
            <CardDescription>
              {unlocked
                ? 'Введите код, который выдал администратор'
                : 'Введите пароль, чтобы разблокировать вход для кандидатов'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {unlocked ? (
              <AccessCodeLoginForm />
            ) : (
              <KioskUnlockForm onUnlocked={() => setUnlocked(true)} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
