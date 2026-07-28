import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { useDeleteApiUserId, getGetApiUserQueryKey } from '@/shared/api/generated/user/user'
import type { StaffUser } from '@/entities/user'
import { ApiError } from '@/shared/api/instance'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog'

interface DeleteUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: StaffUser
}

export function DeleteUserDialog({ open, onOpenChange, user }: DeleteUserDialogProps) {
  const queryClient = useQueryClient()

  const mutation = useDeleteApiUserId({
    mutation: {
      onSuccess: () => {
        toast.success(`Сотрудник «${user.fullName}» удалён`)
        onOpenChange(false)
      },
      onError: (error) => toast.error(error instanceof ApiError ? error.message : 'Ошибка'),
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: getGetApiUserQueryKey() })
      },
    },
  })

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Удалить сотрудника «${user.fullName}»?`}
      description="Это действие необратимо. Сотрудник потеряет доступ к системе."
      onConfirm={() => mutation.mutate({ id: user.id! })}
      isPending={mutation.isPending}
      testId="delete-user-dialog"
    />
  )
}
