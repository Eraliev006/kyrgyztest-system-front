import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useLocation, useNavigate, type Location } from 'react-router-dom'
import { toast } from 'sonner'
import { usePostApiAuthLogin } from '@/shared/api/generated/auth/auth'
import { useAuth, toLoginResponse, UserRole } from '@/entities/account'
import { ApiError } from '@/shared/api/instance'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

const loginSchema = z.object({
  login: z.string().min(1, 'Введите логин'),
  password: z.string().min(1, 'Введите пароль'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm({ onForgotPassword }: { onForgotPassword: () => void }) {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) })

  const mutation = usePostApiAuthLogin({
    mutation: {
      onSuccess: (response) => {
        const loginResponse = toLoginResponse(response.data)
        login(loginResponse)
        const roleHome =
          loginResponse.role === UserRole.Examiner
            ? '/examiner'
            : loginResponse.role === UserRole.Expert
              ? '/admin/topics'
              : '/admin'
        const from = (location.state as { from?: Location } | null)?.from?.pathname ?? roleHome
        navigate(from, { replace: true })
      },
      onError: (error) => {
        toast.error(error instanceof ApiError ? error.message : 'Не удалось войти')
      },
    },
  })

  function onSubmit(values: LoginFormValues) {
    mutation.mutate({ data: values })
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-80 flex-col gap-4"
      data-testid="login-form"
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="login">Логин</Label>
        <Input
          id="login"
          autoComplete="username"
          data-testid="login-input"
          {...register('login')}
        />
        {errors.login && <p className="text-sm text-destructive">{errors.login.message}</p>}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Пароль</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          data-testid="password-input"
          {...register('password')}
        />
        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
      </div>
      <Button type="submit" disabled={mutation.isPending} data-testid="login-submit">
        {mutation.isPending ? 'Вход...' : 'Войти'}
      </Button>
      <Button
        type="button"
        variant="link"
        size="sm"
        className="h-auto self-center p-0"
        onClick={onForgotPassword}
        data-testid="login-forgot-password"
      >
        Забыли пароль?
      </Button>
    </form>
  )
}
