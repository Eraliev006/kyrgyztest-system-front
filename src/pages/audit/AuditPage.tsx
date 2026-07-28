import { useState } from 'react'
import { useGetApiAudit } from '@/shared/api/generated/audit/audit'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Badge } from '@/shared/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { TableSkeletonRows } from '@/shared/ui/table-skeleton'

const actionTone: Record<string, 'destructive' | 'success' | 'secondary'> = {
  DELETE: 'destructive',
  CREATE: 'success',
}

export default function AuditPage() {
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [entityType, setEntityType] = useState('')

  const { data: response, isLoading } = useGetApiAudit({
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    entityType: entityType.trim() || undefined,
  })
  const logs = response?.data ?? []

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Аудит</h1>

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="audit-date-from">Дата с</Label>
          <Input
            id="audit-date-from"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            data-testid="audit-date-from"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="audit-date-to">Дата по</Label>
          <Input
            id="audit-date-to"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            data-testid="audit-date-to"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="audit-entity-type">Тип сущности</Label>
          <Input
            id="audit-entity-type"
            placeholder="TestVariant, Organization..."
            value={entityType}
            onChange={(e) => setEntityType(e.target.value)}
            className="w-48"
            data-testid="audit-entity-type"
          />
        </div>
      </div>

      <Table data-testid="audit-table">
        <TableHeader>
          <TableRow>
            <TableHead>Когда</TableHead>
            <TableHead>Кто</TableHead>
            <TableHead>Действие</TableHead>
            <TableHead>Сущность</TableHead>
            <TableHead>Описание</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && <TableSkeletonRows columns={5} />}
          {!isLoading && logs.length === 0 && (
            <TableRow>
              <TableCell colSpan={5}>Записей не найдено</TableCell>
            </TableRow>
          )}
          {logs.map((log) => (
            <TableRow key={log.id} data-testid={`audit-row-${log.id}`}>
              <TableCell className="text-muted-foreground">
                {new Date(log.createdAt!).toLocaleString('ru-RU')}
              </TableCell>
              <TableCell>{log.userName}</TableCell>
              <TableCell>
                <Badge variant={actionTone[log.action!] ?? 'secondary'}>{log.action}</Badge>
              </TableCell>
              <TableCell className="font-mono text-sm">{log.entityType}</TableCell>
              <TableCell>{log.description}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
