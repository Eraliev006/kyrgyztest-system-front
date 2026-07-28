import type {
  ExaminerQueueItemDto,
  ExaminerReviewDto,
  ExaminerAnswerDto,
} from '@/shared/api/generated/kyrgyzTestAPI.schemas'

export type ExaminerQueueItem = ExaminerQueueItemDto
export type ExaminerReview = ExaminerReviewDto
export type ExaminerAnswer = ExaminerAnswerDto

export function isGraded(answer: ExaminerAnswer): boolean {
  return answer.score !== null && answer.score !== undefined
}
