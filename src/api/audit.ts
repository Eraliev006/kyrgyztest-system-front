import api from './index'
import type { AuditLog } from '../types'

export interface AuditFilters {
  dateFrom?: string
  dateTo?: string
  entityType?: string
}

export const getAuditLogs = (params: AuditFilters) =>
  api.get<AuditLog[]>('/audit', { params })
