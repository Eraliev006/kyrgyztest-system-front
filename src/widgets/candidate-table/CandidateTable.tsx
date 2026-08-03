import { useState } from 'react'
import { useGetApiCandidates } from '@/shared/api/generated/candidate/candidate'
import { useGetApiOrganizations } from '@/shared/api/generated/organization/organization'
import { useAuth, UserRole } from '@/entities/account'
import { isBlocked, type Candidate } from '@/entities/candidate'
import { CandidateForm } from '@/features/candidate-crud/CandidateForm'
import { DeleteCandidateDialog } from '@/features/candidate-crud/DeleteCandidateDialog'
import { AccessCodeDisplay } from '@/features/candidate-access-code/AccessCodeDisplay'
import { CandidateAccessActions } from '@/features/candidate-block-toggle/CandidateAccessActions'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { TableSkeletonRows } from '@/shared/ui/table-skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'

const ALL_ORGANIZATIONS = 'all'
const PAGE_SIZE = 20

function CandidateStatus({ candidate }: { candidate: Candidate }) {
  if (isBlocked(candidate)) {
    return (
      <Badge variant="destructive">
        Заблокирован до {new Date(candidate.blockedUntil!).toLocaleDateString('ru-RU')}
      </Badge>
    )
  }
  return candidate.isAllowed ? (
    <Badge variant="success">Доступ открыт</Badge>
  ) : (
    <Badge variant="outline">Доступ закрыт</Badge>
  )
}

export function CandidateTable() {
  const { account } = useAuth()
  const canDelete = account?.role === UserRole.SuperAdmin || account?.role === UserRole.Director
  const [organizationId, setOrganizationId] = useState<string>(ALL_ORGANIZATIONS)
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState<Candidate | undefined>(undefined)
  const [deleting, setDeleting] = useState<Candidate | null>(null)

  const { data: orgsResponse } = useGetApiOrganizations()
  const organizations = orgsResponse?.data ?? []

  const { data: response, isLoading } = useGetApiCandidates({
    organizationId: organizationId === ALL_ORGANIZATIONS ? undefined : organizationId,
    page,
    pageSize: PAGE_SIZE,
  })
  const paged = response?.data
  const candidates = paged?.items ?? []
  const totalPages = paged ? Math.max(1, Math.ceil((paged.totalCount ?? 0) / PAGE_SIZE)) : 1

  function organizationName(id: string | null | undefined) {
    return organizations.find((org) => org.id === id)?.shortName ?? '—'
  }

  return (
    <div className="flex flex-col gap-4">
      <Select
        items={{
          [ALL_ORGANIZATIONS]: 'Все организации',
          ...Object.fromEntries(organizations.map((org) => [org.id!, org.shortName!])),
        }}
        value={organizationId}
        onValueChange={(value) => {
          setOrganizationId(value as string)
          setPage(1)
        }}
      >
        <SelectTrigger className="w-64">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_ORGANIZATIONS}>Все организации</SelectItem>
          {organizations.map((org) => (
            <SelectItem key={org.id} value={org.id!}>
              {org.shortName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Table data-testid="candidates-table">
        <TableHeader>
          <TableRow>
            <TableHead>ФИО</TableHead>
            <TableHead>ИНН</TableHead>
            <TableHead>Организация</TableHead>
            <TableHead>Код доступа</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead className="w-0" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && <TableSkeletonRows columns={6} />}
          {!isLoading && candidates.length === 0 && (
            <TableRow>
              <TableCell colSpan={6}>Кандидатов пока нет</TableCell>
            </TableRow>
          )}
          {candidates.map((candidate) => (
            <TableRow key={candidate.id} data-testid={`candidate-row-${candidate.id}`}>
              <TableCell>{candidate.fullName}</TableCell>
              <TableCell>{candidate.inn}</TableCell>
              <TableCell>{organizationName(candidate.organizationId)}</TableCell>
              <TableCell>
                <AccessCodeDisplay code={candidate.accessCode ?? ''} />
              </TableCell>
              <TableCell>
                <CandidateStatus candidate={candidate} />
              </TableCell>
              <TableCell className="flex items-center justify-end gap-2">
                <CandidateAccessActions candidate={candidate} />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditing(candidate)}
                  data-testid={`candidate-row-${candidate.id}-edit`}
                >
                  Изменить
                </Button>
                {canDelete && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleting(candidate)}
                    data-testid={`candidate-row-${candidate.id}-delete`}
                  >
                    Удалить
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
          data-testid="candidates-prev-page"
        >
          Назад
        </Button>
        <span className="text-sm text-muted-foreground" data-testid="candidates-page-indicator">
          Страница {page} из {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
          data-testid="candidates-next-page"
        >
          Вперёд
        </Button>
      </div>

      {editing && (
        <CandidateForm
          open={!!editing}
          onOpenChange={(open) => !open && setEditing(undefined)}
          candidate={editing}
        />
      )}
      {deleting && (
        <DeleteCandidateDialog
          open={!!deleting}
          onOpenChange={(open) => !open && setDeleting(null)}
          candidate={deleting}
        />
      )}
    </div>
  )
}
