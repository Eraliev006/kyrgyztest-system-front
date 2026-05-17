<template>
  <div class="layout">
    <AppSidebar />
    <main class="content">
      <div class="header">
        <h2>Варианты теста</h2>
      </div>

      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>№</th>
              <th>Кол-во вопросов</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="v in variants" :key="v.id">
              <td>
                {{ v.number }}
                <span class="date-sub">{{ formatDate(v.generatedAt) }}</span>
              </td>
              <td>{{ v.questionCount }}</td>
              <td>
                <button class="btn-open" @click="router.push(`/admin/variants/${v.id}`)">
                  Открыть
                </button>
              </td>
            </tr>
            <tr v-if="variants.length === 0">
              <td colspan="3" class="empty">Нет вариантов</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppSidebar from '../components/AppSidebar.vue'
import { getAll } from '../api/variants'
import type { VariantSummary } from '../types'

const router = useRouter()
const variants = ref<VariantSummary[]>([])

onMounted(async () => {
  const res = await getAll()
  variants.value = res.data
})

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('ru-RU', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
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
  margin-bottom: 24px;
}

.header h2 {
  font-size: 24px;
  color: #1e293b;
}

.table-wrapper {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  overflow: hidden;
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

.btn-open {
  padding: 6px 14px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
}

.empty {
  text-align: center;
  color: #94a3b8;
  padding: 40px !important;
}

.date-sub {
  display: block;
  font-size: 11px;
  color: #94a3b8;
  margin-top: 2px;
}
</style>
