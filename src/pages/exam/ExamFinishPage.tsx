import { useLocation, useNavigate } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { languageLevelLabels } from '@/shared/constants/question-labels'
import type { Result } from '@/entities/result'
import { clearAttemptSession } from '@/shared/lib/attempt-session'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'

export default function ExamFinishPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const result = (location.state as { result?: Result } | null)?.result

  function next() {
    clearAttemptSession()
    navigate('/exam/login', { replace: true })
  }

  return (
    <div
      className="flex min-h-svh flex-col items-center justify-center gap-6 px-4"
      data-testid="exam-finish-page"
    >
      <span className="flex size-14 items-center justify-center rounded-full bg-emerald-600/10 text-emerald-600 dark:text-emerald-400">
        <CheckCircle2 className="size-8" />
      </span>
      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-xl font-semibold tracking-tight">Тест завершён</h1>
        <p className="text-sm text-muted-foreground">Спасибо за прохождение теста</p>
      </div>
      {result ? (
        <Card className="w-full max-w-xs" data-testid="exam-result">
          <CardContent className="flex flex-col items-center gap-1 py-2 text-center">
            <span className="text-xs text-muted-foreground uppercase">Уровень</span>
            <p className="text-4xl font-semibold tabular-nums">
              {languageLevelLabels[result.level!]}
            </p>
            <p className="text-sm text-muted-foreground">
              Итоговый балл:{' '}
              <span className="font-medium text-foreground">{result.totalScore}</span>
            </p>
          </CardContent>
        </Card>
      ) : (
        <p className="max-w-xs text-center text-sm text-muted-foreground">
          Результат отправлен. Обратитесь к администратору.
        </p>
      )}
      <Button onClick={next} data-testid="exam-finish-done">
        Готово
      </Button>
    </div>
  )
}
