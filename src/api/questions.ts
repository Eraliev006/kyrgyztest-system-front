import api from './index'
import type { QuestionResponse, CreateQuestionRequest, MediaGroupResponse } from '../types'

export const getAll = (section?: string, level?: string) =>
  api.get<QuestionResponse[]>('/questions', { params: { section, level } })

export const getById = (id: string) =>
  api.get<QuestionResponse>(`/questions/${id}`)

export const create = (dto: CreateQuestionRequest) =>
  api.post<QuestionResponse>('/questions', dto)

export const update = (id: string, dto: CreateQuestionRequest) =>
  api.put<QuestionResponse>(`/questions/${id}`, dto)

export const remove = (id: string) =>
  api.delete(`/questions/${id}`)

export const createMediaGroup = (type: number, content: string) =>
  api.post<MediaGroupResponse>('/questions/media-group', { type, content })