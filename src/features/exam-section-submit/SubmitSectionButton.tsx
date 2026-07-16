import { useState } from 'react'
import { Button } from '@/shared/ui/button'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog'

interface SubmitSectionButtonProps {
  onConfirm: () => void
  isPending?: boolean
}

export function SubmitSectionButton({ onConfirm, isPending }: SubmitSectionButtonProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <>
      <Button
        onClick={() => setConfirmOpen(true)}
        disabled={isPending}
        data-testid="submit-section-button"
      >
        Завершить раздел
      </Button>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Завершить раздел?"
        description="Вернуться к вопросам раздела будет нельзя."
        confirmLabel="Завершить"
        isPending={isPending}
        testId="submit-section-confirm-dialog"
        onConfirm={() => {
          setConfirmOpen(false)
          onConfirm()
        }}
      />
    </>
  )
}
