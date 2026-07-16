import { useRef } from 'react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import {
  usePutApiCandidatesIdPhoto,
  getGetApiCandidatesQueryKey,
} from '@/shared/api/generated/candidate/candidate'
import { ApiError } from '@/shared/api/instance'
import { Button } from '@/shared/ui/button'

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

export function CandidatePhotoUpload({
  candidateId,
  photo,
}: {
  candidateId: string
  photo?: string | null
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  const mutation = usePutApiCandidatesIdPhoto({
    mutation: {
      onSuccess: () => toast.success('Фото обновлено'),
      onError: (error) => toast.error(error instanceof ApiError ? error.message : 'Ошибка'),
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: getGetApiCandidatesQueryKey() })
      },
    },
  })

  async function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const dataUrl = await fileToDataUrl(file)
    mutation.mutate({ id: candidateId, data: { photo: dataUrl } })
  }

  return (
    <div className="flex items-center gap-3">
      {photo ? (
        <img src={photo} alt="Фото кандидата" className="size-16 rounded-md object-cover" />
      ) : (
        <div className="flex size-16 items-center justify-center rounded-md border text-xs text-muted-foreground">
          Нет фото
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileSelected}
        data-testid="candidate-photo-file-input"
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={mutation.isPending}
        onClick={() => inputRef.current?.click()}
        data-testid="candidate-photo-upload-button"
      >
        {photo ? 'Заменить фото' : 'Загрузить фото'}
      </Button>
    </div>
  )
}
