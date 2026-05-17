import api from './index'
import type { Topic, TopicPayload } from '../types'

export const getAll = (section?: string | number) =>
  api.get<Topic[]>('/topics', {
    params: section !== undefined && section !== '' ? { section } : {}
  })

export const create = (dto: TopicPayload) =>
  api.post<Topic>('/topics', dto)

export const update = (id: string, dto: TopicPayload) =>
  api.put<Topic>(`/topics/${id}`, dto)

export const remove = (id: string) =>
  api.delete(`/topics/${id}`)
