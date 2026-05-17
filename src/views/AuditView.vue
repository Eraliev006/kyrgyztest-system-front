<template>
  <div class="layout">
    <AppSidebar />
    <main class="content">
      <div class="header">
        <h2>Журнал действий</h2>
      </div>

      <div class="filters">
        <div class="date-group">
          <span>От:</span>
          <input type="date" v-model="filters.dateFrom" @change="load" />
          <span>До:</span>
          <input type="date" v-model="filters.dateTo" @change="load" />
        </div>
        <select v-model="filters.entityType" @change="load">
          <option value="">Все объекты</option>
          <option value="Candidate">Кандидат</option>
          <option value="Question">Вопрос</option>
          <option value="TestVariant">Вариант теста</option>
        </select>
      </div>

      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Дата и время</th>
              <th>Сотрудник</th>
              <th>Действие</th>
              <th>Тип объекта</th>
              <th>Описание</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in logs" :key="log.id">
              <td class="date-cell">{{ formatDate(log.createdAt) }}</td>
              <td>{{ log.employeeName }}</td>
              <td><span class="badge-action" :class="actionClass(log.action)">{{ actionLabel(log.action) }}</span></td>
              <td>{{ entityLabel(log.entityType) }}</td>
              <td class="desc-cell">{{ log.description }}</td>
            </tr>
            <tr v-if="logs.length === 0">
              <td colspan="5" class="empty">Нет записей</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AppSidebar from '../components/AppSidebar.vue'
import { getAuditLogs } from '../api/audit'
import type { AuditLog } from '../types'

const logs = ref<AuditLog[]>([])
const filters = ref({ dateFrom: '', dateTo: '', entityType: '' })

onMounted(load)

async function load() {
  const res = await getAuditLogs({
    dateFrom: filters.value.dateFrom || undefined,
    dateTo: filters.value.dateTo || undefined,
    entityType: filters.value.entityType || undefined,
  })
  logs.value = res.data
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString('ru-RU', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

const ACTION_LABELS: Record<string, string> = {
  CREATE: 'Создание',
  UPDATE: 'Изменение',
  DELETE: 'Удаление',
  ALLOW_ACCESS: 'Открытие доступа',
  DENY_ACCESS: 'Закрытие доступа',
  BLOCK: 'Блокировка',
  REPLACE_QUESTION: 'Замена вопроса',
}

function actionLabel(action: string) {
  return ACTION_LABELS[action] ?? action
}

function actionClass(action: string) {
  if (action === 'DELETE' || action === 'BLOCK' || action === 'DENY_ACCESS') return 'action-danger'
  if (action === 'CREATE' || action === 'ALLOW_ACCESS') return 'action-success'
  return 'action-neutral'
}

const ENTITY_LABELS: Record<string, string> = {
  Candidate: 'Кандидат',
  Question: 'Вопрос',
  TestVariant: 'Вариант теста',
}

function entityLabel(type: string) {
  return ENTITY_LABELS[type] ?? type
}
</script>

<style scoped>
.layout { display: flex; min-height: 100vh; }
.content { flex: 1; padding: 40px; background: #f8fafc; }

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.header h2 { font-size: 24px; color: #1e293b; }

.filters {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  align-items: center;
  flex-wrap: wrap;
}
.date-group {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #64748b;
}
.date-group input[type="date"] {
  padding: 7px 10px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #1e293b;
}
.filters select {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #1e293b;
  background: white;
}

.table-wrapper {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  overflow: hidden;
}
table { width: 100%; border-collapse: collapse; }
thead { background: #f1f5f9; }
th { padding: 12px 16px; text-align: left; font-size: 13px; color: #64748b; font-weight: 500; }
td { padding: 12px 16px; font-size: 14px; border-top: 1px solid #f1f5f9; color: #1e293b; }

.date-cell { white-space: nowrap; color: #64748b; font-size: 13px; }
.desc-cell { max-width: 320px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.badge-action {
  display: inline-block;
  padding: 3px 9px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}
.action-danger  { background: #fee2e2; color: #dc2626; }
.action-success { background: #dcfce7; color: #16a34a; }
.action-neutral { background: #f1f5f9; color: #475569; }

.empty { text-align: center; color: #94a3b8; padding: 40px !important; }
</style>
