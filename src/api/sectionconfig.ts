import api from './index'
import type { SectionConfig, SectionConfigPayload } from '../types'

export const getAll = () =>
  api.get<SectionConfig[]>('/section-config')

export const create = (data: SectionConfigPayload) =>
  api.post<SectionConfig>('/section-config', data)

export const update = (id: string, data: SectionConfigPayload) =>
  api.put<SectionConfig>(`/section-config/${id}`, data)
