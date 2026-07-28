import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  usePostApiExaminerGrade,
  getGetApiExaminerReviewAttemptIdQueryKey,
  getGetApiExaminerQueueQueryKey,
} from '@/shared/api/generated/examiner/examiner'
import { isGraded, type ExaminerAnswer } from '@/entities/examiner'
import { Button } from '@/shared/ui/button'
import { ApiError } from '@/shared/api/instance'

const SCORES = [0, 1, 2, 3, 4, 5]

export function GradeAnswerForm({
  attemptId,
  answer,
}: {
  attemptId: string
  answer: ExaminerAnswer
}) {
  const [selected, setSelected] = useState<number | null>(answer.score ?? null)
  const queryClient = useQueryClient()
  const mutation = usePostApiExaminerGrade()

  function grade(score: number) {
    setSelected(score)
    mutation.mutate(
      { data: { attemptId, questionId: answer.questionId!, score } },
      {
        onSuccess: () => {
          toast.success('Оценка сохранена')
          queryClient.invalidateQueries({
            queryKey: getGetApiExaminerReviewAttemptIdQueryKey(attemptId),
          })
          queryClient.invalidateQueries({ queryKey: getGetApiExaminerQueueQueryKey() })
        },
        onError: (error) => {
          toast.error(error instanceof ApiError ? error.message : 'Ошибка')
          setSelected(answer.score ?? null)
        },
      },
    )
  }

  return (
    <div className="flex items-center gap-2" data-testid={`grade-form-${answer.questionId}`}>
      <span className="text-sm text-muted-foreground">Оценка (0-5):</span>
      <div className="flex gap-1">
        {SCORES.map((score) => (
          <Button
            key={score}
            type="button"
            size="icon-sm"
            variant={selected === score ? 'default' : 'outline'}
            disabled={mutation.isPending}
            onClick={() => grade(score)}
            data-testid={`grade-option-${answer.questionId}-${score}`}
          >
            {score}
          </Button>
        ))}
      </div>
      {isGraded(answer) && selected === answer.score && (
        <span
          className="text-sm text-muted-foreground"
          data-testid={`grade-saved-${answer.questionId}`}
        >
          Сохранено
        </span>
      )}
    </div>
  )
}
