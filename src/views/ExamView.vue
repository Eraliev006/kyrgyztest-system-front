<template>
  <!-- Auth steps (1 & 2) -->
  <div v-if="step <= 2" key="auth" class="exam-wrapper">
    <div class="exam-card">

      <!-- Step 1: Unlock password -->
      <div v-if="step === 1">
        <h2>Кыргыз тили</h2>
        <p>Введите пароль для начала</p>
        <input
          v-model="password"
          type="password"
          placeholder="Пароль"
          @keyup.enter="unlock"
        />
        <p v-if="error" class="error">{{ error }}</p>
        <button @click="unlock" :disabled="loading">
          {{ loading ? 'Проверка...' : 'Войти' }}
        </button>
      </div>

      <!-- Step 2: Candidate access code -->
      <div v-if="step === 2">
        <h2>Введите ваш код</h2>
        <input
          v-model="accessCode"
          type="text"
          placeholder="20250417-1234"
          @keyup.enter="examLogin"
        />
        <p v-if="error" class="error">{{ error }}</p>
        <button @click="examLogin" :disabled="loading">
          {{ loading ? 'Проверка...' : 'Начать тест' }}
        </button>
      </div>

    </div>
  </div>

  <!-- Step 2.5: Photo verification -->
  <div v-else-if="step === 2.5" class="exam-wrapper">
    <div class="exam-card photo-check-card">
      <h2>Проверьте личность кандидата</h2>
      <img :src="candidatePhoto" class="candidate-photo" />
      <p class="candidate-check-name">{{ candidate?.fullName }}</p>
      <button @click="confirmIdentity" :disabled="loading">
        {{ loading ? 'Загрузка...' : 'Подтвердить и начать тест' }}
      </button>
    </div>
  </div>

  <!-- Step 3: Exam -->
  <template v-else key="exam">

    <!-- Result -->
    <ResultScreen v-if="store.status === 'completed'" :result="store.result!" />

    <!-- Section picker -->
    <div v-else-if="store.activeSection === null" class="exam-wrapper">
      <div class="picker-card">
        <h2>Выберите раздел</h2>
        <p class="candidate-name">{{ candidate?.fullName }}</p>
        <div class="sections-grid">
          <button
            v-for="meta in store.sectionMeta"
            :key="meta.section"
            class="section-card"
            :class="{ done: meta.isCompleted }"
            :disabled="meta.isCompleted || sectionLoading"
            @click="enterSection(meta.section)"
          >
            <span class="section-label">{{ sectionName(meta.section) }}</span>
            <span class="section-time">{{ meta.timeLimitMinutes }} мин</span>
            <span v-if="meta.isCompleted" class="done-mark">✓</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Question screen -->
    <div v-else class="exam-screen">
      <div class="exam-header">
        <div class="exam-progress">
          <span>{{ candidate?.fullName }}</span>
          <span>
            {{ sectionName(store.activeSection as number) }} —
            Вопрос {{ store.currentQuestionIndex + 1 }}/{{ store.activeSectionQuestions.length }}
          </span>
        </div>
        <ExamTimer
          :key="store.activeSection"
          :seconds="(activeSectionMeta?.timeLimitMinutes ?? 0) * 60"
          @expired="store.submitSection(store.activeSection as number)"
        />
      </div>
      <div class="exam-body">
        <McqQuestion
          v-if="currentQuestion && currentQuestion.type === 0"
          :key="currentQuestion.id"
          :question="currentQuestion"
          :is-last="isLastQuestion"
        />
        <WordOrderQuestion
          v-else-if="currentQuestion && currentQuestion.type === 1"
          :key="currentQuestion.id"
          :question="currentQuestion"
          :is-last="isLastQuestion"
        />
        <SentenceOrderQuestion
          v-else-if="currentQuestion && currentQuestion.type === 2"
          :key="currentQuestion.id"
          :question="currentQuestion"
          :is-last="isLastQuestion"
        />
      </div>
    </div>

  </template>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { unlock as unlockApi, examLogin as examLoginApi } from '../api/exam'
import { useExamStore } from '../stores/exam'
import type { Candidate } from '../types'
import ExamTimer from '../components/exam/ExamTimer.vue'
import McqQuestion from '../components/exam/McqQuestion.vue'
import WordOrderQuestion from '../components/exam/WordOrderQuestion.vue'
import SentenceOrderQuestion from '../components/exam/SentenceOrderQuestion.vue'
import ResultScreen from '../components/exam/ResultScreen.vue'

const SECTION_NAMES: Record<number, string> = {
  0: 'Грамматика',
  1: 'Аудирование',
  2: 'Чтение',
  3: 'Письмо',
}

function sectionName(section: number): string {
  return SECTION_NAMES[section] ?? `Раздел ${section + 1}`
}

const store = useExamStore()

const step = ref(1)
const password = ref('')
const accessCode = ref('')
const error = ref('')
const loading = ref(false)
const sectionLoading = ref(false)
const candidate = ref<Candidate | null>(null)
const candidatePhoto = ref('')

const activeSectionMeta = computed(() =>
  store.sectionMeta.find(m => m.section === store.activeSection)
)
const currentQuestion = computed(() =>
  store.activeSectionQuestions[store.currentQuestionIndex]
)
const isLastQuestion = computed(() =>
  store.currentQuestionIndex === store.activeSectionQuestions.length - 1
)

async function unlock() {
  if (!password.value) return
  loading.value = true
  error.value = ''
  try {
    await unlockApi(password.value)
    step.value = 2
  } catch {
    error.value = 'Неверный пароль'
  } finally {
    loading.value = false
  }
}

async function examLogin() {
  if (!accessCode.value) return
  loading.value = true
  error.value = ''
  try {
    const res = await examLoginApi(accessCode.value)
    candidate.value = res.data
    if (res.data.photo) {
      candidatePhoto.value = res.data.photo
      step.value = 2.5
    } else {
      await store.start(res.data.id)
      step.value = 3
    }
  } catch (e: any) {
    if (e.response?.status === 404) error.value = 'Кандидат не найден'
    else if (e.response?.status === 403) {
      error.value = e.response?.data?.message || e.response?.data || 'Доступ закрыт'
    }
    else error.value = 'Ошибка входа'
  } finally {
    loading.value = false
  }
}

async function confirmIdentity() {
  loading.value = true
  try {
    await store.start(candidate.value!.id)
    step.value = 3
  } finally {
    loading.value = false
  }
}

async function enterSection(section: number) {
  sectionLoading.value = true
  try {
    await store.startSection(section)
  } finally {
    sectionLoading.value = false
  }
}
</script>

<style scoped>
.exam-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e8f4fd;
}

.exam-card {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  width: 340px;
  text-align: center;
}

h2 {
  margin-bottom: 8px;
  font-size: 22px;
}

p {
  color: #666;
  margin-bottom: 20px;
}

input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  margin-bottom: 12px;
  box-sizing: border-box;
}

button {
  width: 100%;
  padding: 12px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
}

button:disabled {
  opacity: 0.6;
  cursor: default;
}

.error {
  color: red;
  font-size: 14px;
  margin-bottom: 8px;
}

/* Section picker */
.picker-card {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  width: 480px;
  text-align: center;
}

.candidate-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 28px;
}

.sections-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.section-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 24px 16px;
  background: #f0f7ff;
  border: 2px solid #2563eb;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.15s;
  width: 100%;
}

.section-card:hover:not(:disabled) {
  background: #dbeafe;
}

.section-card.done {
  background: #f0fdf4;
  border-color: #16a34a;
}

.section-label {
  font-size: 16px;
  font-weight: 700;
  color: #1e3a8a;
}

.section-card.done .section-label {
  color: #15803d;
}

.section-time {
  font-size: 13px;
  color: #666;
}

.done-mark {
  font-size: 22px;
  color: #16a34a;
  font-weight: bold;
  line-height: 1;
}

/* Exam screen */
.exam-screen {
  min-height: 100vh;
  background: #e8f4fd;
  display: flex;
  flex-direction: column;
}

.exam-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 32px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.exam-progress {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 14px;
  color: #555;
}

.exam-progress span:first-child {
  font-weight: bold;
  font-size: 16px;
  color: #222;
}

.exam-body {
  flex: 1;
  max-width: 760px;
  width: 100%;
  margin: 0 auto;
  padding: 40px 24px;
}

.photo-check-card {
  width: 360px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.candidate-photo {
  width: 200px;
  height: 200px;
  object-fit: cover;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
}

.candidate-check-name {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}
</style>
