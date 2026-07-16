import { CopyIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/ui/button'

export function AccessCodeDisplay({ code }: { code: string }) {
  function copy() {
    navigator.clipboard
      .writeText(code)
      .then(() => toast.success('Код скопирован'))
      .catch(() => toast.error('Не удалось скопировать'))
  }

  return (
    <div className="flex items-center gap-1.5 font-mono text-sm">
      <span data-testid="access-code-value">{code}</span>
      <Button variant="ghost" size="icon-sm" onClick={copy} aria-label="Скопировать код">
        <CopyIcon className="size-3.5" />
      </Button>
    </div>
  )
}
