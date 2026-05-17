<template>
  <div class="layout">
    <AppSidebar />
    <main class="content">
      <div class="header">
        <h2>Настройки теста</h2>
      </div>

      <!-- Модалка редактирования -->
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal">
          <h3>{{ SECTION_LABELS[editingSection] }}</h3>
          <label>Лимит времени (мин)</label>
          <input v-model.number="form.timeLimitMinutes" type="number" min="1" placeholder="Минуты" />
          <label>Кол-во вопросов A1</label>
          <input v-model.number="form.a1Count" type="number" min="0" />
          <label>Кол-во вопросов A2</label>
          <input v-model.number="form.a2Count" type="number" min="0" />
          <label>Кол-во вопросов B1</label>
          <input v-model.number="form.b1Count" type="number" min="0" />
          <label>Кол-во вопросов B2</label>
          <input v-model.number="form.b2Count" type="number" min="0" />
          <p v-if="formError" class="error">{{ formError }}</p>
          <div class="modal-actions">
            <button class="btn-secondary" @click="closeModal">Отмена</button>
            <button @click="submitForm" :disabled="saving">
              {{ saving ? 'Сохранение...' : 'Сохранить' }}
            </button>
          </div>
        </div>
      </div>

      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Секция</th>
              <th>Лимит времени (мин)</th>
              <th>A1</th>
              <th>A2</th>
              <th>B1</th>
              <th>B2</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="7" class="empty">Загрузка...</td>
            </tr>
            <template v-else>
              <tr v-for="sectionIndex in SECTIONS" :key="sectionIndex">
                <td>{{ SECTION_LABELS[sectionIndex] }}</td>
                <template v-if="configMap[sectionIndex]">
                  <td>{{ configMap[sectionIndex].timeLimitMinutes }}</td>
                  <td>{{ configMap[sectionIndex].a1Count }}</td>
                  <td>{{ configMap[sectionIndex].a2Count }}</td>
                  <td>{{ configMap[sectionIndex].b1Count }}</td>
                  <td>{{ configMap[sectionIndex].b2Count }}</td>
                  <td>
                    <button class="btn-edit" @click="openEdit(sectionIndex)">Редактировать</button>
                  </td>
                </template>
                <template v-else>
                  <td>—</td>
                  <td>—</td>
                  <td>—</td>
                  <td>—</td>
                  <td>—</td>
                  <td>
                    <button class="btn-setup" @click="openEdit(sectionIndex)">Настроить</button>
                  </td>
                </template>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { getAll, create, update } from '../api/sectionconfig'
import type { SectionConfig } from '../types'
import AppSidebar from '../components/AppSidebar.vue'

const SECTIONS = [0, 1, 2, 3] as const
const SECTION_LABELS: Record<number, string> = {
  0: 'Grammar',
  1: 'Listening',
  2: 'Reading',
  3: 'Writing',
}
const SECTION_NAME_TO_INDEX: Record<string, number> = {
  Grammar: 0, Listening: 1, Reading: 2, Writing: 3,
}

const configs = reactive<SectionConfig[]>([])
const loading = ref(false)
const showModal = ref(false)
const saving = ref(false)
const formError = ref('')
const editingSection = ref(0)

const emptyForm = () => ({
  timeLimitMinutes: 0,
  a1Count: 0,
  a2Count: 0,
  b1Count: 0,
  b2Count: 0,
})
const form = ref(emptyForm())

const configMap = computed(() => {
  const map: Record<number, SectionConfig> = {}
  for (const c of configs) {
    const key = SECTION_NAME_TO_INDEX[String(c.section)] ?? Number(c.section)
    map[key] = c
  }
  return map
})

onMounted(async () => {
  loading.value = true
  try {
    const res = await getAll()
    configs.splice(0, configs.length, ...res.data)
  } finally {
    loading.value = false
  }
})

function openEdit(sectionIndex: number) {
  editingSection.value = sectionIndex
  const existing = configMap.value[sectionIndex]
  if (existing) {
    form.value = {
      timeLimitMinutes: existing.timeLimitMinutes,
      a1Count: existing.a1Count,
      a2Count: existing.a2Count,
      b1Count: existing.b1Count,
      b2Count: existing.b2Count,
    }
  } else {
    form.value = emptyForm()
  }
  formError.value = ''
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

async function submitForm() {
  if (form.value.timeLimitMinutes <= 0) {
    formError.value = 'Лимит времени должен быть больше 0'
    return
  }
  saving.value = true
  formError.value = ''
  try {
    const existing = configMap.value[editingSection.value]
    const payload = { section: editingSection.value, ...form.value }
    if (existing) {
      const res = await update(existing.id, payload)
      const idx = configs.findIndex(c => c.id === existing.id)
      if (idx !== -1) configs.splice(idx, 1, res.data)
    } else {
      const res = await create(payload)
      configs.push(res.data)
    }
    closeModal()
  } catch (e: any) {
    formError.value = e.response?.data?.message || 'Ошибка при сохранении'
  } finally {
    saving.value = false
  }
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

.btn-setup {
  padding: 6px 12px;
  background: #dcfce7;
  color: #15803d;
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
  gap: 10px;
}

.modal h3 {
  font-size: 18px;
  color: #1e293b;
  margin-bottom: 4px;
}

.modal label {
  font-size: 13px;
  color: #64748b;
  margin-bottom: -4px;
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

.error {
  color: #dc2626;
  font-size: 13px;
}
</style>
