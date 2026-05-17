<template>
  <div class="layout">
    
    <AppSidebar />
    <main class="content">
      <div class="header">
        <h2>Кандидаты</h2>
        <button @click="showForm = true">+ Добавить</button>
      </div>

      <!-- Фильтры -->
      <div class="filter-bar">
        <input v-model="searchQuery" placeholder="Поиск по ФИО, ИНН или коду" @input="onSearchInput" @keyup.enter="search" class="filter-input" />
        <select v-model="selectedOrgId" @change="onOrgChange" class="filter-select">
          <option :value="undefined">Все организации</option>
          <option v-for="org in orgStore.organizations" :key="org.id" :value="org.id">{{ org.nameRu }}</option>
        </select>
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
      <div v-if="showForm" class="modal-overlay" @click.self="closeForm">
        <div class="modal">
          <h3>Новый кандидат</h3>
          <input v-model="form.fullName" placeholder="ФИО" />
          <input v-model="form.inn" placeholder="ИНН" />
          <p v-if="innError" class="error inn-error">{{ innError }}</p>
          <select v-model="form.organizationId">
            <option :value="undefined">— Организация (необязательно) —</option>
            <option v-for="org in orgStore.organizations" :key="org.id" :value="org.id">
              {{ org.nameRu }}
            </option>
          </select>

          <!-- Camera block -->
          <div class="camera-block">
            <div v-if="!cameraActive && !photoPreview" class="camera-idle">
              <button type="button" class="btn-camera" @click="openCamera">📷 Открыть камеру</button>
            </div>
            <div v-if="cameraActive" class="camera-live">
              <video ref="videoRef" autoplay playsinline class="camera-video"></video>
              <button type="button" class="btn-camera" @click="capturePhoto">Сфотографировать</button>
            </div>
            <div v-if="photoPreview" class="camera-preview">
              <img :src="photoPreview" class="photo-preview" />
              <button type="button" class="btn-secondary btn-retake" @click="resetPhoto">Переснять</button>
            </div>
          </div>
          <canvas ref="canvasRef" style="display:none"></canvas>

          <p v-if="formError" class="error">{{ formError }}</p>
          <div class="modal-actions">
            <button class="btn-secondary" @click="closeForm">Отмена</button>
            <button @click="createCandidate" :disabled="creating">
              {{ creating ? 'Сохранение...' : 'Сохранить' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Результат создания -->
      <div v-if="createdCandidate" class="modal-overlay" @click.self="createdCandidate = null">
        <div class="modal access-code-modal">
          <h3>Кандидат создан</h3>
          <p class="access-code-name">{{ createdCandidate.fullName }}</p>
          <div class="access-code-block">
            <span class="access-code">{{ createdCandidate.accessCode }}</span>
          </div>
          <div class="modal-actions">
            <button class="btn-secondary" @click="createdCandidate = null">Закрыть</button>
            <button @click="copyCode">Скопировать код</button>
          </div>
        </div>
      </div>

      <!-- Предупреждение: нет фото -->
      <div v-if="warnToast" class="warn-toast">
        <p>{{ warnToast }}</p>
        <button @click="warnToast = ''">✕</button>
      </div>

      <!-- Модалка редактирования -->
      <div v-if="editModal.show" class="modal-overlay" @click.self="editModal.show = false">
        <div class="modal">
          <h3>Редактировать кандидата</h3>
          <input v-model="editModal.fullName" placeholder="ФИО" />
          <div>
            <input v-model="editModal.inn" placeholder="ИНН" />
            <p v-if="editModal.innError" class="error inn-error">{{ editModal.innError }}</p>
          </div>
          <select v-model="editModal.organizationId">
            <option :value="undefined">— Организация (необязательно) —</option>
            <option v-for="org in orgStore.organizations" :key="org.id" :value="org.id">
              {{ org.nameRu }}
            </option>
          </select>
          <p v-if="editModal.error" class="error">{{ editModal.error }}</p>
          <div class="modal-actions">
            <button class="btn-secondary" @click="editModal.show = false">Отмена</button>
            <button @click="submitEdit" :disabled="editModal.saving">
              {{ editModal.saving ? 'Сохранение...' : 'Сохранить' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Модалка блокировки -->
      <div v-if="blockModal.show" class="modal-overlay" @click.self="blockModal.show = false">
        <div class="modal">
          <h3>Заблокировать кандидата</h3>
          <div class="block-row">
            <input v-model.number="blockModal.value" type="number" min="1" class="block-value" />
            <select v-model="blockModal.unit">
              <option value="days">Дни</option>
              <option value="weeks">Недели</option>
              <option value="months">Месяцы</option>
              <option value="years">Годы</option>
            </select>
          </div>
          <p v-if="blockModal.error" class="error">{{ blockModal.error }}</p>
          <div class="modal-actions">
            <button class="btn-secondary" @click="blockModal.show = false">Отмена</button>
            <button class="btn-confirm-delete" @click="submitBlock" :disabled="blockModal.saving">
              {{ blockModal.saving ? 'Блокировка...' : 'Заблокировать' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Таблица -->
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>ФИО</th>
              <th>ИНН</th>
              <th>Код доступа</th>
              <th>Статус</th>
              <th>Действие</th>
            </tr>
          </thead>
          <tbody>
            <template v-if="loading">
              <tr v-for="i in 5" :key="'sk-' + i" class="skeleton-row">
                <td v-for="j in 5" :key="j"><div class="skeleton-cell"></div></td>
              </tr>
            </template>
            <template v-else>
              <tr v-for="c in candidates" :key="c.id" class="fade-in">
                <td>{{ c.fullName }}</td>
                <td>{{ c.inn }}</td>
                <td class="code">{{ c.accessCode }}</td>
                <td>
                  <span v-if="c.isAllowed" class="badge-status-green">🟢 Доступ открыт</span>
                  <span v-else-if="c.blockedUntil && new Date(c.blockedUntil) > new Date()" class="badge-status-red">
                    ⛔ Заблокирован до {{ formatDate(c.blockedUntil) }}
                  </span>
                  <span v-else class="badge-status-gray">⚪ Нет доступа</span>
                </td>
                <td class="actions-cell">
                  <div class="dropdown" @click.stop>
                    <button class="btn-dots" @click="toggleMenu(c.id, $event)">⋯</button>
                    <div v-if="openMenuId === c.id" class="dropdown-menu" :style="{ top: menuPos.top + 'px', left: menuPos.left + 'px' }">
                      <button class="dropdown-item" @click="openEditModal(c); openMenuId = null">Редактировать</button>
                      <button v-if="!c.isAllowed" class="dropdown-item" @click="askAllowAccess(c.id); openMenuId = null">Открыть доступ</button>
                      <button v-if="c.isAllowed" class="dropdown-item" @click="denyAccess(c.id); openMenuId = null">Закрыть доступ</button>
                      <button class="dropdown-item" @click="openBlockModal(c.id); openMenuId = null">Заблокировать</button>
                      <button class="dropdown-item dropdown-item-delete" @click="askDeleteCandidate(c.id); openMenuId = null">Удалить</button>
                    </div>
                  </div>
                </td>
              </tr>
              <tr v-if="candidates.length === 0" class="fade-in">
                <td colspan="5" class="empty">{{ isSearchMode ? 'Кандидат не найден' : 'Сегодня кандидатов не добавляли' }}</td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- Пагинация -->
      <div v-if="!isSearchMode && totalPages > 1" class="pagination">
        <button class="btn-page" @click="prevPage" :disabled="page === 1">Назад</button>
        <span>{{ page }} / {{ totalPages }}</span>
        <button class="btn-page" @click="nextPage" :disabled="page >= totalPages">Вперёд</button>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { searchByInn, searchByCode, searchByFullName, listCandidates, create, update, uploadPhoto, allowAccess as allowApi, denyAccess as denyApi, blockCandidate, remove } from '../api/candidates'
import { useOrganizationsStore } from '../stores/organizations'
import type { Candidate } from '../types'
import AppSidebar from '../components/AppSidebar.vue'

const candidates = ref<Candidate[]>([])
const loading = ref(true)
const orgStore = useOrganizationsStore()
const searchQuery = ref('')
const selectedOrgId = ref<string | undefined>(undefined)
const page = ref(1)
const total = ref(0)
const isSearchMode = ref(false)
const PAGE_SIZE = 20
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / PAGE_SIZE)))
const openMenuId = ref<string | null>(null)
const menuPos = ref({ top: 0, left: 0 })

function toggleMenu(id: string, event: MouseEvent) {
  if (openMenuId.value === id) {
    openMenuId.value = null
    return
  }
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  menuPos.value = { top: rect.bottom + 4, left: rect.right }
  openMenuId.value = id
}

function closeMenuOnOutsideClick() {
  openMenuId.value = null
}

onBeforeUnmount(() => {
  document.removeEventListener('click', closeMenuOnOutsideClick)
})
const showForm = ref(false)
const creating = ref(false)
const formError = ref('')
const createdCandidate = ref<Candidate | null>(null)

const innError = ref('')
const warnToast = ref('')

const form = ref<{ fullName: string; inn: string; organizationId?: string }>({
  fullName: '',
  inn: '',
  organizationId: undefined
})

const editModal = ref({
  show: false,
  candidateId: '',
  fullName: '',
  inn: '',
  organizationId: undefined as string | undefined,
  saving: false,
  error: '',
  innError: '',
})

const videoRef = ref<HTMLVideoElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const cameraActive = ref(false)
const photoPreview = ref('')
let mediaStream: MediaStream | null = null

const blockModal = ref({
  show: false,
  candidateId: '',
  value: 1,
  unit: 'days',
  saving: false,
  error: '',
})

function formatDate(iso: string): string {
  const d = new Date(iso)
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`
}

async function openCamera() {
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
    cameraActive.value = true
    await nextTick()
    if (videoRef.value) videoRef.value.srcObject = mediaStream
  } catch {
    // camera unavailable — silently skip
  }
}

function capturePhoto() {
  if (!videoRef.value || !canvasRef.value) return
  const canvas = canvasRef.value
  canvas.width = videoRef.value.videoWidth
  canvas.height = videoRef.value.videoHeight
  canvas.getContext('2d')!.drawImage(videoRef.value, 0, 0)
  photoPreview.value = canvas.toDataURL('image/jpeg', 0.8)
  stopCamera()
}

function stopCamera() {
  mediaStream?.getTracks().forEach(t => t.stop())
  mediaStream = null
  cameraActive.value = false
}

function resetPhoto() {
  photoPreview.value = ''
}

function closeForm() {
  stopCamera()
  photoPreview.value = ''
  innError.value = ''
  showForm.value = false
}

function openEditModal(c: Candidate) {
  editModal.value = {
    show: true,
    candidateId: c.id,
    fullName: c.fullName,
    inn: c.inn,
    organizationId: (c as any).organizationId,
    saving: false,
    error: '',
    innError: '',
  }
}

async function submitEdit() {
  if (editModal.value.inn.length !== 14) {
    editModal.value.innError = 'ИНН должен содержать ровно 14 символов'
    return
  }
  editModal.value.innError = ''
  editModal.value.saving = true
  editModal.value.error = ''
  try {
    await update(editModal.value.candidateId, {
      fullName: editModal.value.fullName,
      inn: editModal.value.inn,
      organizationId: editModal.value.organizationId,
    })
    editModal.value.show = false
    await refreshSearch()
  } catch (e: any) {
    if (e.response?.status === 400) {
      editModal.value.error = e.response?.data?.message || 'Ошибка: некорректные данные'
    } else {
      editModal.value.error = e.response?.data?.message || 'Ошибка при сохранении'
    }
  } finally {
    editModal.value.saving = false
  }
}

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
  document.addEventListener('click', closeMenuOnOutsideClick)
  await orgStore.fetch()
  await loadList()
})

function getTodayRange() {
  const today = new Date()
  const dateFrom = today.toISOString().split('T')[0]
  return { dateFrom, dateTo: dateFrom }
}

async function loadList() {
  loading.value = true
  const { dateFrom, dateTo } = getTodayRange()
  try {
    const res = await listCandidates({
      organizationId: selectedOrgId.value,
      dateFrom,
      dateTo,
      page: page.value,
      pageSize: PAGE_SIZE,
    })
    candidates.value = res.data.items
    total.value = res.data.total
  } catch {
    candidates.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
  isSearchMode.value = false
}

function onSearchInput() {
  const q = searchQuery.value.trim()
  if (q.length === 0) {
    page.value = 1
    loadList()
    return
  }
  if (q.length >= 3) {
    search()
  }
}

async function search() {
  const q = searchQuery.value.trim()
  if (!q) {
    page.value = 1
    await loadList()
    return
  }
  isSearchMode.value = true
  try {
    if (/^\d+$/.test(q)) {
      const res = await searchByInn(q)
      candidates.value = [res.data]
    } else if (/^\d{8}-[A-Za-z0-9]{4}$/.test(q)) {
      const res = await searchByCode(q)
      candidates.value = [res.data]
    } else {
      const res = await searchByFullName(q)
      candidates.value = res.data
    }
    total.value = candidates.value.length
  } catch (e: any) {
    const isNotFound = e?.response?.status === 404
    candidates.value = []
    total.value = 0
    if (!isNotFound) console.error(e)
  }
}

async function onOrgChange() {
  page.value = 1
  await loadList()
}

async function prevPage() {
  if (page.value > 1) {
    page.value--
    await loadList()
  }
}

async function nextPage() {
  if (page.value < totalPages.value) {
    page.value++
    await loadList()
  }
}

async function refreshSearch() {
  if (isSearchMode.value) {
    await search()
  } else {
    await loadList()
  }
}

async function createCandidate() {
  if (!form.value.fullName || !form.value.inn) {
    formError.value = 'Заполните все поля'
    return
  }
  if (form.value.inn.length !== 14) {
    innError.value = 'ИНН должен содержать ровно 14 символов'
    return
  }
  innError.value = ''
  creating.value = true
  formError.value = ''
  try {
    const res = await create(form.value)
    createdCandidate.value = res.data
    showForm.value = false
    form.value = { fullName: '', inn: '', organizationId: undefined }
    stopCamera()
    const noPhoto = !photoPreview.value
    if (photoPreview.value) {
      try { await uploadPhoto(res.data.id, photoPreview.value) } catch { /* non-fatal */ }
      photoPreview.value = ''
    }
    if (noPhoto) {
      warnToast.value = 'Кандидат зарегистрирован без фото. Рекомендуется добавить фото для идентификации.'
      setTimeout(() => { warnToast.value = '' }, 6000)
    }
    await refreshSearch()
  } catch (e: any) {
    formError.value = e.response?.data?.message || 'Ошибка при создании'
  } finally {
    creating.value = false
  }
}

async function allowAccess(id: string) {
  await allowApi(id)
  await refreshSearch()
}

async function denyAccess(id: string) {
  await denyApi(id)
  await refreshSearch()
}

function openBlockModal(id: string) {
  blockModal.value = { show: true, candidateId: id, value: 1, unit: 'days', saving: false, error: '' }
}

async function submitBlock() {
  if (blockModal.value.value < 1) {
    blockModal.value.error = 'Укажите значение больше 0'
    return
  }
  blockModal.value.saving = true
  blockModal.value.error = ''
  try {
    await blockCandidate(blockModal.value.candidateId, {
      value: blockModal.value.value,
      unit: blockModal.value.unit,
    })
    blockModal.value.show = false
    await refreshSearch()
  } catch (e: any) {
    blockModal.value.error = e.response?.data?.message || 'Ошибка при блокировке'
  } finally {
    blockModal.value.saving = false
  }
}

async function deleteCandidate(id: string) {
  await remove(id)
  await refreshSearch()
}

function copyCode() {
  if (!createdCandidate.value) return
  navigator.clipboard.writeText(createdCandidate.value.accessCode)
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

.filter-bar {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 20px;
}

.filter-input {
  width: 320px;
  padding: 10px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
}

.filter-select {
  padding: 10px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  color: #1e293b;
  min-width: 200px;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 16px;
  justify-content: center;
}

.pagination span {
  font-size: 14px;
  color: #64748b;
}

.btn-page {
  padding: 8px 20px;
  background: #f1f5f9;
  color: #1e293b;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}

.btn-page:disabled {
  opacity: 0.4;
  cursor: default;
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

.badge-status-green {
  color: #16a34a;
  font-size: 13px;
  white-space: nowrap;
}

.badge-status-red {
  color: #dc2626;
  font-size: 13px;
  white-space: nowrap;
}

.badge-status-gray {
  color: #94a3b8;
  font-size: 13px;
}

.actions-cell {
  text-align: center;
}

.dropdown {
  position: relative;
  display: inline-block;
}

.btn-dots {
  background: none;
  border: none;
  font-size: 20px;
  color: #64748b;
  cursor: pointer;
  padding: 2px 8px;
  border-radius: 6px;
  line-height: 1;
  letter-spacing: 1px;
}

.btn-dots:hover {
  background: #f1f5f9;
  color: #1e293b;
}

.dropdown-menu {
  position: fixed;
  transform: translateX(-100%);
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.10);
  min-width: 168px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  padding: 4px 0;
}

.dropdown-item {
  background: none;
  border: none;
  text-align: left;
  padding: 9px 16px;
  font-size: 14px;
  color: #1e293b;
  cursor: pointer;
  white-space: nowrap;
}

.dropdown-item:hover {
  background: #f8fafc;
}

.dropdown-item-delete {
  color: #dc2626;
}

.inn-error {
  margin-top: 2px;
}

.block-row {
  display: flex;
  gap: 8px;
}

.block-value {
  width: 90px;
  flex-shrink: 0;
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

.warn-toast {
  background: #fefce8;
  border: 1px solid #fde047;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #854d0e;
}

.warn-toast button {
  background: none;
  border: none;
  cursor: pointer;
  color: #854d0e;
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

.camera-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.camera-idle,
.camera-live,
.camera-preview {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.btn-camera {
  padding: 10px 14px;
  background: #f1f5f9;
  color: #1e293b;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  text-align: center;
}

.camera-video {
  width: 100%;
  border-radius: 8px;
  background: #000;
}

.photo-preview {
  width: 100%;
  border-radius: 8px;
  object-fit: cover;
}

.btn-retake {
  padding: 8px 14px;
  font-size: 13px;
}

.access-code-modal {
  width: 400px;
  text-align: center;
}

.access-code-name {
  font-size: 16px;
  color: #475569;
  margin: 0;
}

.access-code-block {
  background: #f1f5f9;
  border-radius: 10px;
  padding: 20px;
}

.access-code {
  font-family: monospace;
  font-size: 36px;
  font-weight: 700;
  color: #2563eb;
  letter-spacing: 2px;
}

.skeleton-cell {
  height: 16px;
  background: #e2e8f0;
  border-radius: 4px;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

@keyframes skeleton-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.fade-in {
  animation: fade-in 0.3s ease;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>