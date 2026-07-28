import { useState } from 'react'
import { useGetApiVariantsId } from '@/shared/api/generated/test-variant/test-variant'
import type { SectionType, QuestionType } from '@/shared/api/generated/kyrgyzTestAPI.schemas'
import { sectionLabels } from '@/shared/constants/section-labels'
import { questionTypeLabels } from '@/shared/constants/question-labels'
import type { VariantQuestion } from '@/entities/variant'
import { ReplaceQuestionDialog } from '@/features/variant-builder/ReplaceQuestionDialog'
import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'
import { Accordion, AccordionItem, AccordionTrigger, AccordionPanel } from '@/shared/ui/accordion'

export function VariantDetail({ variantId }: { variantId: string }) {
  const { data: response, isLoading } = useGetApiVariantsId(variantId)
  const detail = response?.data
  const [replacing, setReplacing] = useState<VariantQuestion | null>(null)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {[0, 1].map((i) => (
          <div key={i} className="flex flex-col gap-2 rounded-md border p-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ))}
      </div>
    )
  }
  if (!detail) return null

  const sections = Object.entries(detail.questionsBySection ?? {})

  return (
    <div className="flex flex-col gap-4">
      <Accordion>
        {sections.map(([section, questions]) => (
          <AccordionItem key={section} value={section}>
            <AccordionTrigger>
              {sectionLabels[section as SectionType] ?? section}
              <span className="text-muted-foreground">{questions?.length ?? 0}</span>
            </AccordionTrigger>
            <AccordionPanel>
              <div className="flex max-h-80 flex-col gap-2 overflow-y-auto px-4 pb-3">
                {questions?.map((question) => (
                  <div
                    key={question.id}
                    className="flex items-center justify-between gap-2"
                    data-testid={`variant-question-${question.id}`}
                  >
                    <span className="text-sm">
                      {question.content}{' '}
                      <span className="text-muted-foreground">
                        ({question.level},{' '}
                        {questionTypeLabels[question.type as QuestionType] ?? question.type})
                      </span>
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setReplacing(question ?? null)}
                      data-testid={`variant-question-${question.id}-replace`}
                    >
                      Заменить
                    </Button>
                  </div>
                ))}
              </div>
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>

      {replacing && (
        <ReplaceQuestionDialog
          open={!!replacing}
          onOpenChange={(open) => !open && setReplacing(null)}
          variantId={variantId}
          question={replacing}
        />
      )}
    </div>
  )
}
