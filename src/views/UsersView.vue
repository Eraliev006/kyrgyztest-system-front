<template>
  <div class="layout">
    <AppSidebar />
    <main class="content">
      <div class="header">
        <h2>Сотрудники</h2>
        <button @click="openCreate">+ Добавить</button>
      </div>

      <!-- Confirm dialog -->
      <div v-if="confirmDialog.show" class="modal-overlay" @click.self="confirmDialog.show = false">
        <div class="modal confirm-modal">
          <h3>{{ confirmDialog.title }}</h3>
          <p class="confirm-text">{{ confirmDialog.message }}</p>
          <div class="modal-actions">
            <button class="btn-secondary" @click="confirmDialog.show = false">Отмена</button>
            <button class="btn-confirm-delete" @click="runConfirm">Удалить</button>
          </div>
        </div>
      </div>

      <!-- Create / Edit modal -->
      <div v-if="showForm" class="modal-overlay" @click.self="closeForm">
        <div class="modal">
          <h3>{{ editingId ? 'Редактировать сотрудника' : 'Новый сотрудник' }}</h3>
          <input v-model="form.fullName" placeholder="ФИО" />
          <input v-model="form.login" placeholder="Логин" />
          <input
            v-if="!editingId"
            v-model="form.password"
            type="password"
            placeholder="Пароль"
          />
          <select v-model="form.role">
            <option value="" disabled>— Роль —</option>
            <option v-for="r in availableRoles" :key="r" :value="r">{{ r }}</option>
          </select>
          <p v-if="formError" class="error">{{ formError }}</p>
          <div class="modal-actions">
            <button class="btn-secondary" @click="closeForm">Отмена</button>
            <button @click="submit" :disabled="saving">
              {{ saving ? 'Сохранение...' : 'Сохранить' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>ФИО</th>
              <th>Логин</th>
              <th>Роль</th>
              <th>Дата создания</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in users" :key="u.id">
              <td>{{ u.fullName }}</td>
              <td>{{ u.login }}</td>
              <td>
                <span class="badge-role">{{ u.role }}</span>
              </td>
              <td>{{ formatDate(u.createdAt) }}</td>
              <td>
                <button class="btn-edit" @click="openEdit(u)">Редактировать</button>
                <button class="btn-delete" @click="askDelete(u.id)">Удалить</button>
              </td>
            </tr>
            <tr v-if="users.length === 0">
              <td colspan="5" class="empty">Нет сотрудников</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getAll, create, update, remove } from '../api/users'
import type { User } from '../types'
import AppSidebar from '../components/AppSidebar.vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

const availableRoles = computed(() => {
  if (authStore.role === 'SuperAdmin') {
    return ['Director', 'Admin', 'Examiner', 'Expert']
  }
  return ['Admin', 'Examiner', 'Expert']
})

const users = ref<User[]>([])
const showForm = ref(false)
const saving = ref(false)
const formError = ref('')
const editingId = ref<string | null>(null)

const form = ref({ fullName: '', login: '', password: '', role: '' })

const confirmDialog = ref({
  show: false,
  title: '',
  message: '',
  onConfirm: async () => {},
})

onMounted(loadAll)

async function loadAll() {
  const res = await getAll()
  users.value = res.data
}

function openCreate() {
  editingId.value = null
  form.value = { fullName: '', login: '', password: '', role: '' }
  formError.value = ''
  showForm.value = true
}

function openEdit(u: User) {
  editingId.value = u.id
  form.value = { fullName: u.fullName, login: u.login, password: '', role: u.role }
  formError.value = ''
  showForm.value = true
}

function closeForm() {
  showForm.value = false
}

async function submit() {
  if (!form.value.fullName || !form.value.login || !form.value.role) {
    formError.value = 'Заполните все обязательные поля'
    return
  }
  if (!editingId.value && !form.value.password) {
    formError.value = 'Укажите пароль'
    return
  }
  saving.value = true
  formError.value = ''
  try {
    if (editingId.value) {
      await update(editingId.value, {
        fullName: form.value.fullName,
        login: form.value.login,
        role: form.value.role,
      })
    } else {
      await create(form.value)
    }
    showForm.value = false
    await loadAll()
  } catch (e: any) {
    formError.value = e.response?.data?.message || 'Ошибка при сохранении'
  } finally {
    saving.value = false
  }
}

function askDelete(id: string) {
  confirmDialog.value = {
    show: true,
    title: 'Удалить сотрудника',
    message: 'Это действие нельзя отменить. Удалить?',
    onConfirm: () => deleteUser(id),
  }
}

async function runConfirm() {
  confirmDialog.value.show = false
  await confirmDialog.value.onConfirm()
}

async function deleteUser(id: string) {
  await remove(id)
  await loadAll()
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU')
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

.badge-role {
  background: #e0e7ff;
  color: #3730a3;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
}

.btn-edit {
  padding: 6px 12px;
  background: #f1f5f9;
  color: #1e293b;
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

.modal input,
.modal select {
  padding: 10px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  color: #1e293b;
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

.error {
  color: #dc2626;
  font-size: 13px;
}
</style>
