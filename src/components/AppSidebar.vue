<template>
  <aside class="sidebar">
    <h1>KyrgyzTest</h1>
    <nav>
      <div class="nav-group">
        <span class="group-label">Основное</span>
        <router-link to="/admin/dashboard">Главная</router-link>
        <router-link to="/admin/candidates">Кандидаты</router-link>
        <router-link
          v-if="authStore.role === 'Director' || authStore.role === 'SuperAdmin'"
          to="/admin/results"
        >
          Результаты
        </router-link>
        <router-link
          v-if="authStore.role === 'Director' || authStore.role === 'SuperAdmin'"
          to="/admin/results/stats"
        >
          Статистика
        </router-link>
      </div>

      <div
        v-if="authStore.role === 'Expert' || authStore.role === 'Director' || authStore.role === 'SuperAdmin'"
        class="nav-group"
      >
        <span class="group-label">Контент</span>
        <router-link
          v-if="authStore.role === 'Expert' || authStore.role === 'SuperAdmin'"
          to="/admin/questions"
        >
          Вопросы
        </router-link>
        <router-link
          v-if="authStore.role === 'Director' || authStore.role === 'Expert' || authStore.role === 'SuperAdmin'"
          to="/admin/topics"
        >
          Подтемы
        </router-link>
        <router-link
          v-if="authStore.role === 'Director' || authStore.role === 'SuperAdmin'"
          to="/admin/variants"
        >
          Варианты
        </router-link>
      </div>

      <div
        v-if="authStore.role === 'Director' || authStore.role === 'SuperAdmin'"
        class="nav-group"
      >
        <span class="group-label">Система</span>
        <router-link to="/admin/organizations">Организации</router-link>
        <router-link to="/admin/users">Сотрудники</router-link>
        <router-link to="/admin/settings">Настройки</router-link>
      </div>
    </nav>
    <div class="user-info">
      <p>{{ authStore.fullName }}</p>
      <p class="role">{{ authStore.role }}</p>
      <router-link
        v-if="authStore.role === 'Director' || authStore.role === 'SuperAdmin'"
        to="/admin/audit"
        class="audit-link"
      >Журнал действий</router-link>
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
  gap: 0;
  flex: 1;
}

.nav-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-bottom: 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid #334155;
}

.nav-group:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.group-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #475569;
  padding: 0 12px;
  margin-bottom: 4px;
}

nav a {
  color: #94a3b8;
  text-decoration: none;
  padding: 9px 12px;
  border-radius: 8px;
  font-size: 14px;
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

.audit-link {
  display: block;
  font-size: 12px;
  color: #475569;
  text-decoration: none;
  margin-bottom: 10px;
  transition: color 0.15s;
}
.audit-link:hover {
  color: #94a3b8;
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
