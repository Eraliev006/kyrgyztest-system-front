<template>
  <div class="layout">
    <AppSidebar />
    <main class="content">
      <div class="header">
        <h2>Банк вопросов</h2>
        <button @click="openCreateForm">+ Добавить вопрос</button>
      </div>

      <!-- Фильтры -->
      <div class="filters">
        <select v-model="filterSection" @change="loadQuestions">
          <option value="">Все секции</option>
          <option value="0">Грамматика</option>
          <option value="1">Аудирование</option>
          <option value="2">Чтение</option>
          <option value="3">Письмо</option>
        </select>
        <select v-model="filterLevel" @change="loadQuestions">
          <option value="">Все уровни</option>
          <option value="0">A1</option>
          <option value="1">A2</option>
          <option value="2">B1</option>
          <option value="3">B2</option>
        </select>
      </div>

      <!-- Таблица -->
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Секция</th>
              <th>Уровень</th>
              <th>Тип</th>
              <th>Вопрос</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="q in questions" :key="q.id">
              <td><span class="badge-section">{{ sectionLabel(q.section) }}</span></td>
              <td><span class="badge-level">{{ levelLabel(q.level) }}</span></td>
              <td>{{ typeLabel(q.type) }}</td>
              <td class="question-content">{{ q.content }}</td>
              <td>
                <button class="btn-edit" @click="openEditForm(q)">Изменить</button>
                <button class="btn-delete" @click="deleteQuestion(q.id)">Удалить</button>
              </td>
            </tr>
            <tr v-if="questions.length === 0">
              <td colspan="5" class="empty">Нет вопросов</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Модальное окно -->
      <div v-if="showForm" class="modal-overlay" @click.self="closeForm">
        <div class="modal">
          <h3>{{ editingId ? 'Редактировать вопрос' : 'Новый вопрос' }}</h3>

          <div class="pill-row">
            <button
              v-for="(label, idx) in ['Грамматика', 'Аудирование', 'Чтение', 'Письмо']"
              :key="idx"
              type="button"
              class="pill"
              :class="{ active: Number(form.section) === idx }"
              @click="form.section = idx"
            >{{ label }}</button>
          </div>
          <div class="pill-row">
            <button
              v-for="(label, idx) in ['A1', 'A2', 'B1', 'B2']"
              :key="idx"
              type="button"
              class="pill"
              :class="{ active: Number(form.level) === idx }"
              @click="form.level = idx"
            >{{ label }}</button>
          </div>

          <textarea v-model="form.content" placeholder="Текст вопроса" rows="3" @input="contentUserEdited = true" />

          <div v-if="Number(form.section) === 0" class="topic-dropdown" :class="{ open: topicDropdownOpen }">
            <button type="button" class="topic-trigger" @click="topicDropdownOpen = !topicDropdownOpen">
              <span>{{ selectedTopicLabel() }}</span>
              <svg class="topic-arrow" viewBox="0 0 16 16" fill="none">
                <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div v-if="topicDropdownOpen" class="topic-list">
              <button type="button" class="topic-option" :class="{ selected: form.topicId === null }" @click="selectTopic(null)">
                Без подтемы
              </button>
              <button
                v-for="t in topics"
                :key="t.id"
                type="button"
                class="topic-option"
                :class="{ selected: form.topicId === t.id }"
                @click="selectTopic(t.id)"
              >{{ t.name }}</button>
              <span v-if="topics.length === 0" class="topic-empty">Нет подтем</span>
            </div>
          </div>

          <!-- Media Group -->
          <div v-if="form.section == 1 || form.section == 2" class="media-section">
            <p class="media-label">{{ form.section == 1 ? 'Аудио файл' : 'Текст для чтения' }}</p>
            <div v-if="form.section == 1">
              <input type="file" accept=".mp3,.wav,.ogg" @change="uploadAudio" />
              <p v-if="form.mediaUrl" class="media-url">{{ form.mediaUrl }}</p>
            </div>
            <div v-else>
              <textarea v-model="form.mediaText" placeholder="Текст для чтения" rows="4" />
            </div>
          </div>

          <!-- Варианты ответа (MCQ) -->
          <div v-if="form.type == 0" class="options-section">
            <p class="options-label">Варианты ответа</p>
            <div v-for="(opt, i) in form.answerOptions" :key="i" class="option-row">
              <input v-model="opt.content" :placeholder="`Вариант ${i + 1}`" />
              <label>
                <input type="radio" :value="i" v-model="correctIndex" />
                Верный
              </label>
              <button class="btn-remove" @click="removeOption(i)">✕</button>
            </div>
            <button class="btn-add-option" @click="addOption">+ Добавить вариант</button>
          </div>

          <!-- WordOrder / SentenceOrder -->
          <div v-if="form.type == 1 || form.type == 2" class="options-section">
            <p class="options-label">
              {{ form.type == 1 ? 'Слова в правильном порядке' : 'Предложения в правильном порядке' }}
            </p>
            <div v-for="(opt, i) in form.answerOptions" :key="i" class="option-row">
              <span class="order-index">{{ i + 1 }}</span>
              <input v-model="opt.content" :placeholder="form.type == 1 ? `Слово ${i + 1}` : `Предложение ${i + 1}`" />
              <button class="btn-remove" @click="removeOption(i)">✕</button>
            </div>
            <button class="btn-add-option" @click="addOption">+ Добавить</button>
          </div>

          <p v-if="formError" class="error">{{ formError }}</p>

          <div class="modal-actions">
            <button class="btn-secondary" @click="closeForm">Отмена</button>
            <button @click="submitForm" :disabled="saving">
              {{ saving ? 'Сохранение...' : 'Сохранить' }}
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, onBeforeUnmount } from 'vue'
import AppSidebar from '../components/AppSidebar.vue'
import { getAll, create, update, remove, createMediaGroup } from '../api/questions'
import { getAll as getTopics } from '../api/topics'
import type { QuestionResponse, CreateAnswerOptionRequest, Topic } from '../types'

import axios from 'axios'

const questions = ref<QuestionResponse[]>([])
const filterSection = ref('')
const filterLevel = ref('')
const showForm = ref(false)
const saving = ref(false)
const formError = ref('')
const editingId = ref<string | null>(null)
const correctIndex = ref(0)
const topics = ref<Topic[]>([])
const topicDropdownOpen = ref(false)

function selectedTopicLabel() {
  if (form.value.topicId === null) return 'Без подтемы'
  return topics.value.find(t => t.id === form.value.topicId)?.name ?? 'Без подтемы'
}

function selectTopic(id: string | null) {
  form.value.topicId = id
  topicDropdownOpen.value = false
}

function handleTopicClickOutside(e: MouseEvent) {
  const el = document.querySelector('.topic-dropdown')
  if (el && !el.contains(e.target as Node)) {
    topicDropdownOpen.value = false
  }
}

watch(topicDropdownOpen, (open) => {
  if (open) document.addEventListener('mousedown', handleTopicClickOutside)
  else document.removeEventListener('mousedown', handleTopicClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleTopicClickOutside)
})

const form = ref({
  section: 0,
  level: 0,
  type: 0,
  content: '',
  mediaGroupId: undefined as string | undefined,
  mediaUrl: '',
  mediaText: '',
  topicId: null as string | null,
  answerOptions: [
    { content: '', isCorrect: false, orderIndex: 0 },
    { content: '', isCorrect: false, orderIndex: 1 },
    { content: '', isCorrect: false, orderIndex: 2 },
    { content: '', isCorrect: false, orderIndex: 3 },
  ]
})

const autoType = computed(() => {
  if (Number(form.value.section) !== 3) return 0 // MCQ
  if (Number(form.value.level) <= 1) return 1     // Word Order (A1, A2)
  return 2                                         // Sentence Order (B1, B2)
})

watch(autoType, (val) => {
  form.value.type = val
  form.value.answerOptions = []
})

const contentUserEdited = ref(false)

watch(
  () => [form.value.section, form.value.level] as const,
  ([section, level]) => {
    if (Number(section) !== 3) return
    if (contentUserEdited.value) return
    form.value.content = Number(level) <= 1
      ? 'Расставьте слова в правильном порядке'
      : 'Расставьте предложения в правильном порядке'
  }
)

watch(
  () => form.value.section,
  (section) => {
    form.value.topicId = null
    loadTopicsForSection(section)
  }
)

onMounted(() => {
  loadQuestions()
  loadTopicsForSection(form.value.section)
})

async function loadTopicsForSection(section: number) {
  const res = await getTopics(String(section))
  topics.value = res.data
}

async function loadQuestions() {
  const res = await getAll(
    filterSection.value || undefined,
    filterLevel.value || undefined
  )
  questions.value = res.data
}

function openCreateForm() {
  editingId.value = null
  contentUserEdited.value = false
  resetForm()
  showForm.value = true
}

function openEditForm(q: QuestionResponse) {
  contentUserEdited.value = true
  editingId.value = q.id
  form.value = {
    section: q.section,
    level: q.level,
    type: q.type,
    content: q.content,
    mediaGroupId: q.mediaGroupId,
    mediaUrl: q.mediaUrl || '',
    mediaText: q.mediaText || '',
    topicId: q.topicId ?? null,
    answerOptions: q.answerOptions.map(a => ({
      content: a.content,
      isCorrect: a.isCorrect,
      orderIndex: a.orderIndex
    }))
  }
  correctIndex.value = q.answerOptions.findIndex(a => a.isCorrect)
  loadTopicsForSection(q.section)
  showForm.value = true
}

function closeForm() {
  showForm.value = false
  formError.value = ''
}

function resetForm() {
  form.value = {
    section: 0,
    level: 0,
    type: 0,
    content: '',
    mediaGroupId: undefined,
    mediaUrl: '',
    mediaText: '',
    topicId: null,
    answerOptions: [
      { content: '', isCorrect: false, orderIndex: 0 },
      { content: '', isCorrect: false, orderIndex: 1 },
      { content: '', isCorrect: false, orderIndex: 2 },
      { content: '', isCorrect: false, orderIndex: 3 },
    ]
  }
  correctIndex.value = 0
}

function addOption() {
  form.value.answerOptions.push({
    content: '',
    isCorrect: false,
    orderIndex: form.value.answerOptions.length
  })
}

function removeOption(i: number) {
  form.value.answerOptions.splice(i, 1)
}

async function uploadAudio(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  const formData = new FormData()
  formData.append('file', file)

  const token = localStorage.getItem('token')
  const res = await axios.post('http://localhost:5000/api/files/audio', formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  })

  const mediaRes = await createMediaGroup(1, res.data.url)
  form.value.mediaGroupId = mediaRes.data.id
  form.value.mediaUrl = res.data.url
}

async function submitForm() {
  if (!form.value.content) {
    formError.value = 'Введите текст вопроса'
    return
  }

  // Создаём media group для текста если Reading
  if (form.value.section == 2 && form.value.mediaText && !form.value.mediaGroupId) {
    const mediaRes = await createMediaGroup(0, form.value.mediaText) // 0 = Text
    form.value.mediaGroupId = mediaRes.data.id
  }

  const options: CreateAnswerOptionRequest[] = form.value.type == 0
    ? form.value.answerOptions.map((o, i) => ({
        content: o.content,
        isCorrect: i === correctIndex.value,
        orderIndex: i
      }))
    : form.value.answerOptions.map((o, i) => ({
        content: o.content,
        isCorrect: true,
        orderIndex: i
      }))

  const dto = {
    section: Number(form.value.section),
    level: Number(form.value.level),
    type: Number(form.value.type),
    content: form.value.content,
    mediaGroupId: form.value.mediaGroupId,
    topicId: form.value.topicId || null,
    answerOptions: options
  }

  saving.value = true
  formError.value = ''

  try {
    if (editingId.value) {
      await update(editingId.value, dto)
    } else {
      await create(dto)
    }
    closeForm()
    await loadQuestions()
  } catch (e: any) {
    formError.value = e.response?.data?.message || 'Ошибка при сохранении'
  } finally {
    saving.value = false
  }
}

async function deleteQuestion(id: string) {
  if (!confirm('Удалить вопрос?')) return
  await remove(id)
  await loadQuestions()
}

function sectionLabel(s: number) {
  return ['Грамматика', 'Аудирование', 'Чтение', 'Письмо'][s] ?? s
}

function levelLabel(l: number) {
  return ['A1', 'A2', 'B1', 'B2'][l] || l
}

function typeLabel(t: number) {
  return ['MCQ', 'Порядок слов', 'Порядок предложений'][t] ?? t
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
.header button {
  padding: 10px 20px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.filters {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}
.filters select {
  padding: 8px 12px;
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
table { width: 100%; border-collapse: collapse; }
thead { background: #f1f5f9; }
th { padding: 12px 16px; text-align: left; font-size: 13px; color: #64748b; font-weight: 500; }
td { padding: 12px 16px; font-size: 14px; border-top: 1px solid #f1f5f9; color: #1e293b; }

.question-content {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.badge-section {
  background: #ede9fe;
  color: #6d28d9;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 12px;
}
.badge-level {
  background: #dbeafe;
  color: #1d4ed8;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.btn-edit {
  padding: 5px 10px;
  background: #f1f5f9;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  margin-right: 6px;
}
.btn-delete {
  padding: 5px 10px;
  background: #fee2e2;
  color: #dc2626;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
}

.empty { text-align: center; color: #94a3b8; padding: 40px !important; }

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
  width: 560px;
  max-height: 80vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.modal h3 { font-size: 18px; color: #1e293b; }

.form-row {
  display: flex;
  gap: 8px;
}
.form-row select {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
}

textarea {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  resize: vertical;
  box-sizing: border-box;
}

.media-section { display: flex; flex-direction: column; gap: 8px; }
.media-label { font-size: 13px; color: #64748b; font-weight: 500; }
.media-url { font-size: 12px; color: #2563eb; }

.options-section { display: flex; flex-direction: column; gap: 8px; }
.options-label { font-size: 13px; color: #64748b; font-weight: 500; }
.option-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.option-row input[type="text"],
.option-row input:not([type="radio"]) {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
}
.order-index {
  width: 24px;
  height: 24px;
  background: #e2e8f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #64748b;
  flex-shrink: 0;
}
.btn-remove {
  background: none;
  border: none;
  color: #dc2626;
  cursor: pointer;
  font-size: 16px;
}
.btn-add-option {
  align-self: flex-start;
  padding: 6px 12px;
  background: #f1f5f9;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  color: #475569;
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

.error { color: #dc2626; font-size: 13px; }

.pill-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.pill {
  padding: 6px 16px;
  border: 1.5px solid #e2e8f0;
  border-radius: 20px;
  background: #f8fafc;
  color: #475569;
  font-size: 14px;
  cursor: pointer;
  width: auto;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}
.pill:hover:not(.active) {
  border-color: #94a3b8;
  background: #f1f5f9;
}
.pill.active {
  background: #2563eb;
  color: white;
  border-color: #2563eb;
}
.pill-empty {
  font-size: 14px;
  color: #94a3b8;
}

.topic-dropdown {
  position: relative;
  width: 100%;
}
.topic-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #ffffff;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #1e293b;
  cursor: pointer;
  text-align: left;
  transition: border-color 0.15s;
}
.topic-trigger:hover {
  border-color: #94a3b8;
}
.topic-dropdown.open .topic-trigger {
  border-color: #2563eb;
}
.topic-arrow {
  width: 16px;
  height: 16px;
  color: #94a3b8;
  flex-shrink: 0;
  transition: transform 0.15s;
}
.topic-dropdown.open .topic-arrow {
  transform: rotate(180deg);
}
.topic-list {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: #ffffff;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  z-index: 200;
  padding: 4px;
  display: flex;
  flex-direction: column;
  max-height: 200px;
  overflow-y: auto;
}
.topic-option {
  padding: 8px 10px;
  text-align: left;
  background: none;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  color: #1e293b;
  cursor: pointer;
  transition: background 0.1s;
}
.topic-option:hover {
  background: #f1f5f9;
}
.topic-option.selected {
  background: #eff6ff;
  color: #2563eb;
  font-weight: 500;
}
.topic-empty {
  padding: 8px 10px;
  font-size: 14px;
  color: #94a3b8;
}
</style>