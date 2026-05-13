import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import type { SectionMeta, ExamQuestion, SubmitResult } from '../types'
import {
  startExam as apiStartExam,
  saveAnswer as apiSaveAnswer,
  startSection as apiStartSection,
  submitSection as apiSubmitSection,
} from '../api/exam'

interface Answer {
  selectedOptionId?: string
  orderedAnswer?: string[]
}

export const useExamStore = defineStore('exam', () => {
  const attemptId = ref<string | null>(null)
  const sectionMeta = ref<SectionMeta[]>([])
  const activeSection = ref<number | null>(null)
  const activeSectionQuestions = ref<ExamQuestion[]>([])
  const currentQuestionIndex = ref(0)
  const answers = reactive(new Map<string, Answer>())
  const result = ref<SubmitResult | null>(null)
  const status = ref<'idle' | 'in_progress' | 'completed'>('idle')

  async function start(candidateId: string) {
    const res = await apiStartExam(candidateId)
    attemptId.value = res.data.attemptId
    sectionMeta.value = res.data.sections
    activeSection.value = null
    activeSectionQuestions.value = []
    currentQuestionIndex.value = 0
    answers.clear()
    result.value = null
    status.value = 'in_progress'
  }

  async function startSection(section: number) {
    if (!attemptId.value) return
    const res = await apiStartSection(attemptId.value, section)
    activeSectionQuestions.value = res.data.questions
    currentQuestionIndex.value = 0
    activeSection.value = section
  }

  async function saveAnswer(questionId: string, selectedOptionId?: string, orderedAnswer?: string[]) {
    if (!attemptId.value) return
    await apiSaveAnswer(attemptId.value, questionId, selectedOptionId, orderedAnswer)
    answers.set(questionId, { selectedOptionId, orderedAnswer })
  }

  function nextQuestion() {
    if (currentQuestionIndex.value < activeSectionQuestions.value.length - 1) {
      currentQuestionIndex.value++
    }
  }

  async function submitSection(section: number) {
    if (!attemptId.value) return
    const res = await apiSubmitSection(attemptId.value, section)
    if (res.data.isExamCompleted) {
      result.value = res.data.result ?? null
      status.value = 'completed'
    } else {
      const idx = sectionMeta.value.findIndex(s => s.section === section)
      if (idx !== -1) {
        sectionMeta.value[idx] = { ...sectionMeta.value[idx], isCompleted: true }
      }
      activeSection.value = null
      activeSectionQuestions.value = []
    }
  }

  // called by question components on last question
  async function submit() {
    if (activeSection.value === null) return
    await submitSection(activeSection.value)
  }

  return {
    attemptId,
    sectionMeta,
    activeSection,
    activeSectionQuestions,
    currentQuestionIndex,
    answers,
    result,
    status,
    start,
    startSection,
    saveAnswer,
    nextQuestion,
    submitSection,
    submit,
  }
})
