import { useTheme } from 'next-themes'
import { Sun, Moon, Monitor } from 'lucide-react'
import { Button } from '@/shared/ui/button'

const options = [
  { value: 'light', label: 'Светлая тема', icon: Sun },
  { value: 'dark', label: 'Тёмная тема', icon: Moon },
  { value: 'system', label: 'Системная тема', icon: Monitor },
] as const

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div
      data-slot="button-group"
      className="flex items-center gap-0.5 rounded-lg border border-border p-0.5"
      data-testid="theme-toggle"
    >
      {options.map(({ value, label, icon: Icon }) => (
        <Button
          key={value}
          type="button"
          variant={theme === value ? 'secondary' : 'ghost'}
          size="icon-sm"
          aria-label={label}
          title={label}
          onClick={() => setTheme(value)}
          data-testid={`theme-toggle-${value}`}
        >
          <Icon />
        </Button>
      ))}
    </div>
  )
}
