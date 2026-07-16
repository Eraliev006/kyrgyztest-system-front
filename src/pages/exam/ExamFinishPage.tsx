import { useLocation, useNavigate } from 'react-router-dom'
import { languageLevelLabels } from '@/shared/constants/question-labels'
import type { Result } from '@/entities/result'
import { clearAttemptSession } from '@/shared/lib/attempt-session'
import { Button } from '@/shared/ui/button'

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
      className="flex min-h-svh flex-col items-center justify-center gap-6"
      data-testid="exam-finish-page"
    >
      <h1 className="text-2xl font-semibold">Тест завершён</h1>
      {result ? (
        <div className="flex flex-col items-center gap-2" data-testid="exam-result">
          <p className="text-4xl font-semibold">{languageLevelLabels[result.level!]}</p>
          <p className="text-muted-foreground">Итоговый балл: {result.totalScore}</p>
        </div>
      ) : (
        <p className="text-muted-foreground">Результат отправлен. Обратитесь к администратору.</p>
      )}
      <Button onClick={next} data-testid="exam-finish-done">
        Готово
      </Button>
    </div>
  )
}
