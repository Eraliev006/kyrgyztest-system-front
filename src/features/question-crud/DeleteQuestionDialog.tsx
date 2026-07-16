import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import {
  useDeleteApiQuestionsId,
  getGetApiQuestionsQueryKey,
} from '@/shared/api/generated/question/question'
import type { Question } from '@/entities/question'
import { ApiError } from '@/shared/api/instance'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog'

interface DeleteQuestionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  question: Question
}

export function DeleteQuestionDialog({ open, onOpenChange, question }: DeleteQuestionDialogProps) {
  const queryClient = useQueryClient()

  const mutation = useDeleteApiQuestionsId({
    mutation: {
      onSuccess: () => {
        toast.success('Вопрос удалён')
        onOpenChange(false)
      },
      onError: (error) => toast.error(error instanceof ApiError ? error.message : 'Ошибка'),
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: getGetApiQuestionsQueryKey() })
      },
    },
  })

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Удалить вопрос?"
      description="Это действие необратимо."
      onConfirm={() => mutation.mutate({ id: question.id! })}
      isPending={mutation.isPending}
    />
  )
}
