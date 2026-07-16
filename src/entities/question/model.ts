import type {
  QuestionResponseDto,
  CreateQuestionDto,
  CreateAnswerOptionDto,
  AnswerOptionResponseDto,
} from '@/shared/api/generated/kyrgyzTestAPI.schemas'
import { QuestionType } from '@/shared/api/generated/kyrgyzTestAPI.schemas'

export type Question = QuestionResponseDto
export type AnswerOption = AnswerOptionResponseDto
export type { CreateQuestionDto, CreateAnswerOptionDto }

export function isOrderedType(type: QuestionType): boolean {
  return type === QuestionType.WordOrder || type === QuestionType.SentenceOrder
}
