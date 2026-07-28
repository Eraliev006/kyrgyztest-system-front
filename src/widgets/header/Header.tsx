import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/entities/account'
import { ChangePasswordDialog } from '@/features/change-password/ChangePasswordDialog'
import { Button } from '@/shared/ui/button'
import { ThemeToggle } from '@/shared/ui/theme-toggle'

export function Header() {
  const { account, logout } = useAuth()
  const navigate = useNavigate()
  const [changePasswordOpen, setChangePasswordOpen] = useState(false)

  function onLogout() {
    logout()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="flex h-16 items-center justify-between px-6" data-testid="admin-header">
      <span className="text-sm text-muted-foreground" data-testid="admin-header-account">
        {account?.fullName} ({account?.role})
      </span>
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setChangePasswordOpen(true)}
          data-testid="change-password-button"
        >
          Сменить пароль
        </Button>
        <ThemeToggle />
        <Button variant="outline" size="sm" onClick={onLogout} data-testid="logout-button">
          Выйти
        </Button>
      </div>
      <ChangePasswordDialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen} />
    </div>
  )
}
