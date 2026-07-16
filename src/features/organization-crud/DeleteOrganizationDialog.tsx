import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import {
  useDeleteApiOrganizationsId,
  getGetApiOrganizationsQueryKey,
} from '@/shared/api/generated/organization/organization'
import type { Organization } from '@/entities/organization'
import { ApiError } from '@/shared/api/instance'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog'

interface DeleteOrganizationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  organization: Organization
}

export function DeleteOrganizationDialog({
  open,
  onOpenChange,
  organization,
}: DeleteOrganizationDialogProps) {
  const queryClient = useQueryClient()

  const mutation = useDeleteApiOrganizationsId({
    mutation: {
      onSuccess: () => {
        toast.success('Организация удалена')
        onOpenChange(false)
      },
      onError: (error) => toast.error(error instanceof ApiError ? error.message : 'Ошибка'),
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: getGetApiOrganizationsQueryKey() })
      },
    },
  })

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Удалить организацию «${organization.shortName}»?`}
      description="Это действие необратимо."
      onConfirm={() => mutation.mutate({ id: organization.id! })}
      isPending={mutation.isPending}
      testId="delete-organization-dialog"
    />
  )
}
