import api from './index'
import type { VariantSummary, VariantDetail } from '../types'

export const getAll = () =>
  api.get<VariantSummary[]>('/variants')

export const getById = (id: string) =>
  api.get<VariantDetail>(`/variants/${id}`)

export const replaceQuestion = (variantId: string, questionId: string, newQuestionId: string) =>
  api.put(`/variants/${variantId}/questions/${questionId}`, { newQuestionId })
