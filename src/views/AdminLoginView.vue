<template>
  <div class="login-wrapper">
    <div class="login-card">
      <h2>Панель управления</h2>
      <p>Войдите в систему</p>

      <input
        v-model="login"
        type="text"
        placeholder="Логин"
        @keyup.enter="submit"
      />
      <input
        v-model="password"
        type="password"
        placeholder="Пароль"
        @keyup.enter="submit"
      />

      <p v-if="error" class="error">{{ error }}</p>

      <button @click="submit" :disabled="loading">
        {{ loading ? 'Вход...' : 'Войти' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { login as loginApi } from '../api/auth'

const router = useRouter()
const authStore = useAuthStore()

const login = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function submit() {
  if (!login.value || !password.value) return
  loading.value = true
  error.value = ''
  try {
    const res = await loginApi({ login: login.value, password: password.value })
    authStore.setAuth(res.data)
    router.push('/admin/dashboard')
  } catch {
    error.value = 'Неверный логин или пароль'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
}

.login-card {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  width: 340px;
  text-align: center;
}

h2 {
  margin-bottom: 8px;
  font-size: 22px;
}

p {
  color: #666;
  margin-bottom: 20px;
}

input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  margin-bottom: 12px;
  box-sizing: border-box;
}

button {
  width: 100%;
  padding: 12px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
}

button:disabled {
  opacity: 0.6;
}

.error {
  color: red;
  font-size: 14px;
  margin-bottom: 8px;
}
</style>