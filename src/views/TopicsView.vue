<template>
  <div class="layout">
    <AppSidebar />
    <main class="content">
      <div class="header">
        <h2>Подтемы</h2>
        <button @click="openCreate">+ Добавить</button>
      </div>

      <!-- Подтверждение удаления -->
      <div v-if="confirmDialog.show" class="modal-overlay" @click.self="confirmDialog.show = false">
        <div class="modal confirm-modal">
          <h3>{{ confirmDialog.title }}</h3>
          <p class="confirm-text">{{ confirmDialog.message }}</p>
          <div class="modal-actions">
            <button class="btn-secondary" @click="confirmDialog.show = false">Отмена</button>
            <button class="btn-confirm-delete" @click="runConfirm">{{ confirmDialog.confirmLabel }}</button>
          </div>
        </div>
      </div>

      <!-- Форма создания / редактирования -->
      <div v-if="showForm" class="modal-overlay" @click.self="closeForm">
        <div class="modal">
          <h3>{{ editingId ? 'Редактировать подтему' : 'Новая подтема' }}</h3>
          <input v-model="form.name" placeholder="Название" />
          <select v-model="form.section">
            <option :value="null">Общая</option>
            <option :value="0">Грамматика</option>
            <option :value="1">Аудирование</option>
            <option :value="2">Чтение</option>
            <option :value="3">Письмо</option>
          </select>
          <p v-if="formError" class="error">{{ formError }}</p>
          <div class="modal-actions">
            <button class="btn-secondary" @click="closeForm">Отмена</button>
            <button @click="submitForm" :disabled="saving">
              {{ saving ? 'Сохранение...' : 'Сохранить' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Таблица -->
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Название</th>
              <th>Секция</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="topic in topics" :key="topic.id">
              <td>{{ topic.name }}</td>
              <td>{{ sectionLabel(topic.section) }}</td>
              <td>
                <button class="btn-edit" @click="openEdit(topic)">Редактировать</button>
                <button class="btn-delete" @click="askDelete(topic.id)">Удалить</button>
              </td>
            </tr>
            <tr v-if="topics.length === 0">
              <td colspan="3" class="empty">Нет подтем</td>
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
import { getAll, create, update, remove } from '../api/topics'
import type { Topic } from '../types'

const topics = ref<Topic[]>([])
const showForm = ref(false)
const saving = ref(false)
const formError = ref('')
const editingId = ref<string | null>(null)

const emptyForm = (): { name: string; section: number | null } => ({ name: '', section: null })
const form = ref(emptyForm())

const confirmDialog = ref({
  show: false,
  title: '',
  message: '',
  confirmLabel: '',
  onConfirm: async () => {},
})

onMounted(loadTopics)

async function loadTopics() {
  const res = await getAll()
  topics.value = res.data
}

function openCreate() {
  editingId.value = null
  form.value = emptyForm()
  formError.value = ''
  showForm.value = true
}

function openEdit(topic: Topic) {
  editingId.value = topic.id
  form.value = { name: topic.name, section: topic.section }
  formError.value = ''
  showForm.value = true
}

function closeForm() {
  showForm.value = false
}

async function submitForm() {
  if (!form.value.name.trim()) {
    formError.value = 'Введите название'
    return
  }
  saving.value = true
  formError.value = ''
  try {
    if (editingId.value) {
      await update(editingId.value, form.value)
    } else {
      await create(form.value)
    }
    await loadTopics()
    closeForm()
  } catch (e: any) {
    formError.value = e.response?.data?.message || 'Ошибка при сохранении'
  } finally {
    saving.value = false
  }
}

function askDelete(id: string) {
  confirmDialog.value = {
    show: true,
    title: 'Удалить подтему',
    message: 'Это действие нельзя отменить. Удалить?',
    confirmLabel: 'Удалить',
    onConfirm: () => deleteTopic(id),
  }
}

async function runConfirm() {
  confirmDialog.value.show = false
  await confirmDialog.value.onConfirm()
}

async function deleteTopic(id: string) {
  await remove(id)
  await loadTopics()
}

function sectionLabel(s: number | null) {
  if (s === null || s === undefined) return 'Общая'
  return ['Грамматика', 'Аудирование', 'Чтение', 'Письмо'][s] ?? s
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

.empty {
  text-align: center;
  color: #94a3b8;
  padding: 40px !important;
}

.btn-edit {
  padding: 6px 12px;
  background: #e0f2fe;
  color: #0369a1;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
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
  width: 400px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.modal h3 {
  font-size: 18px;
  color: #1e293b;
  margin-bottom: 4px;
}

.modal input,
.modal select {
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
