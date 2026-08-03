import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Button } from '@/shared/ui/button'

interface PhotoCaptureDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCapture: (photo: string) => void
}

export function PhotoCaptureDialog({ open, onOpenChange, onCapture }: PhotoCaptureDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="photo-capture-dialog">
        <DialogHeader>
          <DialogTitle>Фото кандидата</DialogTitle>
        </DialogHeader>
        {open && <CameraFeed onCapture={onCapture} onClose={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  )
}

interface CameraFeedProps {
  onCapture: (photo: string) => void
  onClose: () => void
}

function CameraFeed({ onCapture, onClose }: CameraFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false

    navigator.mediaDevices
      .getUserMedia({ video: { width: 640, height: 480, facingMode: 'user' } })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
        setReady(true)
      })
      .catch(() => {
        toast.error('Не удалось получить доступ к камере')
        onClose()
      })

    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }, [onClose])

  function handleShoot() {
    const video = videoRef.current
    if (!video) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    onCapture(canvas.toDataURL('image/jpeg', 0.8))
    onClose()
  }

  return (
    <>
      <div className="flex justify-center overflow-hidden rounded-lg bg-muted">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="aspect-[4/3] w-full max-w-sm scale-x-[-1] object-cover"
        />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Отмена
        </Button>
        <Button
          type="button"
          onClick={handleShoot}
          disabled={!ready}
          data-testid="photo-capture-shoot"
        >
          Сделать фото
        </Button>
      </DialogFooter>
    </>
  )
}
