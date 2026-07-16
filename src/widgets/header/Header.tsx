import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/entities/account'
import { Button } from '@/shared/ui/button'

export function Header() {
  const { account, logout } = useAuth()
  const navigate = useNavigate()

  function onLogout() {
    logout()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="flex h-14 items-center justify-between px-6" data-testid="admin-header">
      <span className="text-sm text-muted-foreground" data-testid="admin-header-account">
        {account?.fullName} ({account?.role})
      </span>
      <Button variant="outline" size="sm" onClick={onLogout} data-testid="logout-button">
        Выйти
      </Button>
    </div>
  )
}
