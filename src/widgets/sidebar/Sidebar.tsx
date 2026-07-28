import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { PanelLeftClose, PanelLeftOpen, type LucideIcon } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { useAuth, type UserRole } from '@/entities/account'
import logo from '@/assets/logo.jpeg'

export interface SidebarLink {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
  testId: string
  roles?: UserRole[]
}

const STORAGE_KEY = 'sidebar-collapsed'

export function Sidebar({
  title,
  links,
  testId = 'admin-sidebar',
}: {
  title: string
  links: SidebarLink[]
  testId?: string
}) {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(STORAGE_KEY) !== 'false')
  const { account } = useAuth()
  const visibleLinks = links.filter(
    (link) => !link.roles || (account && link.roles.includes(account.role)),
  )

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(collapsed))
  }, [collapsed])

  return (
    <aside
      className={cn(
        'flex shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200',
        collapsed ? 'w-14' : 'w-60',
      )}
      data-testid={testId}
    >
      <div
        className={cn(
          'flex h-16 flex-col justify-center gap-1 border-b border-sidebar-border px-3',
          collapsed && 'items-center px-2',
        )}
      >
        <div className="flex w-full items-center justify-between gap-2">
          {!collapsed && <img src={logo} alt="KyrgyzTest" className="h-5 w-auto rounded-sm" />}
          <Button
            variant="ghost"
            size="icon-sm"
            className={cn(
              'shrink-0 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              !collapsed && 'ml-auto',
            )}
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? 'Развернуть меню' : 'Свернуть меню'}
            data-testid="sidebar-toggle"
          >
            {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
          </Button>
        </div>
        {!collapsed && <span className="truncate text-xs text-sidebar-foreground/70">{title}</span>}
      </div>
      <nav className="flex flex-col gap-1 p-2">
        {visibleLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            title={collapsed ? link.label : undefined}
            data-testid={link.testId}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                collapsed && 'justify-center px-0',
                isActive && 'bg-sidebar-accent font-medium text-sidebar-accent-foreground',
              )
            }
          >
            <link.icon className="size-4 shrink-0" />
            {!collapsed && <span className="truncate">{link.label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
