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
  blockedUntil?: string | null
  createdAt: string
  organizationId?: string
  organizationName?: string
  photo?: string
}


export interface CreateCandidateRequest {
  fullName: string
  inn: string
  organizationId?: string
}

export interface Organization {
  id: string
  nameRu: string
  nameKg: string
  shortName: string
}

export interface OrganizationPayload {
  nameRu: string
  nameKg: string
  shortName: string
}

export interface ExamResult {
  id: string
  candidateFullName: string
  organizationName?: string
  level: string
  grammarScore: number
  listeningScore: number
  readingScore: number
  writingScore: number
  totalScore: number
  createdAt: string
}

export interface StatsLevelBreakdown {
  level: string
  count: number
}

export interface StatsResponse {
  totalPassed: number
  averageScore: number
  levelBreakdown: StatsLevelBreakdown[]
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
  topicId?: string | null
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
  topicId?: string | null
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
  number: number
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

export interface User {
  id: string
  fullName: string
  login: string
  role: string
  createdAt: string
}

export interface CreateUserRequest {
  fullName: string
  login: string
  password: string
  role: string
}

export interface UpdateUserRequest {
  fullName: string
  login: string
  role: string
}

export interface SectionConfig {
  id: string
  section: number
  timeLimitMinutes: number
  a1Count: number
  a2Count: number
  b1Count: number
  b2Count: number
}

export interface SectionConfigPayload {
  section: number
  timeLimitMinutes: number
  a1Count: number
  a2Count: number
  b1Count: number
  b2Count: number
}

export interface Topic {
  id: string
  name: string
  section: number | null
}

export interface TopicPayload {
  name: string
  section: number | null
}

export interface AuditLog {
  id: string
  createdAt: string
  employeeName: string
  action: string
  entityType: string
  description: string
}

export interface CandidateListResponse {
  items: Candidate[]
  total: number
  page: number
  pageSize: number
}

export interface AttemptAnswerDetailDto {
  questionContent: string
  section: number
  level: number
  type: number
  isCorrect: boolean
  selectedOptionId?: string
  selectedOptionContent?: string
  correctOptionId?: string
  correctOptionContent?: string
  orderedAnswer?: string[]
  correctOrder?: string[]
}