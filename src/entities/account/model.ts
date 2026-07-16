import { UserRole } from '@/shared/api/generated/kyrgyzTestAPI.schemas'

export { UserRole }

// The backend's /api/auth/login action isn't annotated with
// [ProducesResponseType], so Swagger documents no response body and Orval
// generates `void` for it. Typed by hand from LoginResponseDto until the
// backend annotation is added and this can be generated instead.
export interface Account {
  fullName: string
  login: string
  role: UserRole
}

export interface LoginResponse extends Account {
  accessToken: string
}
