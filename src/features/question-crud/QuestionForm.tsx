import { useEffect, useRef } from 'react'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { PlusIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon } from 'lucide-react'
import {
  usePostApiQuestions,
  usePutApiQuestionsId,
  usePostApiQuestionsMediaGroup,
  getGetApiQuestionsQueryKey,
} from '@/shared/api/generated/question/question'
import { useGetApiTopics } from '@/shared/api/generated/topic/topic'
import { usePostApiFilesAudio } from '@/shared/api/generated/file/file'
import {
  SectionType,
  LanguageLevel,
  QuestionType,
  MediaType,
} from '@/shared/api/generated/kyrgyzTestAPI.schemas'
import { sectionLabels } from '@/shared/constants/section-labels'
import { questionTypeLabels, languageLevelLabels } from '@/shared/constants/question-labels'
import { isOrderedType, type Question } from '@/entities/question'
import { ApiError } from '@/shared/api/instance'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { Label } from '@/shared/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/ui/tabs'

const NO_TOPIC = 'none'
const NO_MEDIA = 'none'

const mediaTypeLabels: Record<string, string> = {
  [NO_MEDIA]: 'Без материала',
  [MediaType.Text]: 'Текст',
  [MediaType.Audio]: 'Аудио',
}

function sectionMediaType(section: SectionType): typeof NO_MEDIA | MediaType {
  if (section === SectionType.Listening) return MediaType.Audio
  if (section === SectionType.Reading) return MediaType.Text
  return NO_MEDIA
}

const sectionAllowedTypes: Record<SectionType, QuestionType[]> = {
  [SectionType.Grammar]: [QuestionType.MCQ],
  [SectionType.Listening]: [QuestionType.MCQ],
  [SectionType.Reading]: [QuestionType.MCQ],
  [SectionType.Writing]: [QuestionType.WordOrder, QuestionType.SentenceOrder],
  [SectionType.Speaking]: [QuestionType.OpenAnswer],
}

function AudioMediaField({
  value,
  onChange,
  error,
}: {
  value: string
  onChange: (value: string) => void
  error?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  const uploadMutation = usePostApiFilesAudio({
    mutation: {
      onSuccess: (result) => {
        if (result.status !== 200) return
        onChange(result.data.url!)
        toast.success('Аудио загружено')
      },
      onError: (error) =>
        toast.error(error instanceof ApiError ? error.message : 'Не удалось загрузить файл'),
    },
  })

  function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    uploadMutation.mutate({ data: { file } })
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label>Материал: Аудио</Label>
      <Tabs defaultValue="url">
        <TabsList>
          <TabsTrigger value="url">Ссылка</TabsTrigger>
          <TabsTrigger value="file">Загрузить файл</TabsTrigger>
        </TabsList>
        <TabsContent value="url">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://..."
          />
        </TabsContent>
        <TabsContent value="file">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="file"
              accept="audio/mpeg,audio/wav,audio/ogg"
              className="hidden"
              onChange={onFileSelected}
              data-testid="question-audio-file-input"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploadMutation.isPending}
              onClick={() => inputRef.current?.click()}
            >
              {uploadMutation.isPending ? 'Загрузка...' : 'Выбрать mp3/wav/ogg'}
            </Button>
            {value && <span className="truncate text-sm text-muted-foreground">{value}</span>}
          </div>
        </TabsContent>
      </Tabs>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}

const questionSchema = z
  .object({
    section: z.nativeEnum(SectionType),
    level: z.nativeEnum(LanguageLevel),
    type: z.nativeEnum(QuestionType),
    content: z.string().min(1, 'Обязательное поле'),
    topicId: z.string(),
    mediaType: z.union([z.nativeEnum(MediaType), z.literal(NO_MEDIA)]),
    mediaContent: z.string(),
    answerOptions: z.array(z.object({ content: z.string().min(1, 'Обязательное поле') })),
    correctIndex: z.number().nullable(),
  })
  .refine((data) => data.type === QuestionType.OpenAnswer || data.answerOptions.length >= 1, {
    message: 'Добавьте хотя бы один вариант',
    path: ['answerOptions'],
  })
  .refine((data) => data.type !== QuestionType.MCQ || data.correctIndex !== null, {
    message: 'Выберите правильный вариант',
    path: ['correctIndex'],
  })
  .refine((data) => data.mediaType === NO_MEDIA || data.mediaContent.trim().length > 0, {
    message: 'Заполните содержимое материала',
    path: ['mediaContent'],
  })

type QuestionFormValues = z.infer<typeof questionSchema>

interface QuestionFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  question?: Question
}

export function QuestionForm({ open, onOpenChange, question }: QuestionFormProps) {
  const isEditing = !!question
  const queryClient = useQueryClient()
  const { data: topicsResponse } = useGetApiTopics()
  const allTopics = topicsResponse?.data ?? []

  const {
    register,
    control,
    watch,
    setValue,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      section: SectionType.Grammar,
      level: LanguageLevel.A1,
      type: QuestionType.MCQ,
      content: '',
      topicId: NO_TOPIC,
      mediaType: NO_MEDIA,
      mediaContent: '',
      answerOptions: [{ content: '' }],
      correctIndex: null,
    },
  })

  const { fields, append, remove, move } = useFieldArray({ control, name: 'answerOptions' })
  const type = watch('type')
  const section = watch('section')
  const correctIndex = watch('correctIndex')
  const ordered = isOrderedType(type)
  const topics = allTopics.filter((topic) => topic.sectionType === section)
  const mediaType = sectionMediaType(section)
  const allowedTypes = sectionAllowedTypes[section]
  const typeOptions = allowedTypes.includes(type) ? allowedTypes : [...allowedTypes, type]
  const typeItems = Object.fromEntries(typeOptions.map((t) => [t, questionTypeLabels[t]]))

  useEffect(() => {
    if (!open || isEditing) return
    setValue('mediaType', mediaType)
    if (mediaType === NO_MEDIA) setValue('mediaContent', '')
  }, [open, isEditing, mediaType, setValue])

  useEffect(() => {
    if (!open) return
    if (question) {
      const mcqCorrectIndex = question.answerOptions?.findIndex((o) => o.isCorrect) ?? -1
      reset({
        section: question.section!,
        level: question.level!,
        type: question.type!,
        content: question.content ?? '',
        topicId: question.topicId ?? NO_TOPIC,
        mediaType: NO_MEDIA,
        mediaContent: '',
        answerOptions: (question.answerOptions ?? [{ content: '' }]).map((o) => ({
          content: o.content ?? '',
        })),
        correctIndex:
          question.type === QuestionType.MCQ && mcqCorrectIndex >= 0 ? mcqCorrectIndex : null,
      })
    } else {
      reset({
        section: SectionType.Grammar,
        level: LanguageLevel.A1,
        type: QuestionType.MCQ,
        content: '',
        topicId: NO_TOPIC,
        mediaType: NO_MEDIA,
        mediaContent: '',
        answerOptions: [{ content: '' }],
        correctIndex: null,
      })
    }
  }, [open, question, reset])

  function onSettled() {
    queryClient.invalidateQueries({ queryKey: getGetApiQuestionsQueryKey() })
  }

  const createMediaGroupMutation = usePostApiQuestionsMediaGroup()

  const createMutation = usePostApiQuestions({
    mutation: {
      onSuccess: () => {
        toast.success('Вопрос создан')
        onOpenChange(false)
      },
      onError: (error) => toast.error(error instanceof ApiError ? error.message : 'Ошибка'),
      onSettled,
    },
  })

  const updateMutation = usePutApiQuestionsId({
    mutation: {
      onSuccess: () => {
        toast.success('Вопрос обновлён')
        onOpenChange(false)
      },
      onError: (error) => toast.error(error instanceof ApiError ? error.message : 'Ошибка'),
      onSettled,
    },
  })

  const isPending =
    createMutation.isPending || updateMutation.isPending || createMediaGroupMutation.isPending

  async function onSubmit(values: QuestionFormValues) {
    const answerOptions =
      values.type === QuestionType.OpenAnswer
        ? []
        : values.answerOptions.map((o, index) => ({
            content: o.content,
            orderIndex: index,
            isCorrect: values.type === QuestionType.MCQ ? index === values.correctIndex : true,
          }))

    let mediaGroupId = question?.mediaGroupId ?? undefined
    if (!isEditing && values.mediaType !== NO_MEDIA) {
      try {
        const result = await createMediaGroupMutation.mutateAsync({
          data: { type: values.mediaType, content: values.mediaContent },
        })
        mediaGroupId = result.data.id
      } catch (error) {
        toast.error(error instanceof ApiError ? error.message : 'Не удалось создать материал')
        return
      }
    }

    const data = {
      section: values.section,
      level: values.level,
      type: values.type,
      content: values.content,
      mediaGroupId,
      topicId: values.topicId === NO_TOPIC ? undefined : values.topicId,
      answerOptions,
    }

    if (isEditing) {
      updateMutation.mutate({ id: question.id!, data })
    } else {
      createMutation.mutate({ data })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto sm:max-w-lg"
        data-testid="question-form"
      >
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Редактировать вопрос' : 'Новый вопрос'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Раздел</Label>
              <Controller
                control={control}
                name="section"
                render={({ field }) => (
                  <Select
                    items={sectionLabels}
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value)
                      const allowed = sectionAllowedTypes[value as SectionType]
                      if (!allowed.includes(type)) {
                        setValue('type', allowed[0])
                        setValue('correctIndex', null)
                      }
                      setValue('topicId', NO_TOPIC)
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(SectionType).map((s) => (
                        <SelectItem key={s} value={s}>
                          {sectionLabels[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Уровень</Label>
              <Controller
                control={control}
                name="level"
                render={({ field }) => (
                  <Select
                    items={languageLevelLabels}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(LanguageLevel).map((l) => (
                        <SelectItem key={l} value={l}>
                          {languageLevelLabels[l]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Тип</Label>
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <Select
                    items={typeItems}
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value)
                      setValue('correctIndex', null)
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {typeOptions.map((t) => (
                        <SelectItem key={t} value={t}>
                          {questionTypeLabels[t]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="content">Текст вопроса</Label>
            <Input id="content" data-testid="question-content-input" {...register('content')} />
            {errors.content && <p className="text-sm text-destructive">{errors.content.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Тема</Label>
            <Controller
              control={control}
              name="topicId"
              render={({ field }) => (
                <Select
                  items={{
                    [NO_TOPIC]: 'Без темы',
                    ...Object.fromEntries(topics.map((topic) => [topic.id!, topic.name!])),
                  }}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_TOPIC}>Без темы</SelectItem>
                    {topics.map((topic) => (
                      <SelectItem key={topic.id} value={topic.id!}>
                        {topic.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {isEditing ? (
            (question.mediaText || question.mediaUrl) && (
              <p className="text-sm text-muted-foreground">
                Материал: {question.mediaText ?? question.mediaUrl} (изменить материал существующего
                вопроса пока нельзя)
              </p>
            )
          ) : mediaType === MediaType.Audio ? (
            <Controller
              control={control}
              name="mediaContent"
              render={({ field }) => (
                <AudioMediaField
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.mediaContent?.message}
                />
              )}
            />
          ) : (
            mediaType === MediaType.Text && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="mediaContent">Материал: {mediaTypeLabels[mediaType]}</Label>
                <Textarea
                  id="mediaContent"
                  rows={8}
                  {...register('mediaContent')}
                  placeholder="Текст для чтения"
                />
                {errors.mediaContent && (
                  <p className="text-sm text-destructive">{errors.mediaContent.message}</p>
                )}
              </div>
            )
          )}

          {type !== QuestionType.OpenAnswer && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label>Варианты ответа{ordered && ' (в правильном порядке)'}</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ content: '' })}
                  data-testid="question-add-option"
                >
                  <PlusIcon className="size-3.5" /> Добавить
                </Button>
              </div>
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex items-center gap-2"
                  data-testid={`question-option-${index}`}
                >
                  {type === QuestionType.MCQ && (
                    <input
                      type="radio"
                      name="correctIndex"
                      checked={correctIndex === index}
                      onChange={() => setValue('correctIndex', index)}
                      aria-label={`Правильный вариант ${index + 1}`}
                      data-testid={`question-option-${index}-correct-radio`}
                    />
                  )}
                  <Input
                    {...register(`answerOptions.${index}.content`)}
                    className="flex-1"
                    data-testid={`question-option-${index}-content`}
                  />
                  {ordered && (
                    <>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        disabled={index === 0}
                        onClick={() => move(index, index - 1)}
                      >
                        <ArrowUpIcon className="size-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        disabled={index === fields.length - 1}
                        onClick={() => move(index, index + 1)}
                      >
                        <ArrowDownIcon className="size-3.5" />
                      </Button>
                    </>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={fields.length <= 1}
                    onClick={() => remove(index)}
                    data-testid={`question-option-${index}-remove`}
                  >
                    <TrashIcon className="size-3.5" />
                  </Button>
                </div>
              ))}
              {errors.answerOptions && (
                <p className="text-sm text-destructive">{errors.answerOptions.message}</p>
              )}
              {errors.correctIndex && (
                <p className="text-sm text-destructive">{errors.correctIndex.message}</p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button type="submit" disabled={isPending} data-testid="question-form-submit">
              {isEditing ? 'Сохранить' : 'Создать'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
