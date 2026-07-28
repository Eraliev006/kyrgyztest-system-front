import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import {
  usePostApiSectionConfig,
  usePutApiSectionConfigId,
  getGetApiSectionConfigQueryKey,
} from '@/shared/api/generated/section-config/section-config'
import { SectionType } from '@/shared/api/generated/kyrgyzTestAPI.schemas'
import { sectionLabels } from '@/shared/constants/section-labels'
import type { SectionConfig } from '@/entities/section'
import { ApiError } from '@/shared/api/instance'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'

const sectionConfigSchema = z.object({
  section: z.nativeEnum(SectionType),
  timeLimitMinutes: z.coerce.number().int().min(1, 'Должно быть больше нуля'),
  a1Count: z.coerce.number().int().min(0),
  a2Count: z.coerce.number().int().min(0),
  b1Count: z.coerce.number().int().min(0),
  b2Count: z.coerce.number().int().min(0),
})

type SectionConfigFormInput = z.input<typeof sectionConfigSchema>
type SectionConfigFormValues = z.output<typeof sectionConfigSchema>

interface SectionConfigFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  config?: SectionConfig
}

export function SectionConfigForm({ open, onOpenChange, config }: SectionConfigFormProps) {
  const isEditing = !!config
  const queryClient = useQueryClient()

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SectionConfigFormInput, unknown, SectionConfigFormValues>({
    resolver: zodResolver(sectionConfigSchema),
  })

  useEffect(() => {
    if (open) {
      reset({
        section: config?.section ?? SectionType.Grammar,
        timeLimitMinutes: config?.timeLimitMinutes ?? 30,
        a1Count: config?.a1Count ?? 0,
        a2Count: config?.a2Count ?? 0,
        b1Count: config?.b1Count ?? 0,
        b2Count: config?.b2Count ?? 0,
      })
    }
  }, [open, config, reset])

  function onSettled() {
    queryClient.invalidateQueries({ queryKey: getGetApiSectionConfigQueryKey() })
  }

  const createMutation = usePostApiSectionConfig({
    mutation: {
      onSuccess: () => {
        toast.success('Конфигурация создана')
        onOpenChange(false)
      },
      onError: (error) => toast.error(error instanceof ApiError ? error.message : 'Ошибка'),
      onSettled,
    },
  })

  const updateMutation = usePutApiSectionConfigId({
    mutation: {
      onSuccess: () => {
        toast.success('Конфигурация обновлена')
        onOpenChange(false)
      },
      onError: (error) => toast.error(error instanceof ApiError ? error.message : 'Ошибка'),
      onSettled,
    },
  })

  const isPending = createMutation.isPending || updateMutation.isPending

  function onSubmit(values: SectionConfigFormValues) {
    if (isEditing) {
      updateMutation.mutate({ id: config.id!, data: values })
    } else {
      createMutation.mutate({ data: values })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="section-config-form">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Редактировать конфигурацию раздела' : 'Новая конфигурация раздела'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Раздел</Label>
            <Controller
              control={control}
              name="section"
              render={({ field }) => (
                <Select
                  items={sectionLabels}
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isEditing}
                >
                  <SelectTrigger>
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
            <Label htmlFor="timeLimitMinutes">Лимит времени (мин)</Label>
            <Input
              id="timeLimitMinutes"
              type="number"
              min={1}
              data-testid="section-config-timeLimitMinutes-input"
              {...register('timeLimitMinutes')}
            />
            {errors.timeLimitMinutes && (
              <p className="text-sm text-destructive">{errors.timeLimitMinutes.message}</p>
            )}
          </div>
          <div className="grid grid-cols-4 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="a1Count">A1</Label>
              <Input
                id="a1Count"
                type="number"
                min={0}
                data-testid="section-config-a1Count-input"
                {...register('a1Count')}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="a2Count">A2</Label>
              <Input
                id="a2Count"
                type="number"
                min={0}
                data-testid="section-config-a2Count-input"
                {...register('a2Count')}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="b1Count">B1</Label>
              <Input
                id="b1Count"
                type="number"
                min={0}
                data-testid="section-config-b1Count-input"
                {...register('b1Count')}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="b2Count">B2</Label>
              <Input
                id="b2Count"
                type="number"
                min={0}
                data-testid="section-config-b2Count-input"
                {...register('b2Count')}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending} data-testid="section-config-form-submit">
              {isEditing ? 'Сохранить' : 'Создать'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
