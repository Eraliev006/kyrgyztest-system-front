import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { useDeleteApiTopicsId, getGetApiTopicsQueryKey } from '@/shared/api/generated/topic/topic'
import type { Topic } from '@/entities/topic'
import { ApiError } from '@/shared/api/instance'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog'

interface DeleteTopicDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  topic: Topic
}

export function DeleteTopicDialog({ open, onOpenChange, topic }: DeleteTopicDialogProps) {
  const queryClient = useQueryClient()

  const mutation = useDeleteApiTopicsId({
    mutation: {
      onSuccess: () => {
        toast.success('Тема удалена')
        onOpenChange(false)
      },
      onError: (error) => toast.error(error instanceof ApiError ? error.message : 'Ошибка'),
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: getGetApiTopicsQueryKey() })
      },
    },
  })

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Удалить тему «${topic.name}»?`}
      description="Это действие необратимо."
      onConfirm={() => mutation.mutate({ id: topic.id! })}
      isPending={mutation.isPending}
    />
  )
}
