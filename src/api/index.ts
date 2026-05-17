import axios from 'axios'
import router from '../router'
import { useAuthStore } from '../stores/auth'

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  config.headers['ngrok-skip-browser-warning'] = 'true'
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      const auth = useAuthStore()
      if (auth.isAuthenticated()) {
        auth.logout()
        router.push('/admin')
      }
    }
    return Promise.reject(error)
  },
)

export default api