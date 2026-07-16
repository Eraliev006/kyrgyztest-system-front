import { useState } from 'react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import {
  usePutApiCandidatesIdAllow,
  usePutApiCandidatesIdDeny,
  getGetApiCandidatesQueryKey,
} from '@/shared/api/generated/candidate/candidate'
import { isBlocked, type Candidate } from '@/entities/candidate'
import { ApiError } from '@/shared/api/instance'
import { Button } from '@/shared/ui/button'
import { BlockCandidateDialog } from './BlockCandidateDialog'

export function CandidateAccessActions({ candidate }: { candidate: Candidate }) {
  const [blockDialogOpen, setBlockDialogOpen] = useState(false)
  const queryClient = useQueryClient()

  function onSettled() {
    queryClient.invalidateQueries({ queryKey: getGetApiCandidatesQueryKey() })
  }

  const allowMutation = usePutApiCandidatesIdAllow({
    mutation: {
      onSuccess: () => toast.success('Доступ открыт'),
      onError: (error) => toast.error(error instanceof ApiError ? error.message : 'Ошибка'),
      onSettled,
    },
  })

  const denyMutation = usePutApiCandidatesIdDeny({
    mutation: {
      onSuccess: () => toast.success('Доступ закрыт'),
      onError: (error) => toast.error(error instanceof ApiError ? error.message : 'Ошибка'),
      onSettled,
    },
  })

  const blocked = isBlocked(candidate)

  return (
    <div className="flex gap-2">
      {blocked ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => allowMutation.mutate({ id: candidate.id! })}
          disabled={allowMutation.isPending}
        >
          Разблокировать
        </Button>
      ) : candidate.isAllowed ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => denyMutation.mutate({ id: candidate.id! })}
          disabled={denyMutation.isPending}
        >
          Закрыть доступ
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => allowMutation.mutate({ id: candidate.id! })}
          disabled={allowMutation.isPending}
        >
          Открыть доступ
        </Button>
      )}
      <Button variant="destructive" size="sm" onClick={() => setBlockDialogOpen(true)}>
        Заблокировать
      </Button>
      <BlockCandidateDialog
        open={blockDialogOpen}
        onOpenChange={setBlockDialogOpen}
        candidate={candidate}
      />
    </div>
  )
}
