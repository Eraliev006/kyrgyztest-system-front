import api from './index'
import type { Candidate, CandidateListResponse, CreateCandidateRequest } from '../types'

export const getAll = () =>
  api.get<{ items: Candidate[]; totalCount: number; page: number; pageSize: number }>('/candidates')

export const listCandidates = (params: {
  organizationId?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  pageSize?: number
}) => api.get<CandidateListResponse>('/candidates', { params })

export const getById = (id: string) =>
  api.get<Candidate>(`/candidates/${id}`)

export const searchByInn = (inn: string) =>
  api.get<Candidate>(`/candidates/search?inn=${inn}`)

export const searchByCode = (code: string) =>
  api.get<Candidate>(`/candidates/search?code=${code}`)

export const searchByFullName = (fullName: string) =>
  api.get<Candidate[]>(`/candidates/search?fullName=${encodeURIComponent(fullName)}`)

export const create = (dto: CreateCandidateRequest) =>
  api.post<Candidate>('/candidates', dto)

export const allowAccess = (id: string) =>
  api.put<Candidate>(`/candidates/${id}/allow`)

export const denyAccess = (id: string) =>
  api.put<Candidate>(`/candidates/${id}/deny`)

export const blockCandidate = (id: string, dto: { value: number; unit: string }) =>
  api.put<Candidate>(`/candidates/${id}/block`, dto)

export const uploadPhoto = (id: string, photo: string) =>
  api.put(`/candidates/${id}/photo`, { photo })

export const update = (id: string, dto: { fullName: string; inn: string; organizationId?: string }) =>
  api.put<Candidate>(`/candidates/${id}`, dto)

export const remove = (id: string) =>
  api.delete(`/candidates/${id}`)