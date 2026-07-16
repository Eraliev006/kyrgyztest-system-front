import { useGetApiCandidatesActiveAttempts } from '@/shared/api/generated/candidate/candidate'
import { sectionLabels } from '@/shared/constants/section-labels'
import type { ActiveAttempt } from '@/entities/attempt'
import type { SectionType } from '@/shared/api/generated/kyrgyzTestAPI.schemas'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { TableSkeletonRows } from '@/shared/ui/table-skeleton'

function timeRemaining(deadlineUtc: string | null | undefined): string {
  if (!deadlineUtc) return '—'
  const seconds = Math.max(0, Math.floor((new Date(deadlineUtc).getTime() - Date.now()) / 1000))
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function Row({ attempt }: { attempt: ActiveAttempt }) {
  return (
    <TableRow data-testid={`monitoring-row-${attempt.attemptId}`}>
      <TableCell>
        {attempt.photo ? (
          <img
            src={attempt.photo}
            alt={attempt.fullName ?? ''}
            className="size-10 rounded-md object-cover"
          />
        ) : (
          <div className="size-10 rounded-md border" />
        )}
      </TableCell>
      <TableCell>{attempt.fullName}</TableCell>
      <TableCell>
        {attempt.currentSection ? sectionLabels[attempt.currentSection as SectionType] : '—'}
      </TableCell>
      <TableCell
        className="font-mono tabular-nums"
        data-testid={`monitoring-row-${attempt.attemptId}-time`}
      >
        {timeRemaining(attempt.sectionDeadlineUtc)}
      </TableCell>
    </TableRow>
  )
}

export function LiveMonitoringTable() {
  const { data: response, isLoading } = useGetApiCandidatesActiveAttempts({
    query: { refetchInterval: 5000 },
  })
  const attempts = response?.data ?? []

  return (
    <Table data-testid="live-monitoring-table">
      <TableHeader>
        <TableRow>
          <TableHead>Фото</TableHead>
          <TableHead>ФИО</TableHead>
          <TableHead>Текущий раздел</TableHead>
          <TableHead>Осталось времени</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading && <TableSkeletonRows columns={4} />}
        {!isLoading && attempts.length === 0 && (
          <TableRow>
            <TableCell colSpan={4}>Сейчас никто не проходит тест</TableCell>
          </TableRow>
        )}
        {attempts.map((attempt) => (
          <Row key={attempt.attemptId} attempt={attempt} />
        ))}
      </TableBody>
    </Table>
  )
}
