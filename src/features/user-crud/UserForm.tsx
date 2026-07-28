import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import {
  usePostApiUser,
  usePutApiUserId,
  getGetApiUserQueryKey,
} from '@/shared/api/generated/user/user'
import { UserRole } from '@/shared/api/generated/kyrgyzTestAPI.schemas'
import { useAuth } from '@/entities/account'
import type { StaffUser } from '@/entities/user'
import { roleLabels } from '@/shared/constants/role-labels'
import { ApiError } from '@/shared/api/instance'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'

function makeUserSchema(isEditing: boolean) {
  return z.object({
    fullName: z.string().min(1, 'Обязательное поле'),
    login: z.string().min(1, 'Обязательное поле'),
    password: isEditing
      ? z.union([z.string().min(6, 'Минимум 6 символов'), z.literal('')])
      : z.string().min(6, 'Минимум 6 символов'),
    role: z.nativeEnum(UserRole),
  })
}

type UserFormValues = z.infer<ReturnType<typeof makeUserSchema>>

interface UserFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: StaffUser
}

const DIRECTOR_ASSIGNABLE_ROLES = [UserRole.Admin, UserRole.Examiner, UserRole.Expert]

export function UserForm({ open, onOpenChange, user }: UserFormProps) {
  const isEditing = !!user
  const queryClient = useQueryClient()
  const { account } = useAuth()
  const assignableRoles =
    account?.role === UserRole.Director ? DIRECTOR_ASSIGNABLE_ROLES : Object.values(UserRole)

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<UserFormValues>({ resolver: zodResolver(makeUserSchema(isEditing)) })

  useEffect(() => {
    if (open) {
      reset({
        fullName: user?.fullName ?? '',
        login: user?.login ?? '',
        password: '',
        role: user?.role ?? assignableRoles[0],
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user, reset])

  function onSettled() {
    queryClient.invalidateQueries({ queryKey: getGetApiUserQueryKey() })
  }

  const createMutation = usePostApiUser({
    mutation: {
      onSuccess: () => {
        toast.success('Сотрудник создан')
        onOpenChange(false)
      },
      onError: (error) => toast.error(error instanceof ApiError ? error.message : 'Ошибка'),
      onSettled,
    },
  })

  const updateMutation = usePutApiUserId({
    mutation: {
      onSuccess: () => {
        toast.success('Сотрудник обновлён')
        onOpenChange(false)
      },
      onError: (error) => toast.error(error instanceof ApiError ? error.message : 'Ошибка'),
      onSettled,
    },
  })

  const isPending = createMutation.isPending || updateMutation.isPending

  function onSubmit(values: UserFormValues) {
    if (isEditing) {
      updateMutation.mutate({ id: user.id!, data: values })
    } else {
      createMutation.mutate({ data: values })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="user-form">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Редактировать сотрудника' : 'Новый сотрудник'}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
          data-testid="user-form-body"
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fullName">ФИО</Label>
            <Input id="fullName" data-testid="user-fullName-input" {...register('fullName')} />
            {errors.fullName && (
              <p className="text-sm text-destructive">{errors.fullName.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="login">Логин</Label>
            <Input id="login" data-testid="user-login-input" {...register('login')} />
            {errors.login && <p className="text-sm text-destructive">{errors.login.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">{isEditing ? 'Новый пароль' : 'Пароль'}</Label>
            <Input
              id="password"
              type="password"
              data-testid="user-password-input"
              {...register('password')}
            />
            {isEditing && (
              <p className="text-xs text-muted-foreground">
                Оставьте пустым, чтобы не менять текущий пароль
              </p>
            )}
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Роль</Label>
            <Controller
              control={control}
              name="role"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full" data-testid="user-role-trigger">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {assignableRoles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {roleLabels[role]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending} data-testid="user-form-submit">
              {isEditing ? 'Сохранить' : 'Создать'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
