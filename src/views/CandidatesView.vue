<template>
  <div class="layout">
    
    <AppSidebar />
    <main class="content">
      <div class="header">
        <h2>Кандидаты</h2>
        <button @click="showForm = true">+ Добавить</button>
      </div>

      <!-- Поиск -->
      <div class="search-bar">
        <input v-model="searchQuery" placeholder="Поиск по ИНН или коду..." @input="search" />
      </div>

      <!-- Кастомное подтверждение -->
      <div v-if="confirmDialog.show" class="modal-overlay" @click.self="confirmDialog.show = false">
        <div class="modal confirm-modal">
          <h3>{{ confirmDialog.title }}</h3>
          <p class="confirm-text">{{ confirmDialog.message }}</p>
          <div class="modal-actions">
            <button class="btn-secondary" @click="confirmDialog.show = false">Отмена</button>
            <button :class="confirmDialog.confirmClass" @click="runConfirm">{{ confirmDialog.confirmLabel }}</button>
          </div>
        </div>
      </div>

      <!-- Форма создания -->
      <div v-if="showForm" class="modal-overlay" @click.self="showForm = false">
        <div class="modal">
          <h3>Новый кандидат</h3>
          <input v-model="form.fullName" placeholder="ФИО" />
          <input v-model="form.inn" placeholder="ИНН" />
          <p v-if="formError" class="error">{{ formError }}</p>
          <div class="modal-actions">
            <button class="btn-secondary" @click="showForm = false">Отмена</button>
            <button @click="createCandidate" :disabled="creating">
              {{ creating ? 'Сохранение...' : 'Сохранить' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Результат создания -->
      <div v-if="createdCandidate" class="success-banner">
        <p>Кандидат создан. Код доступа: <strong>{{ createdCandidate.accessCode }}</strong></p>
        <button @click="createdCandidate = null">✕</button>
      </div>

      <!-- Таблица -->
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>ФИО</th>
              <th>ИНН</th>
              <th>Код доступа</th>
              <th>Доступ</th>
              <th>Действие</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in candidates" :key="c.id">
              <td>{{ c.fullName }}</td>
              <td>{{ c.inn }}</td>
              <td class="code">{{ c.accessCode }}</td>
              <td>
                <span :class="c.isAllowed ? 'badge-green' : 'badge-red'">
                  {{ c.isAllowed ? 'Открыт' : 'Закрыт' }}
                </span>
              </td>
              <td>
                <button
                  v-if="!c.isAllowed"
                  class="btn-allow"
                  @click="askAllowAccess(c.id)"
                >
                  Открыть доступ
                </button>
                <span v-else class="muted">—</span>
                <button
                  class="btn-delete"
                  @click="askDeleteCandidate(c.id)"
                >
                  Удалить
                </button>
              </td>
            </tr>
            <tr v-if="candidates.length === 0">
              <td colspan="5" class="empty">Нет кандидатов</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getAll, searchByInn, searchByCode, create, allowAccess as allowApi, remove } from '../api/candidates'
import type { Candidate } from '../types'
import AppSidebar from '../components/AppSidebar.vue'

const candidates = ref<Candidate[]>([])
const searchQuery = ref('')
const showForm = ref(false)
const creating = ref(false)
const formError = ref('')
const createdCandidate = ref<Candidate | null>(null)

const form = ref({ fullName: '', inn: '' })

const confirmDialog = ref({
  show: false,
  title: '',
  message: '',
  confirmLabel: '',
  confirmClass: '',
  onConfirm: async () => {},
})

function askAllowAccess(id: string) {
  confirmDialog.value = {
    show: true,
    title: 'Открыть доступ',
    message: 'Кандидат получит доступ к тесту. Подтвердить?',
    confirmLabel: 'Открыть',
    confirmClass: 'btn-confirm-allow',
    onConfirm: () => allowAccess(id),
  }
}

function askDeleteCandidate(id: string) {
  confirmDialog.value = {
    show: true,
    title: 'Удалить кандидата',
    message: 'Это действие нельзя отменить. Удалить?',
    confirmLabel: 'Удалить',
    confirmClass: 'btn-confirm-delete',
    onConfirm: () => deleteCandidate(id),
  }
}

async function runConfirm() {
  confirmDialog.value.show = false
  await confirmDialog.value.onConfirm()
}

onMounted(async () => {
  await loadAll()
})

async function loadAll() {
  const res = await getAll()
  candidates.value = res.data
}

async function search() {
  const q = searchQuery.value.trim()
  if (!q) return loadAll()

  try {
    if (q.includes('-')) {
      const res = await searchByCode(q)
      candidates.value = [res.data]
    } else {
      const res = await searchByInn(q)
      candidates.value = [res.data]
    }
  } catch {
    candidates.value = []
  }
}

async function createCandidate() {
  if (!form.value.fullName || !form.value.inn) {
    formError.value = 'Заполните все поля'
    return
  }
  creating.value = true
  formError.value = ''
  try {
    const res = await create(form.value)
    createdCandidate.value = res.data
    showForm.value = false
    form.value = { fullName: '', inn: '' }
    await loadAll()
  } catch (e: any) {
    formError.value = e.response?.data?.message || 'Ошибка при создании'
  } finally {
    creating.value = false
  }
}

async function allowAccess(id: string) {
  await allowApi(id)
  await loadAll()
}

async function deleteCandidate(id: string) {
  await remove(id)
  await loadAll()
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

.header button {
  padding: 10px 20px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}

.search-bar {
  margin-bottom: 20px;
}

.search-bar input {
  width: 320px;
  padding: 10px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
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

.code {
  font-family: monospace;
  font-size: 13px;
  color: #2563eb;
}

.badge-green {
  background: #dcfce7;
  color: #16a34a;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
}

.badge-red {
  background: #fee2e2;
  color: #dc2626;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
}

.btn-allow {
  padding: 6px 12px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
}

.muted {
  color: #94a3b8;
}

.btn-delete {
  margin-left: 8px;
  padding: 6px 12px;
  background: #fee2e2;
  color: #dc2626;
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

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal {
  background: white;
  padding: 32px;
  border-radius: 12px;
  width: 360px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.modal h3 {
  font-size: 18px;
  color: #1e293b;
  margin-bottom: 4px;
}

.modal input {
  padding: 10px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
}

.modal-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 8px;
}

.modal-actions button {
  padding: 10px 20px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}

.btn-secondary {
  background: #f1f5f9 !important;
  color: #64748b !important;
}

.success-banner {
  background: #dcfce7;
  border: 1px solid #86efac;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #16a34a;
}

.success-banner button {
  background: none;
  border: none;
  cursor: pointer;
  color: #16a34a;
  font-size: 16px;
}

.error {
  color: #dc2626;
  font-size: 13px;
}

.confirm-modal {
  width: 320px;
  gap: 8px;
}

.confirm-text {
  font-size: 14px;
  color: #475569;
  margin: 0;
}

.btn-confirm-allow {
  padding: 10px 20px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}

.btn-confirm-delete {
  padding: 10px 20px;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}
</style>