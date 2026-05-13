export interface LoginRequest {
  login: string
  password: string
}


export interface TokenResponse {
  accessToken: string
  fullName: string
  login: string
  role: string
}


export interface Candidate {
  id: string
  fullName: string
  inn: string
  accessCode: string
  isAllowed: boolean
  createdAt: string
}


export interface CreateCandidateRequest {
  fullName: string
  inn: string
}

export interface AnswerOption {
  id: string
  content: string
  isCorrect: boolean
  orderIndex: number
}

export interface QuestionResponse {
  id: string
  section: number
  level: number
  type: number
  content: string
  mediaGroupId?: string
  mediaUrl?: string
  mediaText?: string
  answerOptions: AnswerOption[]
  createdAt: string
}

export interface CreateAnswerOptionRequest {
  content: string
  isCorrect: boolean
  orderIndex: number
}

export interface CreateQuestionRequest {
  section: number
  level: number
  type: number
  content: string
  mediaGroupId?: string
  answerOptions: CreateAnswerOptionRequest[]
}

export interface MediaGroupResponse {
  id: string
  type: number
  content: string
}

export interface ExamQuestion {
  id: string
  content: string
  type: number
  answerOptions: AnswerOption[]
}

export interface ExamSection {
  section: number
  timeLimitMinutes: number
  questions: ExamQuestion[]
}

export interface SectionMeta {
  section: number
  timeLimitMinutes: number
  isCompleted: boolean
}

export interface StartExamResult {
  attemptId: string
  sections: SectionMeta[]
}

export interface SectionStartResult {
  questions: ExamQuestion[]
}

export interface SectionSubmitResult {
  isExamCompleted: boolean
  result?: SubmitResult
}

export interface SubmitResult {
  level: string
  grammarScore: number
  listeningScore: number
  readingScore: number
  writingScore: number
  totalScore: number
}

export interface VariantSummary {
  id: string
  generatedAt: string
  questionCount: number
}

export interface VariantQuestion {
  id: string
  section: number
  level: number
  type: number
  content: string
}

export interface VariantDetail {
  id: string
  questionsBySection: Record<string, VariantQuestion[]>
}