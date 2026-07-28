import { Link } from 'react-router-dom'
import { useGetApiExaminerQueue } from '@/shared/api/generated/examiner/examiner'
import { buttonVariants } from '@/shared/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { TableSkeletonRows } from '@/shared/ui/table-skeleton'
import { cn } from '@/shared/lib/utils'

export function ExaminerQueueTable() {
  const { data: response, isLoading } = useGetApiExaminerQueue()
  const queue = response?.data ?? []

  return (
    <Table data-testid="examiner-queue-table">
      <TableHeader>
        <TableRow>
          <TableHead>Кандидат</TableHead>
          <TableHead>Сдано</TableHead>
          <TableHead>Не проверено</TableHead>
          <TableHead className="w-0" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading && <TableSkeletonRows columns={4} />}
        {!isLoading && queue.length === 0 && (
          <TableRow>
            <TableCell colSpan={4}>Все ответы проверены</TableCell>
          </TableRow>
        )}
        {queue.map((item) => (
          <TableRow key={item.attemptId} data-testid={`queue-row-${item.attemptId}`}>
            <TableCell>{item.candidateFullName}</TableCell>
            <TableCell>{new Date(item.submittedAt!).toLocaleString('ru-RU')}</TableCell>
            <TableCell>{item.ungradedCount}</TableCell>
            <TableCell className="flex justify-end">
              <Link
                to={`/examiner/review/${item.attemptId}`}
                className={cn(buttonVariants({ size: 'sm' }))}
                data-testid={`queue-review-link-${item.attemptId}`}
              >
                Проверить
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
