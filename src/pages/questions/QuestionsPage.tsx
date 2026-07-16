import { useState } from 'react'
import { useGetApiQuestions } from '@/shared/api/generated/question/question'
import { SectionType, LanguageLevel } from '@/shared/api/generated/kyrgyzTestAPI.schemas'
import { sectionLabels } from '@/shared/constants/section-labels'
import { languageLevelLabels, questionTypeLabels } from '@/shared/constants/question-labels'
import type { Question } from '@/entities/question'
import { QuestionForm } from '@/features/question-crud/QuestionForm'
import { DeleteQuestionDialog } from '@/features/question-crud/DeleteQuestionDialog'
import { Button } from '@/shared/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { TableSkeletonRows } from '@/shared/ui/table-skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'

const ALL = 'all'

export default function QuestionsPage() {
  const [section, setSection] = useState<string>(ALL)
  const [level, setLevel] = useState<string>(ALL)
  const { data: response, isLoading } = useGetApiQuestions({
    section: section === ALL ? undefined : (section as SectionType),
    level: level === ALL ? undefined : (level as LanguageLevel),
  })
  const questions = response?.data ?? []

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Question | undefined>(undefined)
  const [deleting, setDeleting] = useState<Question | null>(null)

  function openCreate() {
    setEditing(undefined)
    setFormOpen(true)
  }

  function openEdit(question: Question) {
    setEditing(question)
    setFormOpen(true)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Вопросы</h1>
        <Button onClick={openCreate} data-testid="question-create-button">
          Добавить вопрос
        </Button>
      </div>

      <div className="flex gap-3">
        <Select value={section} onValueChange={(v) => setSection(v ?? ALL)}>
          <SelectTrigger className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Все разделы</SelectItem>
            {Object.values(SectionType).map((s) => (
              <SelectItem key={s} value={s}>
                {sectionLabels[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={level} onValueChange={(v) => setLevel(v ?? ALL)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Все уровни</SelectItem>
            {Object.values(LanguageLevel).map((l) => (
              <SelectItem key={l} value={l}>
                {languageLevelLabels[l]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Table data-testid="questions-table">
        <TableHeader>
          <TableRow>
            <TableHead>Текст</TableHead>
            <TableHead>Раздел</TableHead>
            <TableHead>Уровень</TableHead>
            <TableHead>Тип</TableHead>
            <TableHead className="w-0" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && <TableSkeletonRows columns={5} />}
          {!isLoading && questions.length === 0 && (
            <TableRow>
              <TableCell colSpan={5}>Вопросов пока нет</TableCell>
            </TableRow>
          )}
          {questions.map((question) => (
            <TableRow key={question.id} data-testid={`question-row-${question.id}`}>
              <TableCell className="max-w-xs truncate">{question.content}</TableCell>
              <TableCell>{sectionLabels[question.section!]}</TableCell>
              <TableCell>{languageLevelLabels[question.level!]}</TableCell>
              <TableCell>{questionTypeLabels[question.type!]}</TableCell>
              <TableCell className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEdit(question)}
                  data-testid={`question-row-${question.id}-edit`}
                >
                  Изменить
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleting(question)}
                  data-testid={`question-row-${question.id}-delete`}
                >
                  Удалить
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <QuestionForm open={formOpen} onOpenChange={setFormOpen} question={editing} />
      {deleting && (
        <DeleteQuestionDialog
          open={!!deleting}
          onOpenChange={(open) => !open && setDeleting(null)}
          question={deleting}
        />
      )}
    </div>
  )
}
