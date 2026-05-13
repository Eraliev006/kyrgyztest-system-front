<template>
  <div class="layout">
    <AppSidebar />
    <main class="content">
      <div class="header">
        <button class="btn-back" @click="router.push('/admin/variants')">← Назад</button>
        <h2>Вариант теста</h2>
      </div>

      <div v-for="[key, qs] in Object.entries(questionsBySection)" :key="key" class="section-block">
        <h3 class="section-title">{{ sectionLabel(key) }}</h3>
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Вопрос</th>
                <th>Уровень</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="q in qs" :key="q.id">
                <td class="question-content">{{ q.content }}</td>
                <td><span class="badge-level">{{ levelLabel(q.level) }}</span></td>
                <td>
                  <button class="btn-replace" @click="openReplace(q)">Заменить</button>
                </td>
              </tr>
              <tr v-if="qs.length === 0">
                <td colspan="3" class="empty">Нет вопросов</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Модалка замены -->
      <div v-if="replaceTarget" class="modal-overlay" @click.self="closeReplace">
        <div class="modal">
          <h3>Выбрать замену</h3>
          <p class="modal-sub">
            {{ levelLabel(replaceTarget.level) }}
          </p>

          <div v-if="bankLoading" class="bank-loading">Загрузка...</div>

          <div v-else class="bank-list">
            <div
              v-for="bq in bank"
              :key="bq.id"
              class="bank-item"
              :class="{ selected: selectedBankId === bq.id }"
              @click="selectedBankId = bq.id"
            >
              {{ bq.content }}
            </div>
            <div v-if="bank.length === 0" class="empty">Нет вопросов в банке</div>
          </div>

          <p v-if="replaceError" class="error">{{ replaceError }}</p>

          <div class="modal-actions">
            <button class="btn-secondary" @click="closeReplace">Отмена</button>
            <button @click="confirmReplace" :disabled="!selectedBankId || replacing">
              {{ replacing ? 'Замена...' : 'Заменить' }}
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AppSidebar from '../components/AppSidebar.vue'
import { getById, replaceQuestion } from '../api/variants'
import { getAll as getQuestions } from '../api/questions'
import type { VariantQuestion, QuestionResponse } from '../types'

const router = useRouter()
const route = useRoute()

const variantId = route.params.id as string
const questionsBySection = ref<Record<string, VariantQuestion[]>>({})

const SECTION_LABELS: Record<string, string> = {
  Grammar: 'Грамматика',
  Listening: 'Аудирование',
  Reading: 'Чтение',
  Writing: 'Письмо',
}

const LEVELS = ['A1', 'A2', 'B1', 'B2']

function levelLabel(l: number) { return LEVELS[l] ?? String(l) }
function sectionLabel(key: string) { return SECTION_LABELS[key] ?? key }

onMounted(async () => {
  const res = await getById(variantId)
  questionsBySection.value = res.data.questionsBySection
})

// Replace modal state
const replaceTarget = ref<VariantQuestion | null>(null)
const bank = ref<QuestionResponse[]>([])
const bankLoading = ref(false)
const selectedBankId = ref<string | null>(null)
const replacing = ref(false)
const replaceError = ref('')

async function openReplace(q: VariantQuestion) {
  replaceTarget.value = q
  selectedBankId.value = null
  replaceError.value = ''
  bankLoading.value = true
  try {
    const res = await getQuestions(String(q.section), String(q.level))
    bank.value = res.data.filter(bq => bq.id !== q.id)
  } finally {
    bankLoading.value = false
  }
}

function closeReplace() {
  replaceTarget.value = null
  bank.value = []
  selectedBankId.value = null
  replaceError.value = ''
}

async function confirmReplace() {
  if (!replaceTarget.value || !selectedBankId.value) return
  replacing.value = true
  replaceError.value = ''
  try {
    await replaceQuestion(variantId, replaceTarget.value.id, selectedBankId.value)
    const newQ = bank.value.find(bq => bq.id === selectedBankId.value)!
    for (const arr of Object.values(questionsBySection.value)) {
      const idx = arr.findIndex(q => q.id === replaceTarget.value!.id)
      if (idx !== -1) {
        arr[idx] = { id: newQ.id, section: newQ.section, level: newQ.level, type: newQ.type, content: newQ.content }
        break
      }
    }
    closeReplace()
  } catch (e: any) {
    replaceError.value = e.response?.data?.message || 'Ошибка при замене'
  } finally {
    replacing.value = false
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
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
}

.header h2 {
  font-size: 24px;
  color: #1e293b;
}

.btn-back {
  padding: 8px 14px;
  background: #f1f5f9;
  color: #64748b;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}

.section-block {
  margin-bottom: 32px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 10px;
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

.question-content {
  max-width: 600px;
}

.badge-level {
  background: #e0f2fe;
  color: #0369a1;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.btn-replace {
  padding: 6px 12px;
  background: #f1f5f9;
  color: #475569;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
}

.btn-replace:hover {
  background: #e2e8f0;
}

.empty {
  text-align: center;
  color: #94a3b8;
  padding: 24px !important;
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
  width: 520px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.modal h3 {
  font-size: 18px;
  color: #1e293b;
}

.modal-sub {
  font-size: 13px;
  color: #64748b;
  margin: 0;
}

.bank-loading {
  color: #94a3b8;
  font-size: 14px;
  padding: 16px 0;
}

.bank-list {
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 360px;
}

.bank-item {
  padding: 10px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #1e293b;
  cursor: pointer;
  transition: all 0.15s;
}

.bank-item:hover {
  border-color: #93c5fd;
  background: #eff6ff;
}

.bank-item.selected {
  border-color: #2563eb;
  background: #eff6ff;
  color: #2563eb;
}

.modal-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 4px;
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

.modal-actions button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
