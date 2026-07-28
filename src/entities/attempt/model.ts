import type {
  StartExamResultDto,
  ExamSectionDto,
  ExamQuestionDto,
  ExamAnswerOptionDto,
  SubmitSectionResultDto,
  ActiveAttemptDto,
} from '@/shared/api/generated/kyrgyzTestAPI.schemas'
import { QuestionType } from '@/shared/api/generated/kyrgyzTestAPI.schemas'

export type StartExamResult = StartExamResultDto
export type ExamSection = ExamSectionDto
export type ExamQuestion = ExamQuestionDto
export type ExamAnswerOption = ExamAnswerOptionDto
export type SubmitSectionResult = SubmitSectionResultDto
export type ActiveAttempt = ActiveAttemptDto

export function isOrderedQuestion(type: QuestionType | undefined): boolean {
  return type === QuestionType.WordOrder || type === QuestionType.SentenceOrder
}

export function isOpenAnswerQuestion(type: QuestionType | undefined): boolean {
  return type === QuestionType.OpenAnswer
}

/** First section the candidate hasn't completed yet, or null if all done. */
export function findCurrentSection(sections: ExamSection[]): ExamSection | null {
  return sections.find((s) => !s.isCompleted) ?? null
}
