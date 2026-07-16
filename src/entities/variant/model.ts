import type {
  TestVariantSummaryDto,
  TestVariantDetailDto,
  VariantQuestionDto,
} from '@/shared/api/generated/kyrgyzTestAPI.schemas'

export type Variant = TestVariantSummaryDto
export type VariantDetail = TestVariantDetailDto
export type VariantQuestion = VariantQuestionDto
