<template>
  <div class="layout">
    <AppSidebar />
    <main class="content">
      <h2>Добро пожаловать, {{ authStore.fullName }}</h2>
      <div class="stats">
        <div class="stat-card">
          <span class="stat-number">{{ totalCandidates }}</span>
          <span class="stat-label">Всего кандидатов</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">{{ allowedCandidates }}</span>
          <span class="stat-label">С открытым доступом</span>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { getAll } from '../api/candidates'
import type { Candidate } from '../types'
import AppSidebar from '../components/AppSidebar.vue'

const authStore = useAuthStore()

const totalCandidates = ref(0)
const allowedCandidates = ref(0)

onMounted(async () => {
  const res = await getAll()
  totalCandidates.value = res.data.totalCount
  allowedCandidates.value = res.data.items.filter((c: Candidate) => c.isAllowed).length
})


</script>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
}

.content {
  flex: 1;
  padding: 40px;
  background: #f8fafc;
}

.content h2 {
  font-size: 24px;
  margin-bottom: 32px;
  color: #1e293b;
}

.stats {
  display: flex;
  gap: 20px;
}

.stat-card {
  background: white;
  padding: 24px 32px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-width: 160px;
}

.stat-number {
  font-size: 36px;
  font-weight: 600;
  color: #2563eb;
}

.stat-label {
  font-size: 14px;
  color: #64748b;
}
</style>