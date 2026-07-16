import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import {
  useDeleteApiSectionConfigId,
  getGetApiSectionConfigQueryKey,
} from '@/shared/api/generated/section-config/section-config'
import { sectionLabels } from '@/shared/constants/section-labels'
import type { SectionConfig } from '@/entities/section'
import { ApiError } from '@/shared/api/instance'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog'

interface DeleteSectionConfigDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  config: SectionConfig
}

export function DeleteSectionConfigDialog({
  open,
  onOpenChange,
  config,
}: DeleteSectionConfigDialogProps) {
  const queryClient = useQueryClient()

  const mutation = useDeleteApiSectionConfigId({
    mutation: {
      onSuccess: () => {
        toast.success('Конфигурация удалена')
        onOpenChange(false)
      },
      onError: (error) => toast.error(error instanceof ApiError ? error.message : 'Ошибка'),
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: getGetApiSectionConfigQueryKey() })
      },
    },
  })

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Удалить конфигурацию раздела «${sectionLabels[config.section!]}»?`}
      description="Это действие необратимо."
      onConfirm={() => mutation.mutate({ id: config.id! })}
      isPending={mutation.isPending}
      testId="delete-section-config-dialog"
    />
  )
}
