import { useState } from 'react'
import { useGetApiVariantsId } from '@/shared/api/generated/test-variant/test-variant'
import type { VariantQuestion } from '@/entities/variant'
import { ReplaceQuestionDialog } from '@/features/variant-builder/ReplaceQuestionDialog'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'

export function VariantDetail({ variantId }: { variantId: string }) {
  const { data: response, isLoading } = useGetApiVariantsId(variantId)
  const detail = response?.data
  const [replacing, setReplacing] = useState<VariantQuestion | null>(null)

  if (isLoading) return <p className="text-sm text-muted-foreground">Загрузка...</p>
  if (!detail) return null

  const sections = Object.entries(detail.questionsBySection ?? {})

  return (
    <div className="flex flex-col gap-4">
      {sections.map(([section, questions]) => (
        <Card key={section}>
          <CardHeader>
            <CardTitle>{section}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {questions?.map((question) => (
              <div key={question.id} className="flex items-center justify-between gap-2">
                <span className="text-sm">
                  {question.content}{' '}
                  <span className="text-muted-foreground">
                    ({question.level}, {question.type})
                  </span>
                </span>
                <Button variant="outline" size="sm" onClick={() => setReplacing(question ?? null)}>
                  Заменить
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

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
