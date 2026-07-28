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
    <div className="flex items-center gap-2" data-testid="candidate-identity">
      {photo ? (
        <img
          src={photo}
          alt={name}
          className="size-8 rounded-full object-cover ring-1 ring-border"
        />
      ) : (
        <span className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
          {initials(name)}
        </span>
      )}
      <span className="text-sm font-medium">{name}</span>
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
