import api from './index'
import type { ExamResult, StatsResponse, AttemptAnswerDetailDto } from '../types'

export interface ResultsFilters {
  organizationId?: string
  level?: string
  from?: string
  to?: string
}

export const getAll = (params: ResultsFilters) =>
  api.get<ExamResult[]>('/results', { params })

export const getStats = (params: { organizationId?: string; from?: string; to?: string }) =>
  api.get<StatsResponse>('/results/stats', { params })

export const getDetails = (attemptId: string) =>
  api.get<AttemptAnswerDetailDto[]>(`/results/${attemptId}/details`)
