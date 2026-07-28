import { useGetApiExaminerReviewAttemptId } from '@/shared/api/generated/examiner/examiner'
import type { ExaminerReviewDto } from '@/shared/api/generated/kyrgyzTestAPI.schemas'
import { GradeAnswerForm } from '@/features/examiner-grade-submit/GradeAnswerForm'
import { Skeleton } from '@/shared/ui/skeleton'

function ReviewSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-8 w-64" />
      <div className="flex flex-col gap-6">
        {[0, 1].map((i) => (
          <div key={i} className="flex flex-col gap-3 rounded-md border p-4">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-8 w-48" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function ExaminerReviewPanel({ attemptId }: { attemptId: string }) {
  const { data: response, isLoading } = useGetApiExaminerReviewAttemptId(attemptId)

  if (isLoading || !response) {
    return <ReviewSkeleton />
  }

  const review = response.data as ExaminerReviewDto

  return (
    <div className="flex flex-col gap-6" data-testid="examiner-review-panel">
      <h1 className="text-2xl font-semibold">{review.candidateFullName}</h1>

      {(review.answers?.length ?? 0) === 0 && <p>Нет вопросов на проверку</p>}

      <div className="flex flex-col gap-6">
        {review.answers?.map((answer) => (
          <div
            key={answer.questionId}
            className="flex flex-col gap-3 rounded-md border p-4"
            data-testid={`review-answer-${answer.questionId}`}
          >
            <p className="font-medium">{answer.content}</p>
            {answer.audioAnswerUrl ? (
              <audio
                controls
                src={answer.audioAnswerUrl}
                data-testid={`review-audio-${answer.questionId}`}
              />
            ) : (
              <p className="text-sm text-muted-foreground">Кандидат не загрузил аудио-ответ</p>
            )}
            <GradeAnswerForm attemptId={attemptId} answer={answer} />
          </div>
        ))}
      </div>
    </div>
  )
}
