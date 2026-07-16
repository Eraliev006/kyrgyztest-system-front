import { useState } from 'react'
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react'
import { usePostApiExamAnswer } from '@/shared/api/generated/exam/exam'
import type { ExamQuestion, ExamAnswerOption } from '@/entities/attempt'
import { Button } from '@/shared/ui/button'

function shuffled(options: ExamAnswerOption[]): ExamAnswerOption[] {
  const copy = [...options]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function OrderedAnswerInput({
  attemptId,
  question,
}: {
  attemptId: string
  question: ExamQuestion
}) {
  // The backend doesn't guarantee answerOptions arrive in a scrambled order —
  // shuffle client-side so the exercise is never trivially "already solved".
  const [order, setOrder] = useState(() => shuffled(question.answerOptions ?? []))
  const mutation = usePostApiExamAnswer()

  function move(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= order.length) return
    const next = [...order]
    ;[next[index], next[target]] = [next[target], next[index]]
    setOrder(next)
    mutation.mutate({
      data: {
        attemptId,
        questionId: question.id!,
        orderedAnswer: JSON.stringify(next.map((o) => o.id)),
      },
    })
  }

  return (
    <div className="flex flex-col gap-2" data-testid={`ordered-question-${question.id}`}>
      {order.map((option, index) => (
        <div
          key={option.id}
          className="flex items-center gap-2 rounded-md border p-2"
          data-testid={`ordered-option-${option.id}`}
        >
          <span className="flex-1 text-sm">{option.content}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={index === 0}
            onClick={() => move(index, -1)}
            aria-label="Переместить вверх"
            data-testid={`ordered-option-${option.id}-up`}
          >
            <ArrowUpIcon className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={index === order.length - 1}
            onClick={() => move(index, 1)}
            aria-label="Переместить вниз"
            data-testid={`ordered-option-${option.id}-down`}
          >
            <ArrowDownIcon className="size-3.5" />
          </Button>
        </div>
      ))}
    </div>
  )
}
