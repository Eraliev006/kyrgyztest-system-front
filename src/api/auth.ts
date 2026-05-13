import api from './index'
import type { LoginRequest, TokenResponse } from '../types'

export const login = (dto: LoginRequest) =>
  api.post<TokenResponse>('/auth/login', dto)