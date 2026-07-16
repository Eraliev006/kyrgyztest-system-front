import { QuestionType, LanguageLevel } from '@/shared/api/generated/kyrgyzTestAPI.schemas'

export const questionTypeLabels: Record<QuestionType, string> = {
  [QuestionType.MCQ]: 'Один правильный ответ',
  [QuestionType.WordOrder]: 'Порядок слов',
  [QuestionType.SentenceOrder]: 'Порядок предложений',
}

export const languageLevelLabels: Record<LanguageLevel, string> = {
  [LanguageLevel.A1]: 'A1',
  [LanguageLevel.A2]: 'A2',
  [LanguageLevel.B1]: 'B1',
  [LanguageLevel.B2]: 'B2',
}

export const orderedQuestionTypes: QuestionType[] = [
  QuestionType.WordOrder,
  QuestionType.SentenceOrder,
]
