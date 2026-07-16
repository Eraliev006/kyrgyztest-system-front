import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Account, LoginResponse } from './model'
import { getAdminToken, setAdminToken, clearAdminToken } from '@/shared/lib/token-storage'
import { getJson, setJson, removeItem } from '@/shared/lib/storage'

const ACCOUNT_STORAGE_KEY = 'kt_admin_account'

interface AuthContextValue {
  account: Account | null
  isAuthenticated: boolean
  login: (response: LoginResponse) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<Account | null>(() => {
    return getAdminToken() ? getJson<Account>(ACCOUNT_STORAGE_KEY) : null
  })

  function login(response: LoginResponse) {
    const { accessToken, ...accountData } = response
    setAdminToken(accessToken)
    setJson(ACCOUNT_STORAGE_KEY, accountData)
    setAccount(accountData)
  }

  function logout() {
    clearAdminToken()
    removeItem(ACCOUNT_STORAGE_KEY)
    setAccount(null)
  }

  return (
    <AuthContext.Provider value={{ account, isAuthenticated: account !== null, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
