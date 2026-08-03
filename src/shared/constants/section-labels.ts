import { SectionType } from '@/shared/api/generated/kyrgyzTestAPI.schemas'

export const sectionLabels: Record<SectionType, string> = {
  [SectionType.Grammar]: 'Лексика-грамматика',
  [SectionType.Listening]: 'Угуу',
  [SectionType.Reading]: 'Окуу',
  [SectionType.Writing]: 'Жазуу',
  [SectionType.Speaking]: 'Сүйлөө',
}
