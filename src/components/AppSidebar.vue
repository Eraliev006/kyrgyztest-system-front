<template>
  <aside class="sidebar">
    <h1>KyrgyzTest</h1>
    <nav>
      <router-link to="/admin/dashboard">Главная</router-link>
      <router-link to="/admin/candidates">Кандидаты</router-link>
      <router-link
        v-if="authStore.role === 'Expert' || authStore.role === 'SuperAdmin'"
        to="/admin/questions"
      >
        Вопросы
      </router-link>
      <router-link
        v-if="authStore.role === 'Director' || authStore.role === 'SuperAdmin'"
        to="/admin/variants"
      >
        Варианты
      </router-link>
    </nav>
    <div class="user-info">
      <p>{{ authStore.fullName }}</p>
      <p class="role">{{ authStore.role }}</p>
      <button @click="logout">Выйти</button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

function logout() {
  authStore.logout()
  router.push('/admin')
}
</script>

<style scoped>
.sidebar {
  width: 240px;
  background: #1e293b;
  color: white;
  padding: 24px;
  display: flex;
  flex-direction: column;
}

.sidebar h1 {
  font-size: 20px;
  margin-bottom: 32px;
  color: #60a5fa;
}

nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

nav a {
  color: #94a3b8;
  text-decoration: none;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 15px;
  transition: all 0.2s;
}

nav a:hover,
nav a.router-link-active {
  background: #2563eb;
  color: white;
}

.user-info {
  border-top: 1px solid #334155;
  padding-top: 16px;
}

.user-info p {
  font-size: 14px;
  margin-bottom: 4px;
}

.role {
  color: #94a3b8;
  font-size: 12px !important;
  margin-bottom: 12px !important;
}

.user-info button {
  width: 100%;
  padding: 8px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}
</style>