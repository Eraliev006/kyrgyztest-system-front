import { UserRole } from '@/shared/api/generated/kyrgyzTestAPI.schemas'
import type { LoginResponseDto } from '@/shared/api/generated/kyrgyzTestAPI.schemas'

export { UserRole }

export interface Account {
  fullName: string
  login: string
  role: UserRole
}

// LoginResponseDto's fields are all optional/nullable at the wire type (the
// backend declares Role as plain `string`, not the UserRole enum, and
// Swashbuckle can't tell any of these are actually always-present) — but the
// login endpoint only ever succeeds with all four populated, so this narrows
// once at the boundary rather than making every consumer re-check nullability.
export function toLoginResponse(dto: LoginResponseDto): LoginResponse {
  return {
    accessToken: dto.accessToken!,
    fullName: dto.fullName!,
    login: dto.login!,
    role: dto.role as UserRole,
  }
}

export interface LoginResponse extends Account {
  accessToken: string
}
