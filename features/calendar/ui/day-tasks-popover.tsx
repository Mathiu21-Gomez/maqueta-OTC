'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { AlertTriangle, ArrowRight } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover'
import type { Tarea } from '@/features/tasks/domain/task.types'
import { cn } from '@/lib/utils'

interface DayTasksPopoverProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  anchor: ReactNode
  dayLabel: string
  tasks: Tarea[]
  allOverdue: boolean
}

function todayKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function DayTasksPopover({ open, onOpenChange, anchor, dayLabel, tasks, allOverdue }: DayTasksPopoverProps) {
  const count = tasks.length
  const today = todayKey()

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverAnchor asChild>{anchor}</PopoverAnchor>
      <PopoverContent
        align="center"
        sideOffset={6}
        className="w-80 p-0"
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <header className="flex items-start justify-between gap-2 border-b border-border/60 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold capitalize text-foreground">{dayLabel}</p>
            <p className="text-xs text-muted-foreground">
              {count === 1 ? '1 tarea con vencimiento' : `${count} tareas con vencimiento`}
            </p>
          </div>
          <Badge
            className={cn(
              'shrink-0 text-[10px] font-semibold uppercase tracking-wide',
              allOverdue ? 'bg-danger/15 text-danger-emphasis' : 'bg-primary/10 text-primary',
            )}
          >
            {allOverdue ? 'Vencidas' : 'Por vencer'}
          </Badge>
        </header>

        <ul className="flex max-h-72 flex-col divide-y divide-border/50 overflow-y-auto">
          {tasks.map((task) => {
            const overdue = task.fechaFin < today
            return (
              <li key={task.id}>
                <Link
                  href="/tareas"
                  onClick={() => onOpenChange(false)}
                  className="group flex flex-col gap-1.5 px-4 py-3 transition-colors hover:bg-accent/60 focus-visible:bg-accent/60 focus-visible:outline-none"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-medium leading-tight text-foreground">{task.nombre}</span>
                    <ArrowRight
                      className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100 group-focus-visible:opacity-100"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="truncate">{task.areas.join(', ')}</span>
                    <span aria-hidden="true">·</span>
                    <Badge variant="outline" className="text-[10px]">
                      {task.estado}
                    </Badge>
                    {overdue ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase text-danger-emphasis">
                        <AlertTriangle className="size-3" />
                        Vencida
                      </span>
                    ) : null}
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </PopoverContent>
    </Popover>
  )
}
