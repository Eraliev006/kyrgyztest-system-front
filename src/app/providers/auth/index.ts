// The JWT session context lives in entities/account so pages/widgets/features
// can call useAuth() without importing upward from app. This barrel exists so
// the composition root (App.tsx) can mount it from its documented location.
export { AuthProvider, useAuth } from '@/entities/account/auth-context'
