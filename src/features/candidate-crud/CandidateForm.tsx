import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import {
  usePostApiCandidates,
  usePutApiCandidatesId,
  usePutApiCandidatesIdPhoto,
  getGetApiCandidatesQueryKey,
} from '@/shared/api/generated/candidate/candidate'
import { useGetApiOrganizations } from '@/shared/api/generated/organization/organization'
import type { Candidate } from '@/entities/candidate'
import { ApiError } from '@/shared/api/instance'
import { capturePhoto } from '@/shared/lib/capture-photo'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'

const candidateSchema = z.object({
  fullName: z.string().min(1, 'Обязательное поле'),
  inn: z.string().length(14, 'ИНН должен содержать 14 символов'),
  organizationId: z.string().optional(),
  photo: z.string().nullable().optional(),
})

type CandidateFormValues = z.infer<typeof candidateSchema>

interface CandidateFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  candidate?: Candidate
}

export function CandidateForm({ open, onOpenChange, candidate }: CandidateFormProps) {
  const isEditing = !!candidate
  const queryClient = useQueryClient()
  const { data: orgsResponse } = useGetApiOrganizations()
  const organizations = orgsResponse?.data ?? []
  const [capturing, setCapturing] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CandidateFormValues>({ resolver: zodResolver(candidateSchema) })

  const photo = watch('photo')

  useEffect(() => {
    if (open) {
      reset({
        fullName: candidate?.fullName ?? '',
        inn: candidate?.inn ?? '',
        organizationId: candidate?.organizationId ?? undefined,
        photo: candidate?.photo ?? null,
      })
    }
  }, [open, candidate, reset])

  function onSettled() {
    queryClient.invalidateQueries({ queryKey: getGetApiCandidatesQueryKey() })
  }

  const photoMutation = usePutApiCandidatesIdPhoto({
    mutation: {
      onError: (error) =>
        toast.error(error instanceof ApiError ? error.message : 'Не удалось сохранить фото'),
    },
  })

  async function handleCapture() {
    setCapturing(true)
    const result = await capturePhoto()
    setCapturing(false)
    if (!result) {
      toast.error('Не удалось получить доступ к камере')
      return
    }
    setValue('photo', result)
    if (candidate?.id) {
      photoMutation.mutate({ id: candidate.id, data: { photo: result } })
    }
  }

  const createMutation = usePostApiCandidates({
    mutation: {
      onSuccess: (response) => {
        const newId = response.data.id
        if (photo && newId) {
          photoMutation.mutate({ id: newId, data: { photo } })
        }
        toast.success('Кандидат создан')
        onOpenChange(false)
      },
      onError: (error) => toast.error(error instanceof ApiError ? error.message : 'Ошибка'),
      onSettled,
    },
  })

  const updateMutation = usePutApiCandidatesId({
    mutation: {
      onSuccess: () => {
        toast.success('Кандидат обновлён')
        onOpenChange(false)
      },
      onError: (error) => toast.error(error instanceof ApiError ? error.message : 'Ошибка'),
      onSettled,
    },
  })

  const isPending = createMutation.isPending || updateMutation.isPending

  function onSubmit(values: CandidateFormValues) {
    const data = {
      fullName: values.fullName,
      inn: values.inn,
      organizationId: values.organizationId ?? null,
    }
    if (isEditing) {
      updateMutation.mutate({ id: candidate.id!, data })
    } else {
      createMutation.mutate({ data })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="candidate-form">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Редактировать кандидата' : 'Новый кандидат'}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
          data-testid="candidate-form-body"
        >
          <div className="flex flex-col gap-1.5">
            <Label>Фото</Label>
            <div className="flex items-center gap-3">
              {photo ? (
                <img
                  src={photo}
                  alt=""
                  className="size-16 rounded-full object-cover ring-1 ring-border"
                />
              ) : (
                <span className="flex size-16 items-center justify-center rounded-full bg-muted text-xs text-muted-foreground">
                  Нет фото
                </span>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={handleCapture}
                disabled={capturing}
                data-testid="candidate-photo-capture"
              >
                {capturing ? 'Съёмка…' : photo ? 'Переснять' : 'Сфотографировать'}
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fullName">ФИО</Label>
            <Input id="fullName" data-testid="candidate-fullName-input" {...register('fullName')} />
            {errors.fullName && (
              <p className="text-sm text-destructive">{errors.fullName.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="inn">ИНН</Label>
            <Input id="inn" data-testid="candidate-inn-input" {...register('inn')} />
            {errors.inn && <p className="text-sm text-destructive">{errors.inn.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Организация</Label>
            <Controller
              control={control}
              name="organizationId"
              render={({ field }) => (
                <Select
                  items={Object.fromEntries(organizations.map((org) => [org.id!, org.shortName!]))}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Без организации" />
                  </SelectTrigger>
                  <SelectContent>
                    {organizations.map((org) => (
                      <SelectItem key={org.id} value={org.id!}>
                        {org.shortName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending} data-testid="candidate-form-submit">
              {isEditing ? 'Сохранить' : 'Создать'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
