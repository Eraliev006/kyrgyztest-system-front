import { UserRole } from '@/shared/api/generated/kyrgyzTestAPI.schemas'

export const roleLabels: Record<UserRole, string> = {
  [UserRole.SuperAdmin]: 'Супер-админ',
  [UserRole.Director]: 'Директор',
  [UserRole.Admin]: 'Админ',
  [UserRole.Examiner]: 'Экзаменатор',
  [UserRole.Expert]: 'Эксперт',
}
