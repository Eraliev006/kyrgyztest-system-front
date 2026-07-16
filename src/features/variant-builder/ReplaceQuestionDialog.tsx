import { useState } from 'react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import {
  useGetApiVariantsIdAvailableQuestions,
  usePutApiVariantsIdQuestionsQuestionId,
  getGetApiVariantsIdQueryKey,
} from '@/shared/api/generated/test-variant/test-variant'
import { SectionType, LanguageLevel } from '@/shared/api/generated/kyrgyzTestAPI.schemas'
import type { VariantQuestion } from '@/entities/variant'
import { ApiError } from '@/shared/api/instance'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'

interface ReplaceQuestionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  variantId: string
  question: VariantQuestion
}

export function ReplaceQuestionDialog({
  open,
  onOpenChange,
  variantId,
  question,
}: ReplaceQuestionDialogProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data: response, isLoading } = useGetApiVariantsIdAvailableQuestions(
    variantId,
    { section: question.section as SectionType, level: question.level as LanguageLevel },
    { query: { enabled: open } },
  )
  // Backend only filters by section/level, not type — narrow to matching type client-side.
  const candidates = (response?.data ?? []).filter((q) => q.type === question.type)

  const mutation = usePutApiVariantsIdQuestionsQuestionId({
    mutation: {
      onSuccess: () => {
        toast.success('Вопрос заменён')
        onOpenChange(false)
        setSelectedId(null)
      },
      onError: (error) => toast.error(error instanceof ApiError ? error.message : 'Ошибка'),
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: getGetApiVariantsIdQueryKey(variantId) })
      },
    },
  })

  function onConfirm() {
    if (!selectedId) return
    mutation.mutate({
      id: variantId,
      questionId: question.id!,
      data: { newQuestionId: selectedId },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Заменить вопрос</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">Текущий: {question.content}</p>
        <div className="flex flex-col gap-1">
          {isLoading && [0, 1, 2].map((i) => <Skeleton key={i} className="h-9 w-full" />)}
          {!isLoading && candidates.length === 0 && (
            <p className="text-sm text-muted-foreground">Нет доступных вопросов для замены</p>
          )}
          {candidates.map((candidate) => (
            <label
              key={candidate.id}
              className="flex cursor-pointer items-center gap-2 rounded-md p-2 hover:bg-muted"
            >
              <input
                type="radio"
                name="replacement"
                checked={selectedId === candidate.id}
                onChange={() => setSelectedId(candidate.id!)}
              />
              <span className="text-sm">{candidate.content}</span>
            </label>
          ))}
        </div>
        <DialogFooter>
          <Button onClick={onConfirm} disabled={!selectedId || mutation.isPending}>
            Заменить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
