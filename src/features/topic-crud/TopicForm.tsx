import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import {
  usePostApiTopics,
  usePutApiTopicsId,
  getGetApiTopicsQueryKey,
} from '@/shared/api/generated/topic/topic'
import { SectionType } from '@/shared/api/generated/kyrgyzTestAPI.schemas'
import { sectionLabels } from '@/shared/constants/section-labels'
import type { Topic } from '@/entities/topic'
import { ApiError } from '@/shared/api/instance'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'

const NO_SECTION = 'none'

const topicSchema = z.object({
  name: z.string().min(1, 'Обязательное поле'),
  sectionType: z.union([z.nativeEnum(SectionType), z.literal(NO_SECTION)]),
})

type TopicFormValues = z.infer<typeof topicSchema>

interface TopicFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  topic?: Topic
}

export function TopicForm({ open, onOpenChange, topic }: TopicFormProps) {
  const isEditing = !!topic
  const queryClient = useQueryClient()

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TopicFormValues>({
    resolver: zodResolver(topicSchema),
    defaultValues: { name: '', sectionType: NO_SECTION },
  })

  useEffect(() => {
    if (open) {
      reset({ name: topic?.name ?? '', sectionType: topic?.sectionType ?? NO_SECTION })
    }
  }, [open, topic, reset])

  function onSettled() {
    queryClient.invalidateQueries({ queryKey: getGetApiTopicsQueryKey() })
  }

  const createMutation = usePostApiTopics({
    mutation: {
      onSuccess: () => {
        toast.success('Тема создана')
        onOpenChange(false)
      },
      onError: (error) => toast.error(error instanceof ApiError ? error.message : 'Ошибка'),
      onSettled,
    },
  })

  const updateMutation = usePutApiTopicsId({
    mutation: {
      onSuccess: () => {
        toast.success('Тема обновлена')
        onOpenChange(false)
      },
      onError: (error) => toast.error(error instanceof ApiError ? error.message : 'Ошибка'),
      onSettled,
    },
  })

  const isPending = createMutation.isPending || updateMutation.isPending

  function onSubmit(values: TopicFormValues) {
    // CreateTopicDto's generated type omits `null` even though the backend's
    // SectionType? binds fine from an absent field — send undefined instead.
    const data = {
      name: values.name,
      sectionType: values.sectionType === NO_SECTION ? undefined : values.sectionType,
    }
    if (isEditing) {
      updateMutation.mutate({ id: topic.id!, data })
    } else {
      createMutation.mutate({ data })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Редактировать тему' : 'Новая тема'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Название</Label>
            <Input id="name" {...register('name')} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Раздел</Label>
            <Controller
              control={control}
              name="sectionType"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_SECTION}>Без раздела</SelectItem>
                    {Object.values(SectionType).map((section) => (
                      <SelectItem key={section} value={section}>
                        {sectionLabels[section]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isEditing ? 'Сохранить' : 'Создать'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
