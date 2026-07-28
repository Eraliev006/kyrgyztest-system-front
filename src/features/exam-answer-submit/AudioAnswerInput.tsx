import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { Mic, Square, Check } from 'lucide-react'
import { usePostApiExamAnswerAudio } from '@/shared/api/generated/exam/exam'
import type { ExamQuestion } from '@/entities/attempt'
import { Button } from '@/shared/ui/button'
import { ApiError } from '@/shared/api/instance'

type RecordingState = 'idle' | 'recording' | 'recorded' | 'uploaded'

export function AudioAnswerInput({
  attemptId,
  question,
  onAnswered,
}: {
  attemptId: string
  question: ExamQuestion
  onAnswered?: () => void
}) {
  const [state, setState] = useState<RecordingState>(question.audioAnswerUrl ? 'uploaded' : 'idle')
  const [audioUrl, setAudioUrl] = useState<string | null>(question.audioAnswerUrl ?? null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const mutation = usePostApiExamAnswerAudio()

  function upload(blob: Blob) {
    const file = new File([blob], `${question.id}.webm`, { type: 'audio/webm' })
    mutation.mutate(
      { data: { attemptId, questionId: question.id!, file } },
      {
        onSuccess: () => {
          setState('uploaded')
          onAnswered?.()
        },
        onError: (error) => {
          toast.error(error instanceof ApiError ? error.message : 'Не удалось сохранить ответ')
          setState('recorded')
        },
      },
    )
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop())
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioUrl(URL.createObjectURL(blob))
        setState('recorded')
        upload(blob)
      }
      mediaRecorderRef.current = recorder
      recorder.start()
      setState('recording')
    } catch {
      toast.error('Нет доступа к микрофону')
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop()
  }

  return (
    <div className="flex flex-col gap-3" data-testid={`audio-question-${question.id}`}>
      <div className="flex items-center gap-3">
        {state !== 'recording' ? (
          <Button
            type="button"
            variant={state === 'idle' ? 'default' : 'outline'}
            onClick={startRecording}
            disabled={mutation.isPending}
            data-testid={`audio-record-button-${question.id}`}
          >
            <Mic /> {state === 'idle' ? 'Начать запись' : 'Перезаписать'}
          </Button>
        ) : (
          <Button
            type="button"
            variant="destructive"
            onClick={stopRecording}
            data-testid={`audio-stop-button-${question.id}`}
          >
            <Square className="fill-current" /> Остановить запись
          </Button>
        )}
        {state === 'recording' && (
          <span
            className="flex items-center gap-1.5 text-sm text-destructive"
            data-testid={`audio-recording-indicator-${question.id}`}
          >
            <span className="size-2 animate-pulse rounded-full bg-destructive" />
            Идёт запись…
          </span>
        )}
        {mutation.isPending && <span className="text-sm text-muted-foreground">Сохранение…</span>}
        {state === 'uploaded' && (
          <span
            className="flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400"
            data-testid={`audio-uploaded-indicator-${question.id}`}
          >
            <Check className="size-4" /> Сохранено
          </span>
        )}
      </div>
      {audioUrl && (
        <audio
          controls
          src={audioUrl}
          className="h-9 w-full max-w-sm"
          data-testid={`audio-playback-${question.id}`}
        />
      )}
    </div>
  )
}
