import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import {
  useDeleteApiCandidatesId,
  getGetApiCandidatesQueryKey,
} from '@/shared/api/generated/candidate/candidate'
import type { Candidate } from '@/entities/candidate'
import { ApiError } from '@/shared/api/instance'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog'

interface DeleteCandidateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  candidate: Candidate
}

export function DeleteCandidateDialog({
  open,
  onOpenChange,
  candidate,
}: DeleteCandidateDialogProps) {
  const queryClient = useQueryClient()

  const mutation = useDeleteApiCandidatesId({
    mutation: {
      onSuccess: () => {
        toast.success('Кандидат удалён')
        onOpenChange(false)
      },
      onError: (error) => toast.error(error instanceof ApiError ? error.message : 'Ошибка'),
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: getGetApiCandidatesQueryKey() })
      },
    },
  })

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Удалить кандидата «${candidate.fullName}»?`}
      description="Это действие необратимо."
      onConfirm={() => mutation.mutate({ id: candidate.id! })}
      isPending={mutation.isPending}
    />
  )
}
