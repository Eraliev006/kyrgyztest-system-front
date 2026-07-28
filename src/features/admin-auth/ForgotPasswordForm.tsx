import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { usePostApiPasswordResetRequests } from '@/shared/api/generated/password-reset/password-reset'
import { ApiError } from '@/shared/api/instance'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

const forgotPasswordSchema = z
  .object({
    login: z.string().min(1, 'Введите логин'),
    newPassword: z.string().min(6, 'Минимум 6 символов'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  })

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

export function ForgotPasswordForm({ onBack }: { onBack: () => void }) {
  const [submitted, setSubmitted] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({ resolver: zodResolver(forgotPasswordSchema) })

  const mutation = usePostApiPasswordResetRequests({
    mutation: {
      onSuccess: () => setSubmitted(true),
      onError: (error) => toast.error(error instanceof ApiError ? error.message : 'Ошибка'),
    },
  })

  function onSubmit(values: ForgotPasswordFormValues) {
    mutation.mutate({ data: { login: values.login, newPassword: values.newPassword } })
  }

  if (submitted) {
    return (
      <div
        className="flex w-80 flex-col items-center gap-4 text-center"
        data-testid="forgot-password-submitted"
      >
        <p className="text-sm">
          Заявка отправлена. Новый пароль будет установлен после того, как её одобрит директор.
        </p>
        <Button variant="outline" onClick={onBack} data-testid="forgot-password-back">
          Назад ко входу
        </Button>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-80 flex-col gap-4"
      data-testid="forgot-password-form"
    >
      <p className="text-sm text-muted-foreground">
        Укажите логин и желаемый новый пароль — он будет установлен после одобрения директором.
      </p>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="forgot-login">Логин</Label>
        <Input
          id="forgot-login"
          data-testid="forgot-login-input"
          {...register('login')}
          autoFocus
        />
        {errors.login && <p className="text-sm text-destructive">{errors.login.message}</p>}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="forgot-new-password">Новый пароль</Label>
        <Input
          id="forgot-new-password"
          type="password"
          data-testid="forgot-new-password-input"
          {...register('newPassword')}
        />
        {errors.newPassword && (
          <p className="text-sm text-destructive">{errors.newPassword.message}</p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="forgot-confirm-password">Повторите пароль</Label>
        <Input
          id="forgot-confirm-password"
          type="password"
          data-testid="forgot-confirm-password-input"
          {...register('confirmPassword')}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
        )}
      </div>
      <Button type="submit" disabled={mutation.isPending} data-testid="forgot-password-submit">
        {mutation.isPending ? 'Отправка...' : 'Отправить заявку'}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onBack}
        data-testid="forgot-password-cancel"
      >
        Назад ко входу
      </Button>
    </form>
  )
}
