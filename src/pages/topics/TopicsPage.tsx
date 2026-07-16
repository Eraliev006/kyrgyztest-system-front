import { useState } from 'react'
import { useGetApiTopics } from '@/shared/api/generated/topic/topic'
import { SectionType } from '@/shared/api/generated/kyrgyzTestAPI.schemas'
import { sectionLabels } from '@/shared/constants/section-labels'
import type { Topic } from '@/entities/topic'
import { TopicForm } from '@/features/topic-crud/TopicForm'
import { DeleteTopicDialog } from '@/features/topic-crud/DeleteTopicDialog'
import { Button } from '@/shared/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { TableSkeletonRows } from '@/shared/ui/table-skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'

const ALL_SECTIONS = 'all'

export default function TopicsPage() {
  const [section, setSection] = useState<string>(ALL_SECTIONS)
  const { data: response, isLoading } = useGetApiTopics(
    section === ALL_SECTIONS ? undefined : { section: section as SectionType },
  )
  const topics = response?.data ?? []

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Topic | undefined>(undefined)
  const [deleting, setDeleting] = useState<Topic | null>(null)

  function openCreate() {
    setEditing(undefined)
    setFormOpen(true)
  }

  function openEdit(topic: Topic) {
    setEditing(topic)
    setFormOpen(true)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Темы</h1>
        <Button onClick={openCreate} data-testid="topic-create-button">
          Добавить тему
        </Button>
      </div>

      <Select value={section} onValueChange={(value) => setSection(value ?? ALL_SECTIONS)}>
        <SelectTrigger className="w-64">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_SECTIONS}>Все разделы</SelectItem>
          {Object.values(SectionType).map((s) => (
            <SelectItem key={s} value={s}>
              {sectionLabels[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Table data-testid="topics-table">
        <TableHeader>
          <TableRow>
            <TableHead>Название</TableHead>
            <TableHead>Раздел</TableHead>
            <TableHead className="w-0" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && <TableSkeletonRows columns={3} />}
          {!isLoading && topics.length === 0 && (
            <TableRow>
              <TableCell colSpan={3}>Тем пока нет</TableCell>
            </TableRow>
          )}
          {topics.map((topic) => (
            <TableRow key={topic.id} data-testid={`topic-row-${topic.id}`}>
              <TableCell>{topic.name}</TableCell>
              <TableCell>{topic.sectionType ? sectionLabels[topic.sectionType] : '—'}</TableCell>
              <TableCell className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEdit(topic)}
                  data-testid={`topic-row-${topic.id}-edit`}
                >
                  Изменить
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleting(topic)}
                  data-testid={`topic-row-${topic.id}-delete`}
                >
                  Удалить
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <TopicForm open={formOpen} onOpenChange={setFormOpen} topic={editing} />
      {deleting && (
        <DeleteTopicDialog
          open={!!deleting}
          onOpenChange={(open) => !open && setDeleting(null)}
          topic={deleting}
        />
      )}
    </div>
  )
}
