import { useState } from 'react'
import { usePostApiExamAnswer } from '@/shared/api/generated/exam/exam'
import type { ExamQuestion } from '@/entities/attempt'

export function McqAnswerInput({
  attemptId,
  question,
}: {
  attemptId: string
  question: ExamQuestion
}) {
  const [selected, setSelected] = useState<string | null>(null)
  const mutation = usePostApiExamAnswer()

  function select(optionId: string) {
    setSelected(optionId)
    mutation.mutate({
      data: { attemptId, questionId: question.id!, selectedOptionId: optionId },
    })
  }

  return (
    <div className="flex flex-col gap-2" data-testid={`mcq-question-${question.id}`}>
      {question.answerOptions?.map((option) => (
        <label
          key={option.id}
          className="flex cursor-pointer items-center gap-2 rounded-md p-2 hover:bg-muted"
        >
          <input
            type="radio"
            name={`question-${question.id}`}
            checked={selected === option.id}
            onChange={() => select(option.id!)}
            data-testid={`mcq-option-${option.id}`}
          />
          <span>{option.content}</span>
        </label>
      ))}
    </div>
  )
}
