import api from './index'
import type { Candidate, StartExamResult, SectionStartResult, SectionSubmitResult } from '../types'

export const unlock = (password: string) =>
  api.post('/exam/unlock', { password })

export const examLogin = (accessCode: string) =>
  api.post<Candidate>('/exam/login', { accessCode })

export const startExam = (candidateId: string) =>
  api.post<StartExamResult>('/exam/start', { candidateId })

export const saveAnswer = (
  attemptId: string,
  questionId: string,
  selectedOptionId?: string,
  orderedAnswer?: string[],
) => api.post('/exam/answer', {
  attemptId,
  questionId,
  selectedOptionId,
  orderedAnswer: orderedAnswer ? JSON.stringify(orderedAnswer) : undefined,
})

export const startSection = (attemptId: string, section: number) =>
  api.post<SectionStartResult>('/exam/section/start', { attemptId, section })

export const submitSection = (attemptId: string, section: number) =>
  api.post<SectionSubmitResult>('/exam/section/submit', { attemptId, section })
