import api from './index'
import type { Organization, OrganizationPayload } from '../types'

export const getAll = () =>
  api.get<Organization[]>('/organizations')

export const create = (data: OrganizationPayload) =>
  api.post<Organization>('/organizations', data)

export const update = (id: string, data: OrganizationPayload) =>
  api.put<Organization>(`/organizations/${id}`, data)

export const remove = (id: string) =>
  api.delete(`/organizations/${id}`)
