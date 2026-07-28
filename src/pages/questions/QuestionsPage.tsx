import { useState } from 'react'
import { useGetApiQuestions } from '@/shared/api/generated/question/question'
import { useGetApiTopics } from '@/shared/api/generated/topic/topic'
import { SectionType, LanguageLevel } from '@/shared/api/generated/kyrgyzTestAPI.schemas'
import { sectionLabels } from '@/shared/constants/section-labels'
import { languageLevelLabels, questionTypeLabels } from '@/shared/constants/question-labels'
import type { Question } from '@/entities/question'
import { QuestionForm } from '@/features/question-crud/QuestionForm'
import { DeleteQuestionDialog } from '@/features/question-crud/DeleteQuestionDialog'
import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'
import { Badge } from '@/shared/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { Accordion, AccordionItem, AccordionTrigger, AccordionPanel } from '@/shared/ui/accordion'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'

const ALL = 'all'
const NO_SECTION = 'none'

function UsageBadge({ count }: { count: number }) {
  return count > 0 ? (
    <Badge variant="success">В вариантах: {count}</Badge>
  ) : (
    <Badge variant="outline">Не использовался</Badge>
  )
}

export default function QuestionsPage() {
  const [level, setLevel] = useState<string>(ALL)
  const { data: topicsResponse, isLoading: topicsLoading } = useGetApiTopics()
  const { data: questionsResponse, isLoading: questionsLoading } = useGetApiQuestions({
    level: level === ALL ? undefined : (level as LanguageLevel),
  })
  const topics = topicsResponse?.data ?? []
  const questions = questionsResponse?.data ?? []
  const isLoading = topicsLoading || questionsLoading

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

  const questionsByTopicId = new Map<string, Question[]>()
  const looseQuestionsBySection = new Map<SectionType, Question[]>()
  for (const q of questions) {
    if (q.topicId) {
      const list = questionsByTopicId.get(q.topicId)
      if (list) list.push(q)
      else questionsByTopicId.set(q.topicId, [q])
    } else if (q.section) {
      const list = looseQuestionsBySection.get(q.section)
      if (list) list.push(q)
      else looseQuestionsBySection.set(q.section, [q])
    }
  }

  const sectionedTopics = Object.values(SectionType).map((section) => ({
    section,
    topics: topics.filter((t) => t.sectionType === section),
    looseQuestions: looseQuestionsBySection.get(section) ?? [],
  }))
  const unsectionedTopics = topics.filter((t) => !t.sectionType)
  const unsectionedQuestions = unsectionedTopics.flatMap((t) => questionsByTopicId.get(t.id!) ?? [])

  function renderQuestionsTable(qs: Question[]) {
    if (qs.length === 0) {
      return <p className="px-4 pb-3 text-sm text-muted-foreground">Вопросов пока нет</p>
    }
    return (
      <div className="max-h-72 overflow-y-auto px-4 pb-3">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Текст</TableHead>
              <TableHead>Уровень</TableHead>
              <TableHead>Тип</TableHead>
              <TableHead>Использование</TableHead>
              <TableHead className="w-0" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {qs.map((question) => (
              <TableRow key={question.id} data-testid={`question-row-${question.id}`}>
                <TableCell className="max-w-xs truncate">{question.content}</TableCell>
                <TableCell>{languageLevelLabels[question.level!]}</TableCell>
                <TableCell>{questionTypeLabels[question.type!]}</TableCell>
                <TableCell>
                  <UsageBadge count={question.usedInVariantCount ?? 0} />
                </TableCell>
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
      </div>
    )
  }

  const hasAnyQuestions = questions.length > 0

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Вопросы</h1>
        <Button onClick={openCreate} data-testid="question-create-button">
          Добавить вопрос
        </Button>
      </div>

      <Select
        items={{ [ALL]: 'Все уровни', ...languageLevelLabels }}
        value={level}
        onValueChange={(v) => setLevel(v ?? ALL)}
      >
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

      {isLoading && (
        <div className="flex flex-col gap-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      )}

      {!isLoading && !hasAnyQuestions && (
        <p className="text-sm text-muted-foreground">Вопросов пока нет</p>
      )}

      {!isLoading && hasAnyQuestions && (
        <Accordion data-testid="questions-accordion">
          {sectionedTopics
            .filter(({ topics: t, looseQuestions }) => {
              const sectionQuestions = [
                ...t.flatMap((topic) => questionsByTopicId.get(topic.id!) ?? []),
                ...looseQuestions,
              ]
              return sectionQuestions.length > 0
            })
            .map(({ section, topics: sectionTopics, looseQuestions }) => {
              const sectionQuestions = [
                ...sectionTopics.flatMap((t) => questionsByTopicId.get(t.id!) ?? []),
                ...looseQuestions,
              ]
              return (
                <AccordionItem key={section} value={section}>
                  <AccordionTrigger data-testid={`questions-section-${section}`}>
                    {sectionLabels[section]}
                    <span className="text-muted-foreground">
                      {sectionQuestions.length} вопросов
                    </span>
                  </AccordionTrigger>
                  <AccordionPanel>
                    <div className="flex flex-col gap-2 px-4 pb-3">
                      <Accordion>
                        {sectionTopics
                          .filter((t) => (questionsByTopicId.get(t.id!) ?? []).length > 0)
                          .map((topic) => {
                            const topicQuestions = questionsByTopicId.get(topic.id!) ?? []
                            return (
                              <AccordionItem key={topic.id} value={topic.id!}>
                                <AccordionTrigger data-testid={`questions-topic-${topic.id}`}>
                                  {topic.name}
                                  <span className="text-muted-foreground">
                                    {topicQuestions.length} вопросов
                                  </span>
                                </AccordionTrigger>
                                <AccordionPanel>
                                  {renderQuestionsTable(topicQuestions)}
                                </AccordionPanel>
                              </AccordionItem>
                            )
                          })}
                        {looseQuestions.length > 0 && (
                          <AccordionItem value={`${section}-no-topic`}>
                            <AccordionTrigger data-testid={`questions-section-${section}-no-topic`}>
                              Без темы
                              <span className="text-muted-foreground">
                                {looseQuestions.length} вопросов
                              </span>
                            </AccordionTrigger>
                            <AccordionPanel>{renderQuestionsTable(looseQuestions)}</AccordionPanel>
                          </AccordionItem>
                        )}
                      </Accordion>
                    </div>
                  </AccordionPanel>
                </AccordionItem>
              )
            })}

          {unsectionedQuestions.length > 0 && (
            <AccordionItem value={NO_SECTION}>
              <AccordionTrigger data-testid="questions-section-none">
                Без раздела
                <span className="text-muted-foreground">
                  {unsectionedQuestions.length} вопросов
                </span>
              </AccordionTrigger>
              <AccordionPanel>
                <div className="flex flex-col gap-2 px-4 pb-3">
                  <Accordion>
                    {unsectionedTopics
                      .filter((t) => (questionsByTopicId.get(t.id!) ?? []).length > 0)
                      .map((topic) => {
                        const topicQuestions = questionsByTopicId.get(topic.id!) ?? []
                        return (
                          <AccordionItem key={topic.id} value={topic.id!}>
                            <AccordionTrigger data-testid={`questions-topic-${topic.id}`}>
                              {topic.name}
                              <span className="text-muted-foreground">
                                {topicQuestions.length} вопросов
                              </span>
                            </AccordionTrigger>
                            <AccordionPanel>{renderQuestionsTable(topicQuestions)}</AccordionPanel>
                          </AccordionItem>
                        )
                      })}
                  </Accordion>
                </div>
              </AccordionPanel>
            </AccordionItem>
          )}
        </Accordion>
      )}

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
