import { useState } from 'react'
import { CandidateTable } from '@/widgets/candidate-table/CandidateTable'
import { CandidateForm } from '@/features/candidate-crud/CandidateForm'
import { Button } from '@/shared/ui/button'

export default function CandidatesPage() {
  const [createOpen, setCreateOpen] = useState(false)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Кандидаты</h1>
        <Button onClick={() => setCreateOpen(true)} data-testid="candidate-create-button">
          Добавить кандидата
        </Button>
      </div>

      <CandidateTable />

      <CandidateForm open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
