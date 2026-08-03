import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import {
  CANDIDATE_PHOTO_EVENT,
  getCandidateName,
  getCandidatePhoto,
} from '@/shared/lib/attempt-session'
import { ThemeToggle } from '@/shared/ui/theme-toggle'
import logo from '@/assets/logo.jpeg'

function initials(fullName: string): string {
  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

function CandidateIdentity() {
  useLocation()
  const [photoOverride, setPhotoOverride] = useState<string | null>(null)

  useEffect(() => {
    function onPhoto(e: Event) {
      setPhotoOverride((e as CustomEvent<string>).detail)
    }
    window.addEventListener(CANDIDATE_PHOTO_EVENT, onPhoto)
    return () => window.removeEventListener(CANDIDATE_PHOTO_EVENT, onPhoto)
  }, [])

  const name = getCandidateName()
  const photo = photoOverride ?? getCandidatePhoto()

  if (!name) return null

  return (
    <div
      className="fixed top-20 right-4 z-40 flex w-32 flex-col items-center gap-1.5 rounded-lg border border-border bg-card p-2 shadow-lg"
      data-testid="candidate-identity"
    >
      {photo ? (
        <img
          src={photo}
          alt={name}
          className="aspect-square w-full rounded-md object-cover ring-1 ring-border"
        />
      ) : (
        <span className="flex aspect-square w-full items-center justify-center rounded-md bg-muted text-2xl font-medium text-muted-foreground">
          {initials(name)}
        </span>
      )}
      <span className="text-center text-xs leading-tight font-medium break-words">{name}</span>
    </div>
  )
}

export function CandidateLayout() {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border px-6">
        <img src={logo} alt="Kyrgyztest" className="h-6 w-auto" />
        <div className="flex items-center gap-4">
          <CandidateIdentity />
          <ThemeToggle />
        </div>
      </header>
      <main className="flex-1 px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}
