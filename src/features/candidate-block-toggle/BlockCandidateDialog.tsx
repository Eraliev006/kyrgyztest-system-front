import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import {
  usePutApiCandidatesIdBlock,
  getGetApiCandidatesQueryKey,
} from '@/shared/api/generated/candidate/candidate'
import { blockDurationUnits, type Candidate } from '@/entities/candidate'
import { ApiError } from '@/shared/api/instance'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'

const unitLabels: Record<(typeof blockDurationUnits)[number], string> = {
  days: 'дней',
  weeks: 'недель',
  months: 'месяцев',
  years: 'лет',
}

const blockSchema = z.object({
  value: z.coerce.number().int().min(1, 'Должно быть больше нуля'),
  unit: z.enum(blockDurationUnits),
})

type BlockFormInput = z.input<typeof blockSchema>
type BlockFormValues = z.output<typeof blockSchema>

interface BlockCandidateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  candidate: Candidate
}

export function BlockCandidateDialog({ open, onOpenChange, candidate }: BlockCandidateDialogProps) {
  const queryClient = useQueryClient()
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<BlockFormInput, unknown, BlockFormValues>({
    resolver: zodResolver(blockSchema),
    defaultValues: { value: 1, unit: 'days' },
  })

  const mutation = usePutApiCandidatesIdBlock({
    mutation: {
      onSuccess: () => {
        toast.success('Кандидат заблокирован')
        onOpenChange(false)
      },
      onError: (error) => toast.error(error instanceof ApiError ? error.message : 'Ошибка'),
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: getGetApiCandidatesQueryKey() })
      },
    },
  })

  function onSubmit(values: BlockFormValues) {
    mutation.mutate({ id: candidate.id!, data: values })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="block-candidate-dialog">
        <DialogHeader>
          <DialogTitle>Заблокировать кандидата «{candidate.fullName}»</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex gap-3">
            <div className="flex flex-1 flex-col gap-1.5">
              <Label htmlFor="value">Срок</Label>
              <Input
                id="value"
                type="number"
                min={1}
                data-testid="block-value-input"
                {...register('value')}
              />
              {errors.value && <p className="text-sm text-destructive">{errors.value.message}</p>}
            </div>
            <div className="flex flex-1 flex-col gap-1.5">
              <Label>Единица</Label>
              <Controller
                control={control}
                name="unit"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {blockDurationUnits.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unitLabels[unit]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              variant="destructive"
              disabled={mutation.isPending}
              data-testid="block-candidate-confirm"
            >
              Заблокировать
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
