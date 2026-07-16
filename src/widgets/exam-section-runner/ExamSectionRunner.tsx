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
import { findCurrentSection, isOrderedQuestion, type ExamSection } from '@/entities/attempt'
import { getAttemptId, getCandidateId } from '@/shared/lib/attempt-session'
import { ApiError } from '@/shared/api/instance'
import { McqAnswerInput } from '@/features/exam-answer-submit/McqAnswerInput'
import { OrderedAnswerInput } from '@/features/exam-answer-submit/OrderedAnswerInput'
import { SubmitSectionButton } from '@/features/exam-section-submit/SubmitSectionButton'
import { Skeleton } from '@/shared/ui/skeleton'

type Resolved =
  | { kind: 'redirect'; section: SectionType }
  | { kind: 'finished' }
  | { kind: 'section'; data: ExamSection }

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function SectionSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-8 w-16" />
      </div>
      <div className="flex flex-col gap-6">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex flex-col gap-2 rounded-md border p-4">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-2/3" />
          </div>
        ))}
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

  // Navigation is a side effect of query data, not component state — react-router's
  // navigate() isn't a setState call, so this doesn't hit the same set-state-in-effect
  // concern as fetching would.
  useEffect(() => {
    if (query.data?.kind === 'redirect') {
      navigate(`/exam/section/${query.data.section}`, { replace: true })
    } else if (query.data?.kind === 'finished') {
      // Don't clear the attempt session here — ExamFinishPage is behind
      // ExamAttemptGuard, which checks for it. Cleared when the candidate leaves.
      navigate('/exam/finish', { replace: true })
    }
  }, [query.data, navigate])

  // Hard navigation lock: warn on refresh/close while a section is in progress.
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

  // setState only ever happens inside the interval callback (subscribing to an
  // external clock), never synchronously in the effect body — Date.now()/refs
  // are read there too, not during render.
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null)
  const sectionKey = section?.section

  useEffect(() => {
    if (!section) return
    const startedAt = Date.now()
    const limitSeconds = (section.timeLimitMinutes ?? 0) * 60

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000)
      const remaining = Math.max(0, limitSeconds - elapsed)
      setSecondsLeft(remaining)
      if (remaining <= 0) {
        clearInterval(interval)
        submitSection()
      }
    }, 1000)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionKey])

  if (!section) {
    return <SectionSkeleton />
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{sectionLabels[section.section as SectionType]}</h1>
        {secondsLeft !== null && (
          <span className="font-mono text-lg tabular-nums">{formatTime(secondsLeft)}</span>
        )}
      </div>

      <div className="flex flex-col gap-6">
        {section.questions?.map((question) => (
          <div key={question.id} className="flex flex-col gap-2 rounded-md border p-4">
            <p className="font-medium">{question.content}</p>
            {isOrderedQuestion(question.type) ? (
              <OrderedAnswerInput attemptId={attemptId} question={question} />
            ) : (
              <McqAnswerInput attemptId={attemptId} question={question} />
            )}
          </div>
        ))}
      </div>

      <SubmitSectionButton onConfirm={submitSection} isPending={sectionSubmitMutation.isPending} />
    </div>
  )
}
