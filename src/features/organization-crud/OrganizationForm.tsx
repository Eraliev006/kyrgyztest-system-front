import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import {
  usePostApiOrganizations,
  usePutApiOrganizationsId,
  getGetApiOrganizationsQueryKey,
} from '@/shared/api/generated/organization/organization'
import type { Organization } from '@/entities/organization'
import { ApiError } from '@/shared/api/instance'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

const organizationSchema = z.object({
  nameRu: z.string().min(1, 'Обязательное поле'),
  nameKg: z.string().min(1, 'Обязательное поле'),
  shortName: z.string().min(1, 'Обязательное поле'),
})

type OrganizationFormValues = z.infer<typeof organizationSchema>

interface OrganizationFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  organization?: Organization
}

export function OrganizationForm({ open, onOpenChange, organization }: OrganizationFormProps) {
  const isEditing = !!organization
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OrganizationFormValues>({ resolver: zodResolver(organizationSchema) })

  useEffect(() => {
    if (open) {
      reset({
        nameRu: organization?.nameRu ?? '',
        nameKg: organization?.nameKg ?? '',
        shortName: organization?.shortName ?? '',
      })
    }
  }, [open, organization, reset])

  function onSettled() {
    queryClient.invalidateQueries({ queryKey: getGetApiOrganizationsQueryKey() })
  }

  const createMutation = usePostApiOrganizations({
    mutation: {
      onSuccess: () => {
        toast.success('Организация создана')
        onOpenChange(false)
      },
      onError: (error) => toast.error(error instanceof ApiError ? error.message : 'Ошибка'),
      onSettled,
    },
  })

  const updateMutation = usePutApiOrganizationsId({
    mutation: {
      onSuccess: () => {
        toast.success('Организация обновлена')
        onOpenChange(false)
      },
      onError: (error) => toast.error(error instanceof ApiError ? error.message : 'Ошибка'),
      onSettled,
    },
  })

  const isPending = createMutation.isPending || updateMutation.isPending

  function onSubmit(values: OrganizationFormValues) {
    if (isEditing) {
      updateMutation.mutate({ id: organization.id!, data: values })
    } else {
      createMutation.mutate({ data: values })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Редактировать организацию' : 'Новая организация'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nameRu">Название (рус.)</Label>
            <Input id="nameRu" {...register('nameRu')} />
            {errors.nameRu && <p className="text-sm text-destructive">{errors.nameRu.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nameKg">Название (кырг.)</Label>
            <Input id="nameKg" {...register('nameKg')} />
            {errors.nameKg && <p className="text-sm text-destructive">{errors.nameKg.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="shortName">Краткое название</Label>
            <Input id="shortName" {...register('shortName')} />
            {errors.shortName && (
              <p className="text-sm text-destructive">{errors.shortName.message}</p>
            )}
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
