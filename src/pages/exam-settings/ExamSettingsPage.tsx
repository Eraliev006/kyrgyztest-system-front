import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import {
  useGetApiExamSettingsAccessPassword,
  usePutApiExamSettingsAccessPassword,
  getGetApiExamSettingsAccessPasswordQueryKey,
} from '@/shared/api/generated/exam-access-settings/exam-access-settings'
import { ApiError } from '@/shared/api/instance'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'

const schema = z.object({
  newPassword: z.string().min(1, 'Обязательное поле'),
})

type FormValues = z.infer<typeof schema>

export default function ExamSettingsPage() {
  const [reveal, setReveal] = useState(false)
  const { data: response, isLoading } = useGetApiExamSettingsAccessPassword()
  const settings = response?.data

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const initialized = useRef(false)
  useEffect(() => {
    if (settings && !initialized.current) {
      reset({ newPassword: settings.accessPassword ?? '' })
      initialized.current = true
    }
  }, [settings, reset])

  const queryClient = useQueryClient()
  const mutation = usePutApiExamSettingsAccessPassword({
    mutation: {
      onSuccess: () => {
        toast.success('Пароль доступа к экзамену обновлён')
        queryClient.invalidateQueries({ queryKey: getGetApiExamSettingsAccessPasswordQueryKey() })
      },
      onError: (error) => toast.error(error instanceof ApiError ? error.message : 'Ошибка'),
    },
  })

  function onSubmit(values: FormValues) {
    mutation.mutate({ data: { newPassword: values.newPassword } })
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Настройки экзамена</h1>
        <p className="text-sm text-muted-foreground">
          Пароль ниже вводят на киоске перед доступом к экзамену — сообщите его инвигилаторам.
        </p>
      </div>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Пароль доступа к киоску</CardTitle>
          {settings?.updatedByFullName && (
            <CardDescription>
              Последний раз менял: {settings.updatedByFullName},{' '}
              {new Date(settings.updatedAt!).toLocaleString('ru-RU')}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
              data-testid="exam-settings-form"
            >
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="exam-access-password">Текущий пароль</Label>
                <div className="flex gap-2">
                  <Input
                    id="exam-access-password"
                    type={reveal ? 'text' : 'password'}
                    data-testid="exam-access-password-input"
                    {...register('newPassword')}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setReveal((r) => !r)}
                    aria-label={reveal ? 'Скрыть пароль' : 'Показать пароль'}
                  >
                    {reveal ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </Button>
                </div>
                {errors.newPassword && (
                  <p className="text-sm text-destructive">{errors.newPassword.message}</p>
                )}
              </div>
              <Button
                type="submit"
                disabled={mutation.isPending}
                className="self-start"
                data-testid="exam-settings-submit"
              >
                Сохранить
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
