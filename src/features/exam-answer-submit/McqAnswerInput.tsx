import { useState } from 'react'
import { usePostApiExamAnswer } from '@/shared/api/generated/exam/exam'
import type { ExamQuestion } from '@/entities/attempt'
import { cn } from '@/shared/lib/utils'

export function McqAnswerInput({
  attemptId,
  question,
  onAnswered,
}: {
  attemptId: string
  question: ExamQuestion
  onAnswered?: () => void
}) {
  const [selected, setSelected] = useState<string | null>(question.selectedOptionId ?? null)
  const mutation = usePostApiExamAnswer()

  function select(optionId: string) {
    setSelected(optionId)
    onAnswered?.()
    mutation.mutate({
      data: { attemptId, questionId: question.id!, selectedOptionId: optionId },
    })
  }

  return (
    <div
      className="flex flex-col gap-2"
      data-testid={`mcq-question-${question.id}`}
      role="radiogroup"
    >
      {question.answerOptions?.map((option) => {
        const isSelected = selected === option.id
        return (
          <label
            key={option.id}
            className={cn(
              'flex cursor-pointer items-center gap-3 rounded-lg border px-3.5 py-2.5 text-sm transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background',
              isSelected ? 'border-foreground/35 bg-accent' : 'border-border hover:bg-muted/60',
            )}
          >
            <input
              type="radio"
              name={`question-${question.id}`}
              checked={isSelected}
              onChange={() => select(option.id!)}
              className="sr-only"
              data-testid={`mcq-option-${option.id}`}
            />
            <span
              aria-hidden
              className={cn(
                'flex size-4 shrink-0 items-center justify-center rounded-full border',
                isSelected ? 'border-foreground' : 'border-input',
              )}
            >
              {isSelected && <span className="size-2 rounded-full bg-foreground" />}
            </span>
            <span>{option.content}</span>
          </label>
        )
      })}
    </div>
  )
}
