import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  postApiExamStart,
  postApiExamSectionStart,
  usePostApiExamSectionSubmit,
} from '@/shared/api/generated/exam/exam'
import { SectionType } from '@/shared/api/generated/kyrgyzTestAPI.schemas'
import { sectionLabels } from '@/shared/constants/section-labels'
import { questionTypeLabels } from '@/shared/constants/question-labels'
import {
  findCurrentSection,
  isOpenAnswerQuestion,
  isOrderedQuestion,
  type ExamSection,
} from '@/entities/attempt'
import { getAttemptId, getCandidateId } from '@/shared/lib/attempt-session'
import { ApiError } from '@/shared/api/instance'
import { AudioAnswerInput } from '@/features/exam-answer-submit/AudioAnswerInput'
import { McqAnswerInput } from '@/features/exam-answer-submit/McqAnswerInput'
import { OrderedAnswerInput } from '@/features/exam-answer-submit/OrderedAnswerInput'
import { SubmitSectionButton } from '@/features/exam-section-submit/SubmitSectionButton'
import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'
import { cn } from '@/shared/lib/utils'

type Resolved =
  | { kind: 'redirect'; section: SectionType }
  | { kind: 'finished' }
  | { kind: 'section'; data: ExamSection }

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function questionAnsweredOnLoad(q: {
  selectedOptionId?: string | null
  orderedAnswer?: string | null
  audioAnswerUrl?: string | null
}): boolean {
  return !!(q.selectedOptionId || q.orderedAnswer || q.audioAnswerUrl)
}

function SectionSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-8 w-16" />
      </div>
      <div className="flex flex-col gap-2 rounded-md border p-4">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-2/3" />
      </div>
    </div>
  )
}

export function ExamSectionRunner() {
  const { sectionCode } = useParams<{ sectionCode: string }>()
  const navigate = useNavigate()
  const attemptId = getAttemptId()!
  const candidateId = getCandidateId()!
  const sectionSubmitMutation = usePostApiExamSectionSubmit()

  const query = useQuery({
    queryKey: ['exam-section', attemptId, sectionCode],
    queryFn: async (): Promise<Resolved> => {
      const startResult = await postApiExamStart({ candidateId })
      const current = findCurrentSection(startResult.data.sections ?? [])
      if (!current) return { kind: 'finished' }
      if (current.section !== sectionCode) {
        return { kind: 'redirect', section: current.section! }
      }
      const sectionResult = await postApiExamSectionStart({
        attemptId,
        section: current.section!,
      })
      return { kind: 'section', data: sectionResult.data }
    },
  })

  useEffect(() => {
    if (query.data?.kind === 'redirect') {
      navigate(`/exam/section/${query.data.section}`, { replace: true })
    } else if (query.data?.kind === 'finished') {
      navigate('/exam/finish', { replace: true })
    }
  }, [query.data, navigate])

  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault()
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [])

  const section = query.data?.kind === 'section' ? query.data.data : null

  function submitSection() {
    if (sectionSubmitMutation.isPending || !section) return
    sectionSubmitMutation.mutate(
      { data: { attemptId, section: section.section! } },
      {
        onSuccess: (response) => {
          const result = response.data
          if (result.isExamCompleted) {
            navigate('/exam/finish', { state: { result: result.result }, replace: true })
            return
          }
          query.refetch()
        },
        onError: (error) => toast.error(error instanceof ApiError ? error.message : 'Ошибка'),
      },
    )
  }

  const [secondsLeft, setSecondsLeft] = useState<number | null>(null)
  const deadlineUtc = section?.deadlineUtc

  useEffect(() => {
    if (!deadlineUtc) return
    const deadline = new Date(deadlineUtc).getTime()

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((deadline - Date.now()) / 1000))
      setSecondsLeft(remaining)
      if (remaining <= 0) {
        clearInterval(interval)
        submitSection()
      }
    }, 1000)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deadlineUtc])

  if (!section) {
    return (
      <div className="mx-auto w-full max-w-2xl">
        <SectionSkeleton />
      </div>
    )
  }

  const urgent = secondsLeft !== null && secondsLeft < 60
  const low = secondsLeft !== null && secondsLeft < 300

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5" data-testid="exam-section-runner">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">
          {sectionLabels[section.section as SectionType]}
        </h1>
        {secondsLeft !== null && (
          <span
            className={cn(
              'flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-sm tabular-nums',
              urgent
                ? 'border-destructive/30 bg-destructive/10 text-destructive'
                : low
                  ? 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  : 'border-border text-muted-foreground',
            )}
            data-testid="section-timer"
          >
            {formatTime(secondsLeft)}
          </span>
        )}
      </div>

      {/* Keyed by section so navigating to a new section (or the section
          identity otherwise changing) remounts this with fresh state,
          instead of reaching for an effect to reset it by hand. */}
      <SectionQuestions
        key={section.section}
        section={section}
        attemptId={attemptId}
        onSubmit={submitSection}
        isSubmitPending={sectionSubmitMutation.isPending}
      />
    </div>
  )
}

function SectionQuestions({
  section,
  attemptId,
  onSubmit,
  isSubmitPending,
}: {
  section: ExamSection
  attemptId: string
  onSubmit: () => void
  isSubmitPending: boolean
}) {
  const questions = section.questions ?? []
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answeredIds, setAnsweredIds] = useState<Set<string>>(
    () => new Set(questions.filter(questionAnsweredOnLoad).map((q) => q.id!)),
  )
  const [visitedIds, setVisitedIds] = useState<Set<string>>(
    () => new Set(questions[0] ? [questions[0].id!] : []),
  )

  function markAnswered(id: string) {
    setAnsweredIds((prev) => (prev.has(id) ? prev : new Set(prev).add(id)))
  }

  function goTo(index: number) {
    const target = questions[index]
    if (target) {
      setVisitedIds((prev) => (prev.has(target.id!) ? prev : new Set(prev).add(target.id!)))
    }
    setCurrentIndex(index)
  }

  const question = questions[currentIndex]
  const isLast = currentIndex === questions.length - 1

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground" data-testid="question-progress-label">
            Вопрос {currentIndex + 1} из {questions.length}
          </span>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-emerald-600" />
              Отвечено
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full border border-amber-500 border-dashed" />
              Пропущено
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5" data-testid="question-progress-dots">
          {questions.map((q, index) => {
            const answered = answeredIds.has(q.id!)
            const isCurrent = index === currentIndex
            const skipped = !answered && !isCurrent && visitedIds.has(q.id!)
            const label = isCurrent
              ? 'Текущий вопрос'
              : answered
                ? 'Отвечено'
                : skipped
                  ? 'Пропущено'
                  : 'Ещё не открывали'
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => goTo(index)}
                title={`Вопрос ${index + 1}: ${label}`}
                data-testid={`question-progress-dot-${index}`}
                className={cn(
                  'flex size-7 items-center justify-center rounded-full border text-xs font-medium transition-colors',
                  answered && 'border-emerald-600 bg-emerald-600 text-white',
                  !answered &&
                    !skipped &&
                    'border-border text-muted-foreground hover:border-foreground/30',
                  skipped && 'border-amber-500 border-dashed text-amber-600 dark:text-amber-400',
                  isCurrent && 'ring-2 ring-ring ring-offset-2 ring-offset-background',
                )}
              >
                {index + 1}
              </button>
            )
          })}
        </div>
      </div>

      {question && (
        <div
          key={question.id}
          className="flex flex-col gap-4 rounded-xl bg-card p-5 ring-1 ring-foreground/10"
          data-testid="current-question"
        >
          <div className="flex items-center gap-2">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-medium text-secondary-foreground">
              {currentIndex + 1}
            </span>
            <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {questionTypeLabels[question.type!]}
            </span>
          </div>
          <p className="text-base font-medium text-balance">{question.content}</p>
          {isOpenAnswerQuestion(question.type) ? (
            <AudioAnswerInput
              attemptId={attemptId}
              question={question}
              onAnswered={() => markAnswered(question.id!)}
            />
          ) : isOrderedQuestion(question.type) ? (
            <OrderedAnswerInput
              attemptId={attemptId}
              question={question}
              onAnswered={() => markAnswered(question.id!)}
            />
          ) : (
            <McqAnswerInput
              attemptId={attemptId}
              question={question}
              onAnswered={() => markAnswered(question.id!)}
            />
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          disabled={currentIndex === 0}
          onClick={() => goTo(currentIndex - 1)}
          data-testid="question-prev-button"
        >
          ← Назад
        </Button>
        {isLast ? (
          <SubmitSectionButton onConfirm={onSubmit} isPending={isSubmitPending} />
        ) : (
          <Button
            type="button"
            onClick={() => goTo(currentIndex + 1)}
            data-testid="question-next-button"
          >
            Далее →
          </Button>
        )}
      </div>
    </div>
  )
}
