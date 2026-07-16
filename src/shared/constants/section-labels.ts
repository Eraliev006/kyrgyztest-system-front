import { SectionType } from '@/shared/api/generated/kyrgyzTestAPI.schemas'

export const sectionLabels: Record<SectionType, string> = {
  [SectionType.Grammar]: 'Грамматика',
  [SectionType.Listening]: 'Аудирование',
  [SectionType.Reading]: 'Чтение',
  [SectionType.Writing]: 'Письмо',
  [SectionType.Speaking]: 'Говорение',
}
