import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { TokenResponse } from '../types'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '')
  const fullName = ref(localStorage.getItem('fullName') || '')
  const role = ref(localStorage.getItem('role') || '')

  function setAuth(data: TokenResponse) {
    token.value = data.accessToken
    fullName.value = data.fullName
    role.value = data.role
    localStorage.setItem('token', data.accessToken)
    localStorage.setItem('fullName', data.fullName)
    localStorage.setItem('role', data.role)
  }

  function logout() {
    token.value = ''
    fullName.value = ''
    role.value = ''
    localStorage.removeItem('token')
    localStorage.removeItem('fullName')
    localStorage.removeItem('role')
  }

  const isAuthenticated = () => !!token.value

  return { token, fullName, role, setAuth, logout, isAuthenticated }
})