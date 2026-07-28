export async function capturePhoto(): Promise<string | null> {
  let stream: MediaStream | null = null
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 320, height: 240, facingMode: 'user' },
    })

    const video = document.createElement('video')
    video.srcObject = stream
    video.playsInline = true
    await video.play()
    await new Promise((resolve) => {
      if (video.readyState >= video.HAVE_CURRENT_DATA) resolve(undefined)
      else video.onloadeddata = () => resolve(undefined)
    })

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 320
    canvas.height = video.videoHeight || 240
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    return canvas.toDataURL('image/jpeg', 0.8)
  } catch {
    return null
  } finally {
    stream?.getTracks().forEach((track) => track.stop())
  }
}
