import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { usePostApiExamLogin, usePostApiExamStart } from '@/shared/api/generated/exam/exam'
import { usePutApiCandidatesIdPhoto } from '@/shared/api/generated/candidate/candidate'
import type { CandidateResponseDto } from '@/shared/api/generated/kyrgyzTestAPI.schemas'
import { findCurrentSection } from '@/entities/attempt'
import { setAttemptSession, setCandidatePhoto } from '@/shared/lib/attempt-session'
import { capturePhoto } from '@/shared/lib/capture-photo'
import { ApiError } from '@/shared/api/instance'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

const accessCodeSchema = z.object({
  accessCode: z.string().min(1, 'Введите код доступа'),
})

type AccessCodeFormValues = z.infer<typeof accessCodeSchema>

export function AccessCodeLoginForm() {
  const navigate = useNavigate()
  const [isStarting, setIsStarting] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AccessCodeFormValues>({ resolver: zodResolver(accessCodeSchema) })

  const loginMutation = usePostApiExamLogin()
  const startMutation = usePostApiExamStart()
  const photoMutation = usePutApiCandidatesIdPhoto()

  async function onSubmit(values: AccessCodeFormValues) {
    try {
      const loginResult = await loginMutation.mutateAsync({ data: values })
      // apiInstance throws on non-2xx, so this only ever resolves with the success
      // shape — but the generated type is a union with the (unused) ProblemDetails
      // error branches, whose index signature otherwise muddies `.id` to `unknown`.
      const candidate = loginResult.data as CandidateResponseDto
      const candidateId = candidate.id!

      setIsStarting(true)
      const startResult = await startMutation.mutateAsync({ data: { candidateId } })
      const attemptId = startResult.data.attemptId!
      setAttemptSession(candidateId, attemptId, candidate.fullName)

      void capturePhoto().then((photo) => {
        if (!photo) return
        setCandidatePhoto(photo)
        photoMutation.mutate({ id: candidateId, data: { photo } })
      })

      const current = findCurrentSection(startResult.data.sections ?? [])
      if (!current) {
        navigate('/exam/finish', { replace: true })
        return
      }
      navigate(`/exam/section/${current.section}`, { replace: true })
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'Не удалось войти')
      setIsStarting(false)
    }
  }

  const isPending = loginMutation.isPending || startMutation.isPending || isStarting

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-full flex-col gap-4"
      data-testid="access-code-form"
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="accessCode">Код доступа</Label>
        <Input
          id="accessCode"
          data-testid="access-code-input"
          className="h-11 text-base tracking-wide"
          placeholder="20260728-1234"
          {...register('accessCode')}
          autoFocus
        />
        {errors.accessCode && (
          <p className="text-sm text-destructive">{errors.accessCode.message}</p>
        )}
      </div>
      <Button
        type="submit"
        size="lg"
        className="h-11"
        disabled={isPending}
        data-testid="access-code-submit"
      >
        {isPending ? 'Вход...' : 'Начать тест'}
      </Button>
    </form>
  )
}
