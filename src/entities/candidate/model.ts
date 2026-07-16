import type {
  CandidateResponseDto,
  CreateCandidateDto,
  UpdateCandidateDto,
  BlockCandidateDto,
} from '@/shared/api/generated/kyrgyzTestAPI.schemas'

export type Candidate = CandidateResponseDto
export type { CreateCandidateDto, UpdateCandidateDto, BlockCandidateDto }

export const blockDurationUnits = ['days', 'weeks', 'months', 'years'] as const
export type BlockDurationUnit = (typeof blockDurationUnits)[number]

export function isBlocked(candidate: Candidate): boolean {
  return !!candidate.blockedUntil && new Date(candidate.blockedUntil) > new Date()
}
