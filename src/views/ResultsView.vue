<template>
  <div class="layout">
    <AppSidebar />
    <main class="content">
      <div class="header">
        <h2>Результаты тестирования</h2>
      </div>

      <!-- Фильтры -->
      <div class="filters">
        <select v-model="filters.organizationId" @change="loadResults">
          <option :value="undefined">Все организации</option>
          <option v-for="org in organizations" :key="org.id" :value="org.id">
            {{ org.nameRu }}
          </option>
        </select>

        <select v-model="filters.level" @change="loadResults">
          <option :value="undefined">Все уровни</option>
          <option v-for="lvl in ['A1', 'A2', 'B1', 'B2', 'C1']" :key="lvl" :value="lvl">
            {{ lvl }}
          </option>
        </select>

        <div class="date-group">
          <span>От:</span>
          <input type="date" v-model="filters.from" @change="loadResults" />
          <span>До:</span>
          <input type="date" v-model="filters.to" @change="loadResults" />
        </div>
      </div>

      <!-- Таблица -->
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>ФИО</th>
              <th>Организация</th>
              <th>Уровень</th>
              <th>Грамм.</th>
              <th>Ауд.</th>
              <th>Чтен.</th>
              <th>Письмо</th>
              <th>Всего</th>
              <th>Дата</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in results" :key="r.id">
              <td>{{ r.candidateFullName }}</td>
              <td>{{ r.organizationName || '—' }}</td>
              <td>
                <span class="badge-level">{{ r.level }}</span>
              </td>
              <td>{{ r.grammarScore }}</td>
              <td>{{ r.listeningScore }}</td>
              <td>{{ r.readingScore }}</td>
              <td>{{ r.writingScore }}</td>
              <td class="total-score">{{ r.totalScore }}</td>
              <td class="date">{{ formatDate(r.createdAt) }}</td>
              <td>
                <button class="btn-details" @click="openDetails(r)">Подробнее</button>
              </td>
            </tr>
            <tr v-if="results.length === 0">
              <td colspan="10" class="empty">Результатов не найдено</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>

    <!-- Модальное окно с деталями попытки -->
    <div v-if="detailModal.show" class="modal-overlay" @click.self="detailModal.show = false">
      <div class="detail-modal">
        <div class="detail-header">
          <div>
            <h3>{{ detailModal.candidateName }}</h3>
            <span class="detail-meta">{{ detailModal.level }} · {{ detailModal.date }}</span>
          </div>
          <button class="btn-close" @click="detailModal.show = false">✕</button>
        </div>

        <div v-if="detailModal.loading" class="detail-loading">Загрузка...</div>
        <div v-else-if="detailModal.error" class="detail-error">{{ detailModal.error }}</div>
        <div v-else class="detail-body">
          <div v-for="(answers, sectionNum) in groupedAnswers" :key="sectionNum" class="section-block">
            <div class="section-title">{{ sectionLabel(Number(sectionNum)) }}</div>
            <div
              v-for="(answer, idx) in answers"
              :key="idx"
              class="answer-card"
              :class="answer.isCorrect ? 'correct' : 'incorrect'"
            >
              <div class="question-text">{{ idx + 1 }}. {{ answer.questionContent }}</div>

              <!-- MCQ -->
              <template v-if="answer.type === 0">
                <div class="answer-row" :class="answer.isCorrect ? 'text-correct' : 'text-incorrect'">
                  <span class="label">Ответ:</span>
                  <span>{{ answer.selectedOptionContent ?? answer.selectedOptionId ?? '—' }}</span>
                </div>
                <div v-if="!answer.isCorrect" class="answer-row text-correct">
                  <span class="label">Верно:</span>
                  <span>{{ answer.correctOptionContent ?? answer.correctOptionId ?? '—' }}</span>
                </div>
              </template>

              <!-- WordOrder / SentenceOrder -->
              <template v-else>
                <div class="answer-row" :class="answer.isCorrect ? 'text-correct' : 'text-incorrect'">
                  <span class="label">Ответ:</span>
                  <span>{{ (answer.orderedAnswer ?? []).join(' → ') || '—' }}</span>
                </div>
                <div v-if="!answer.isCorrect" class="answer-row text-correct">
                  <span class="label">Верно:</span>
                  <span>{{ (answer.correctOrder ?? []).join(' → ') || '—' }}</span>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AppSidebar from '../components/AppSidebar.vue'
import { getAll as getResults, getDetails } from '../api/results'
import { getAll as getOrgs } from '../api/organizations'
import type { ExamResult, Organization, AttemptAnswerDetailDto } from '../types'

const results = ref<ExamResult[]>([])
const organizations = ref<Organization[]>([])

const filters = ref({
  organizationId: undefined,
  level: undefined,
  from: '',
  to: ''
})

const detailModal = ref({
  show: false,
  loading: false,
  error: '',
  candidateName: '',
  level: '',
  date: '',
  answers: [] as AttemptAnswerDetailDto[]
})

const groupedAnswers = computed(() => {
  const groups: Record<number, AttemptAnswerDetailDto[]> = {}
  for (const a of detailModal.value.answers) {
    if (!groups[a.section]) groups[a.section] = []
    groups[a.section].push(a)
  }
  return groups
})

onMounted(async () => {
  await Promise.all([loadResults(), loadOrgs()])
})

async function loadResults() {
  const res = await getResults(filters.value)
  results.value = res.data
}

async function loadOrgs() {
  const res = await getOrgs()
  organizations.value = res.data
}

async function openDetails(r: ExamResult) {
  detailModal.value = {
    show: true,
    loading: true,
    error: '',
    candidateName: r.candidateFullName,
    level: r.level,
    date: formatDate(r.createdAt),
    answers: []
  }
  try {
    const res = await getDetails(r.id)
    detailModal.value.answers = res.data
  } catch {
    detailModal.value.error = 'Не удалось загрузить детали попытки'
  } finally {
    detailModal.value.loading = false
  }
}

function sectionLabel(s: number) {
  return ['Грамматика', 'Аудирование', 'Чтение', 'Письмо'][s] ?? `Секция ${s}`
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
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

.filters {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  align-items: center;
  flex-wrap: wrap;
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

.badge-level {
  background: #e0f2fe;
  color: #0369a1;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 12px;
}

.total-score {
  font-weight: 700;
  color: #2563eb;
}

.date {
  color: #64748b;
  font-size: 13px;
}

.empty {
  text-align: center;
  color: #94a3b8;
  padding: 40px !important;
}

.btn-details {
  padding: 6px 14px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
}

.btn-details:hover {
  background: #1d4ed8;
}

/* Detail modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.detail-modal {
  background: white;
  border-radius: 12px;
  width: 720px;
  max-width: 95vw;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.detail-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 24px 28px 16px;
  border-bottom: 1px solid #f1f5f9;
  flex-shrink: 0;
}

.detail-header h3 {
  font-size: 18px;
  color: #1e293b;
  margin: 0 0 4px;
}

.detail-meta {
  font-size: 13px;
  color: #64748b;
}

.btn-close {
  background: none;
  border: none;
  font-size: 18px;
  color: #94a3b8;
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
}

.btn-close:hover {
  color: #1e293b;
}

.detail-loading,
.detail-error {
  padding: 40px;
  text-align: center;
  color: #64748b;
  font-size: 14px;
}

.detail-error {
  color: #dc2626;
}

.detail-body {
  overflow-y: auto;
  padding: 20px 28px 28px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section-block {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #0369a1;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding-bottom: 6px;
  border-bottom: 2px solid #e0f2fe;
}

.answer-card {
  border-radius: 8px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  border-left: 3px solid transparent;
}

.answer-card.correct {
  background: #f0fdf4;
  border-left-color: #16a34a;
}

.answer-card.incorrect {
  background: #fef2f2;
  border-left-color: #dc2626;
}

.question-text {
  font-size: 13px;
  color: #1e293b;
  font-weight: 500;
  line-height: 1.4;
}

.answer-row {
  display: flex;
  gap: 6px;
  font-size: 13px;
  align-items: flex-start;
}

.answer-row .label {
  font-weight: 600;
  min-width: 52px;
  flex-shrink: 0;
}

.text-correct {
  color: #15803d;
}

.text-incorrect {
  color: #dc2626;
}

@media print {
  .sidebar, .filters {
    display: none !important;
  }
  .content {
    padding: 0;
    background: white;
  }
  .table-wrapper {
    box-shadow: none;
  }
}
</style>
