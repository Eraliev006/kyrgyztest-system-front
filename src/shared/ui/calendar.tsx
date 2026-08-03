import * as React from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { DayPicker } from 'react-day-picker'
import { ru } from 'react-day-picker/locale'

import { cn } from '@/shared/lib/utils'
import { buttonVariants } from '@/shared/ui/button'

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      locale={ru}
      className={cn('p-2', className)}
      classNames={{
        months: 'flex flex-col gap-2',
        month: 'flex flex-col gap-3',
        month_caption: 'flex justify-center pt-1 relative items-center w-full',
        caption_label: 'text-sm font-medium',
        nav: 'flex items-center justify-between absolute inset-x-0 top-0',
        button_previous: cn(
          buttonVariants({ variant: 'ghost', size: 'icon-sm' }),
          'bg-transparent p-0'
        ),
        button_next: cn(
          buttonVariants({ variant: 'ghost', size: 'icon-sm' }),
          'bg-transparent p-0'
        ),
        month_grid: 'w-full border-collapse',
        weekdays: 'flex',
        weekday: 'w-8 text-center text-[0.8rem] font-normal text-muted-foreground',
        week: 'mt-1 flex w-full',
        day: 'relative p-0 text-center text-sm',
        day_button: cn(buttonVariants({ variant: 'ghost' }), 'size-8 p-0 font-normal'),
        selected: '[&>button]:bg-primary [&>button]:text-primary-foreground',
        today: '[&>button]:font-semibold [&>button]:text-primary',
        outside: 'text-muted-foreground opacity-50',
        disabled: 'text-muted-foreground opacity-50',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, ...rest }) =>
          orientation === 'left' ? (
            <ChevronLeftIcon className="size-4" {...rest} />
          ) : (
            <ChevronRightIcon className="size-4" {...rest} />
          ),
      }}
      {...props}
    />
  )
}

export { Calendar }
