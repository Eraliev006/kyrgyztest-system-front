import { useState } from 'react'
import { CalendarIcon } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'

import { cn } from '@/shared/lib/utils'
import { Button, buttonVariants } from '@/shared/ui/button'
import { Calendar } from '@/shared/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'

interface DatePickerProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  id?: string
  'data-testid'?: string
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Выберите дату',
  id,
  'data-testid': testId,
}: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const selected = value ? parseISO(value) : undefined

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        id={id}
        data-testid={testId}
        className={cn(
          buttonVariants({ variant: 'outline' }),
          'w-full justify-start',
          !value && 'text-muted-foreground'
        )}
      >
        <CalendarIcon className="size-4" />
        {selected ? format(selected, 'd MMMM yyyy', { locale: ru }) : placeholder}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date) => {
            onChange(date ? format(date, 'yyyy-MM-dd') : '')
            setOpen(false)
          }}
        />
        {value && (
          <div className="border-t border-border p-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => {
                onChange('')
                setOpen(false)
              }}
            >
              Очистить
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
