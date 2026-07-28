import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import {
  useDeleteApiVariantsId,
  getGetApiVariantsQueryKey,
} from '@/shared/api/generated/test-variant/test-variant'
import { ApiError } from '@/shared/api/instance'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog'

interface DeleteVariantDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  variant: { id: string; number: number }
}

export function DeleteVariantDialog({ open, onOpenChange, variant }: DeleteVariantDialogProps) {
  const queryClient = useQueryClient()

  const mutation = useDeleteApiVariantsId({
    mutation: {
      onSuccess: () => {
        toast.success(`Вариант №${variant.number} удалён`)
        onOpenChange(false)
      },
      onError: (error) => toast.error(error instanceof ApiError ? error.message : 'Ошибка'),
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: getGetApiVariantsQueryKey() })
      },
    },
  })

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Удалить вариант №${variant.number}?`}
      description="Это действие необратимо. Удалить можно только вариант, по которому ещё не было попыток кандидатов — иначе система откажет."
      onConfirm={() => mutation.mutate({ id: variant.id })}
      isPending={mutation.isPending}
      testId="delete-variant-dialog"
    />
  )
}
