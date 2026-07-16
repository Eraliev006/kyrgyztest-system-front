import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { usePostApiExamUnlock } from '@/shared/api/generated/exam/exam'
import { setKioskUnlocked } from '@/shared/lib/kiosk-session'
import { ApiError } from '@/shared/api/instance'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

const unlockSchema = z.object({
  password: z.string().min(1, 'Введите пароль'),
})

type UnlockFormValues = z.infer<typeof unlockSchema>

export function KioskUnlockForm({ onUnlocked }: { onUnlocked: () => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UnlockFormValues>({ resolver: zodResolver(unlockSchema) })

  const mutation = usePostApiExamUnlock({
    mutation: {
      onSuccess: () => {
        setKioskUnlocked()
        onUnlocked()
      },
      onError: (error) => {
        toast.error(error instanceof ApiError ? error.message : 'Не удалось разблокировать')
      },
    },
  })

  function onSubmit(values: UnlockFormValues) {
    mutation.mutate({ data: values })
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-80 flex-col gap-4"
      data-testid="kiosk-unlock-form"
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Пароль экзаменационной комнаты</Label>
        <Input
          id="password"
          type="password"
          data-testid="kiosk-password-input"
          {...register('password')}
          autoFocus
        />
        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
      </div>
      <Button type="submit" disabled={mutation.isPending} data-testid="kiosk-unlock-submit">
        {mutation.isPending ? 'Проверка...' : 'Разблокировать'}
      </Button>
    </form>
  )
}
