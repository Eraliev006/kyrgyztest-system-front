import api from './index'
import type { Candidate, CreateCandidateRequest } from '../types'

export const getAll = () =>
  api.get<Candidate[]>('/candidates')

export const getById = (id: string) =>
  api.get<Candidate>(`/candidates/${id}`)

export const searchByInn = (inn: string) =>
  api.get<Candidate>(`/candidates/search?inn=${inn}`)

export const searchByCode = (code: string) =>
  api.get<Candidate>(`/candidates/search?code=${code}`)

export const create = (dto: CreateCandidateRequest) =>
  api.post<Candidate>('/candidates', dto)

export const allowAccess = (id: string) =>
  api.put<Candidate>(`/candidates/${id}/allow`)

export const remove = (id: string) =>
  api.delete(`/candidates/${id}`)