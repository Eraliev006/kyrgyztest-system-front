import api from './index'
import type { CreateUserRequest, UpdateUserRequest } from '../types'

export const getAll = () => api.get('/user')
export const create = (data: CreateUserRequest) => api.post('/user', data)
export const update = (id: string, data: UpdateUserRequest) => api.put(`/user/${id}`, data)
export const remove = (id: string) => api.delete(`/user/${id}`)
