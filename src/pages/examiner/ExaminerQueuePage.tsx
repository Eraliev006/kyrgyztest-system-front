import { ExaminerQueueTable } from '@/widgets/examiner-queue-table/ExaminerQueueTable'

export default function ExaminerQueuePage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Очередь на проверку</h1>
      <ExaminerQueueTable />
    </div>
  )
}
