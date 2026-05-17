<template>
  <div class="layout">
    <AppSidebar class="no-print" />
    <main class="content">
      <div class="header">
        <h2>Статистика по организациям</h2>
        <button class="btn-print no-print" @click="print">Печать</button>
      </div>

      <!-- Фильтры -->
      <div class="filters no-print">
        <select v-model="filters.organizationId" @change="loadStats">
          <option :value="undefined">Выберите организацию</option>
          <option v-for="org in organizations" :key="org.id" :value="org.id">
            {{ org.shortName }}
          </option>
        </select>

        <div class="date-group">
          <span>От:</span>
          <input type="date" v-model="filters.from" @change="loadStats" />
          <span>До:</span>
          <input type="date" v-model="filters.to" @change="loadStats" />
        </div>
      </div>

      <!-- Контент статистики -->
      <div v-if="stats" class="stats-container">
        <div class="summary-cards">
          <div class="card">
            <h3>Всего сдало</h3>
            <p class="value">{{ stats.totalPassed }}</p>
          </div>
          <div class="card">
            <h3>Средний балл</h3>
            <p class="value">{{ stats.averageScore.toFixed(1) }}</p>
          </div>
        </div>

        <div class="breakdown-section">
          <h3>Разбивка по уровням</h3>
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Уровень</th>
                  <th>Количество кандидатов</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in stats.levelBreakdown" :key="item.level">
                  <td><span class="badge-level">{{ item.level }}</span></td>
                  <td>{{ item.count }}</td>
                </tr>
                <tr v-if="stats.levelBreakdown.length === 0">
                  <td colspan="2" class="empty">Нет данных</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <div v-else-if="!filters.organizationId" class="placeholder">
        <p>Выберите организацию для просмотра статистики</p>
      </div>
      <div v-else class="loading">
        <p>Загрузка данных...</p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import AppSidebar from '../components/AppSidebar.vue'
import { getStats } from '../api/results'
import { useOrganizationsStore } from '../stores/organizations'
import type { StatsResponse } from '../types'

const orgStore = useOrganizationsStore()
const organizations = computed(() => orgStore.organizations)

const stats = ref<StatsResponse | null>(null)

const filters = ref({
  organizationId: undefined,
  from: '',
  to: ''
})

onMounted(async () => {
  await orgStore.fetch()
})

async function loadStats() {
  if (!filters.value.organizationId) {
    stats.value = null
    return
  }
  const res = await getStats(filters.value)
  stats.value = res.data
}

function print() {
  window.print()
}
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

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header h2 {
  font-size: 24px;
  color: #1e293b;
}

.btn-print {
  padding: 10px 20px;
  background: white;
  color: #1e293b;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.btn-print:hover {
  background: #f1f5f9;
}

.filters {
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
  align-items: center;
}

.filters select,
.filters input {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  background: white;
}

.date-group {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #64748b;
}

.summary-cards {
  display: flex;
  gap: 24px;
  margin-bottom: 32px;
}

.card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  flex: 1;
}

.card h3 {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.card .value {
  font-size: 32px;
  font-weight: 700;
  color: #1e293b;
}

.breakdown-section h3 {
  font-size: 18px;
  color: #1e293b;
  margin-bottom: 16px;
}

.table-wrapper {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  overflow: hidden;
  max-width: 600px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: #f1f5f9;
}

th {
  padding: 12px 16px;
  text-align: left;
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

td {
  padding: 12px 16px;
  font-size: 14px;
  border-top: 1px solid #f1f5f9;
  color: #1e293b;
}

.badge-level {
  background: #e0f2fe;
  color: #0369a1;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 12px;
}

.placeholder, .loading {
  text-align: center;
  padding: 80px;
  color: #94a3b8;
  background: white;
  border-radius: 12px;
}

@media print {
  .no-print {
    display: none !important;
  }
  .content {
    padding: 0;
    background: white;
  }
  .card, .table-wrapper {
    box-shadow: none;
    border: 1px solid #e2e8f0;
  }
}
</style>
