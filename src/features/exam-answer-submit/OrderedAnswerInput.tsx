import { useState } from 'react'
import { usePostApiExamAnswer } from '@/shared/api/generated/exam/exam'
import type { ExamQuestion, ExamAnswerOption } from '@/entities/attempt'

function shuffled(options: ExamAnswerOption[]): ExamAnswerOption[] {
  const copy = [...options]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function initialOrder(question: ExamQuestion): ExamAnswerOption[] {
  const options = question.answerOptions ?? []
  if (!question.orderedAnswer) return shuffled(options)
  try {
    const savedIds: string[] = JSON.parse(question.orderedAnswer)
    const byId = new Map(options.map((o) => [o.id, o]))
    const restored = savedIds.map((id) => byId.get(id)).filter((o): o is ExamAnswerOption => !!o)
    return restored.length === options.length ? restored : shuffled(options)
  } catch {
    return shuffled(options)
  }
}

export function OrderedAnswerInput({
  attemptId,
  question,
  onAnswered,
}: {
  attemptId: string
  question: ExamQuestion
  onAnswered?: () => void
}) {
  // The backend doesn't guarantee answerOptions arrive in a scrambled order —
  // shuffle client-side so the exercise is never trivially "already solved",
  // unless the candidate already answered (restore their saved order instead).
  const [order, setOrder] = useState(() => initialOrder(question))
  const mutation = usePostApiExamAnswer()
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  function persist(next: ExamAnswerOption[]) {
    mutation.mutate({
      data: {
        attemptId,
        questionId: question.id!,
        orderedAnswer: JSON.stringify(next.map((o) => o.id)),
      },
    })
  }

  function onDrop(targetIndex: number) {
    const from = dragIndex
    setDragOverIndex(null)
    if (from === null || from === targetIndex) return
    const next = [...order]
    const [moved] = next.splice(from, 1)
    next.splice(targetIndex, 0, moved)
    setOrder(next)
    onAnswered?.()
    persist(next)
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-muted-foreground">Перетащите слова в нужном порядке</p>
      <div
        className="flex flex-wrap gap-2 rounded-lg border border-dashed border-border p-3"
        data-testid={`ordered-question-${question.id}`}
      >
        {order.map((option, index) => (
          <div
            key={option.id}
            draggable
            onDragStart={() => {
              setDragIndex(index)
            }}
            onDragEnd={() => {
              setDragIndex(null)
              setDragOverIndex(null)
            }}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOverIndex(index)
            }}
            onDrop={(e) => {
              e.preventDefault()
              onDrop(index)
            }}
            className="flex cursor-grab items-center gap-2 rounded-lg bg-secondary py-2 pr-3.5 pl-2.5 text-sm ring-1 ring-foreground/10 transition-transform select-none active:cursor-grabbing"
            data-testid={`ordered-option-${option.id}`}
            style={{ opacity: dragOverIndex === index && dragIndex !== index ? 0.5 : 1 }}
          >
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-background text-[10px] font-medium text-muted-foreground">
              {index + 1}
            </span>
            <span aria-hidden className="text-muted-foreground/60">
              ⠿
            </span>
            {option.content}
          </div>
        ))}
      </div>
    </div>
  )
}
