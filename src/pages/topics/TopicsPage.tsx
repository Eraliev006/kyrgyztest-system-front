import { useState } from 'react'
import { useGetApiTopics } from '@/shared/api/generated/topic/topic'
import { useGetApiQuestions } from '@/shared/api/generated/question/question'
import { SectionType } from '@/shared/api/generated/kyrgyzTestAPI.schemas'
import { sectionLabels } from '@/shared/constants/section-labels'
import { languageLevelLabels, questionTypeLabels } from '@/shared/constants/question-labels'
import type { Topic } from '@/entities/topic'
import type { Question } from '@/entities/question'
import { TopicForm } from '@/features/topic-crud/TopicForm'
import { DeleteTopicDialog } from '@/features/topic-crud/DeleteTopicDialog'
import { QuestionForm } from '@/features/question-crud/QuestionForm'
import { DeleteQuestionDialog } from '@/features/question-crud/DeleteQuestionDialog'
import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'
import { Badge } from '@/shared/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { Accordion, AccordionItem, AccordionTrigger, AccordionPanel } from '@/shared/ui/accordion'

function UsageBadge({ count }: { count: number }) {
  return count > 0 ? (
    <Badge variant="success">В вариантах: {count}</Badge>
  ) : (
    <Badge variant="outline">Не использовался</Badge>
  )
}

function usedCount(qs: Question[]) {
  return qs.filter((q) => (q.usedInVariantCount ?? 0) > 0).length
}

const NO_SECTION = 'none'

export default function TopicsPage() {
  const { data: topicsResponse, isLoading: topicsLoading } = useGetApiTopics()
  const { data: questionsResponse, isLoading: questionsLoading } = useGetApiQuestions()
  const topics = topicsResponse?.data ?? []
  const questions = questionsResponse?.data ?? []
  const isLoading = topicsLoading || questionsLoading

  const [topicFormOpen, setTopicFormOpen] = useState(false)
  const [editingTopic, setEditingTopic] = useState<Topic | undefined>(undefined)
  const [deletingTopic, setDeletingTopic] = useState<Topic | null>(null)
  const [questionFormOpen, setQuestionFormOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | undefined>(undefined)
  const [deletingQuestion, setDeletingQuestion] = useState<Question | null>(null)

  function openCreateTopic() {
    setEditingTopic(undefined)
    setTopicFormOpen(true)
  }
  function openEditTopic(topic: Topic) {
    setEditingTopic(topic)
    setTopicFormOpen(true)
  }
  function openEditQuestion(question: Question) {
    setEditingQuestion(question)
    setQuestionFormOpen(true)
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
                    onClick={() => openEditQuestion(question)}
                    data-testid={`question-row-${question.id}-edit`}
                  >
                    Изменить
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeletingQuestion(question)}
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

  function renderTopicItem(topic: Topic) {
    const topicQuestions = questionsByTopicId.get(topic.id!) ?? []
    return (
      <AccordionItem key={topic.id} value={topic.id!}>
        <AccordionTrigger data-testid={`topic-row-${topic.id}`}>
          {topic.name}
          <span className="text-muted-foreground">
            {usedCount(topicQuestions)}/{topicQuestions.length} использ.
          </span>
        </AccordionTrigger>
        <AccordionPanel>
          <div className="flex justify-end gap-2 px-4 pb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => openEditTopic(topic)}
              data-testid={`topic-row-${topic.id}-edit`}
            >
              Изменить тему
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeletingTopic(topic)}
              data-testid={`topic-row-${topic.id}-delete`}
            >
              Удалить тему
            </Button>
          </div>
          {renderQuestionsTable(topicQuestions)}
        </AccordionPanel>
      </AccordionItem>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Темы</h1>
        <Button onClick={openCreateTopic} data-testid="topic-create-button">
          Добавить тему
        </Button>
      </div>

      {isLoading && (
        <div className="flex flex-col gap-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      )}

      {!isLoading && topics.length === 0 && questions.length === 0 && (
        <p className="text-sm text-muted-foreground">Тем пока нет</p>
      )}

      {!isLoading && (topics.length > 0 || questions.length > 0) && (
        <Accordion data-testid="topics-accordion">
          {sectionedTopics
            .filter(({ topics: t, looseQuestions }) => t.length > 0 || looseQuestions.length > 0)
            .map(({ section, topics: sectionTopics, looseQuestions }) => {
              const sectionQuestions = [
                ...sectionTopics.flatMap((t) => questionsByTopicId.get(t.id!) ?? []),
                ...looseQuestions,
              ]
              return (
                <AccordionItem key={section} value={section}>
                  <AccordionTrigger data-testid={`section-group-${section}`}>
                    {sectionLabels[section]}
                    <span className="text-muted-foreground">
                      {sectionTopics.length} тем · {usedCount(sectionQuestions)}/
                      {sectionQuestions.length} использ.
                    </span>
                  </AccordionTrigger>
                  <AccordionPanel>
                    <div className="flex flex-col gap-2 px-4 pb-3">
                      <Accordion>
                        {sectionTopics.map(renderTopicItem)}
                        {looseQuestions.length > 0 && (
                          <AccordionItem value={`${section}-no-topic`}>
                            <AccordionTrigger data-testid={`section-group-${section}-no-topic`}>
                              Без темы
                              <span className="text-muted-foreground">
                                {usedCount(looseQuestions)}/{looseQuestions.length} использ.
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

          {unsectionedTopics.length > 0 && (
            <AccordionItem value={NO_SECTION}>
              <AccordionTrigger data-testid="section-group-none">
                Без раздела
                <span className="text-muted-foreground">{unsectionedTopics.length} тем</span>
              </AccordionTrigger>
              <AccordionPanel>
                <div className="flex flex-col gap-2 px-4 pb-3">
                  <Accordion>{unsectionedTopics.map(renderTopicItem)}</Accordion>
                </div>
              </AccordionPanel>
            </AccordionItem>
          )}
        </Accordion>
      )}

      <TopicForm open={topicFormOpen} onOpenChange={setTopicFormOpen} topic={editingTopic} />
      {deletingTopic && (
        <DeleteTopicDialog
          open={!!deletingTopic}
          onOpenChange={(open) => !open && setDeletingTopic(null)}
          topic={deletingTopic}
        />
      )}
      <QuestionForm
        open={questionFormOpen}
        onOpenChange={setQuestionFormOpen}
        question={editingQuestion}
      />
      {deletingQuestion && (
        <DeleteQuestionDialog
          open={!!deletingQuestion}
          onOpenChange={(open) => !open && setDeletingQuestion(null)}
          question={deletingQuestion}
        />
      )}
    </div>
  )
}
