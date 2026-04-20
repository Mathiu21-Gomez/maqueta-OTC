'use client'

import Link from 'next/link'
import { startTransition, useMemo, useState } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useShellStore } from '@/features/shell/application/shell.store'
import { selectTasks } from '@/features/tasks/application/task.selectors'
import { useTaskStore } from '@/features/tasks/application/task.store'
import type { EstadoTarea, Tarea } from '@/features/tasks/domain/task.types'
import { DayTasksPopover } from '@/features/calendar/ui/day-tasks-popover'
import { cn } from '@/lib/utils'

const DAY_LABELS = ['LU', 'MA', 'MI', 'JU', 'VI', 'SÁ', 'DO']
const MONTH_NAMES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

function parseDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function toKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function isWeekend(d: Date): boolean {
  const dow = d.getDay()
  return dow === 0 || dow === 6
}

function getCalendarDays(year: number, month: number): Date[] {
  const first = new Date(year, month, 1)
  const startDow = (first.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days: Date[] = []
  for (let i = startDow - 1; i >= 0; i--) days.push(new Date(year, month, -i))
  for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d))
  while (days.length % 7 !== 0) days.push(new Date(year, month + 1, days.length - daysInMonth - startDow + 1))
  return days
}

type MilestoneType = 'start' | 'end' | 'overdue' | 'completed'
type RunningColor = 'active' | 'overdue' | 'completed'

const MILESTONE_BG: Record<MilestoneType, string> = {
  start: 'bg-info',
  end: 'bg-warning',
  overdue: 'bg-danger',
  completed: 'bg-success',
}

const RUNNING_BG: Record<RunningColor, string> = {
  active: 'bg-success',
  overdue: 'bg-danger',
  completed: 'bg-info',
}

const ESTADO_TONE: Record<EstadoTarea, string> = {
  Planificado: 'bg-info/10 text-info-emphasis ring-1 ring-info/25',
  'En curso': 'bg-success/10 text-success-emphasis ring-1 ring-success/25',
  Finalizado: 'bg-muted text-muted-foreground ring-1 ring-border',
  Atrasado: 'bg-danger/10 text-danger-emphasis ring-1 ring-danger/25',
}

function runningColorFor(task: Tarea): RunningColor {
  if (task.estado === 'Finalizado') return 'completed'
  if (task.estado === 'Atrasado') return 'overdue'
  return 'active'
}

function milestoneFor(task: Tarea, day: Date): MilestoneType | null {
  const start = parseDate(task.fechaInicio)
  const end = parseDate(task.fechaFin)
  if (isSameDay(start, day)) return 'start'
  if (isSameDay(end, day)) {
    if (task.estado === 'Finalizado') return 'completed'
    if (task.estado === 'Atrasado') return 'overdue'
    return 'end'
  }
  return null
}

export function TaskCalendar() {
  const tasks = useTaskStore(selectTasks)
  const setNuevaTareaSheetOpen = useShellStore((state) => state.setNuevaTareaSheetOpen)

  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])
  const todayKeyStr = useMemo(() => toKey(today), [today])
  const plus7KeyStr = useMemo(() => {
    const d = new Date(today)
    d.setDate(d.getDate() + 7)
    return toKey(d)
  }, [today])

  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState<Date>(today)
  const [popoverOpenKey, setPopoverOpenKey] = useState<string | null>(null)

  const calendarDays = useMemo(() => getCalendarDays(viewYear, viewMonth), [viewYear, viewMonth])

  const runningByDay = useMemo(() => {
    const map = new Map<string, Tarea[]>()
    if (calendarDays.length === 0) return map
    const first = calendarDays[0]
    const last = calendarDays[calendarDays.length - 1]
    for (const task of tasks) {
      const start = parseDate(task.fechaInicio)
      const end = parseDate(task.fechaFin)
      if (end < start) continue
      const from = start < first ? first : start
      const to = end > last ? last : end
      if (from > to) continue
      const cursor = new Date(from)
      while (cursor <= to) {
        if (!isWeekend(cursor)) {
          const key = toKey(cursor)
          const bucket = map.get(key) ?? []
          bucket.push(task)
          map.set(key, bucket)
        }
        cursor.setDate(cursor.getDate() + 1)
      }
    }
    return map
  }, [tasks, calendarDays])

  const dueByDay = useMemo(() => {
    const map = new Map<string, Tarea[]>()
    for (const task of tasks) {
      if (task.estado === 'Finalizado') continue
      const key = task.fechaFin
      const bucket = map.get(key) ?? []
      bucket.push(task)
      map.set(key, bucket)
    }
    return map
  }, [tasks])

  const kpis = useMemo(() => {
    const total = tasks.length
    const enCurso = tasks.filter((t) => t.estado === 'En curso' || t.estado === 'Planificado').length
    const closingThisMonth = tasks.filter((t) => {
      const end = parseDate(t.fechaFin)
      return end.getMonth() === viewMonth && end.getFullYear() === viewYear && t.estado !== 'Finalizado'
    }).length
    const overdue = tasks.filter((t) => t.estado === 'Atrasado').length
    return { total, enCurso, closingThisMonth, overdue }
  }, [tasks, viewMonth, viewYear])

  const selectedKey = toKey(selectedDate)
  const selectedTasks = useMemo(() => {
    const running = runningByDay.get(selectedKey) ?? []
    const seen = new Set<string>()
    return running.filter((task) => (seen.has(task.id) ? false : (seen.add(task.id), true)))
  }, [runningByDay, selectedKey])

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear(viewYear - 1)
    } else {
      setViewMonth(viewMonth - 1)
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear(viewYear + 1)
    } else {
      setViewMonth(viewMonth + 1)
    }
  }

  function goToToday() {
    setViewYear(today.getFullYear())
    setViewMonth(today.getMonth())
    setSelectedDate(today)
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="otc-executive-hero rounded-[calc(var(--radius)+0.5rem)] px-5 py-5 sm:px-6 sm:py-6">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.9fr)]">
          <div className="space-y-5">
            <div className="space-y-3">
              <span className="otc-section-kicker">Lectura temporal</span>
              <div className="space-y-3">
                <h1 className="otc-section-title text-4xl font-semibold text-foreground sm:text-5xl">Calendario operacional</h1>
                <p className="max-w-3xl text-sm leading-7 text-muted-foreground sm:text-[0.95rem]">
                  Visualizá inicios, entregas y ejecuciones del mes en una sola vista.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-4">
              <KpiStat label="Total" value={kpis.total} />
              <KpiStat label="En curso" value={kpis.enCurso} tone="success" />
              <KpiStat label="Cierran este mes" value={kpis.closingThisMonth} tone="warning" />
              <KpiStat label="Atrasadas" value={kpis.overdue} tone="destructive" />
            </div>
          </div>

          <div className="otc-sheet-rail rounded-[calc(var(--radius)+0.125rem)] p-4 sm:p-5">
            <div className="flex h-full flex-col justify-between gap-5">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Atajo</p>
                <p className="text-base font-semibold leading-6 text-foreground">
                  Creá una iniciativa y mirala caer directamente en el mes.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Button onClick={() => startTransition(() => setNuevaTareaSheetOpen(true))}>
                  <PlusCircle data-icon="inline-start" />
                  Nueva tarea
                </Button>
                <Button variant="outline" onClick={goToToday}>
                  Ir a hoy
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Card className="otc-soft-panel">
          <CardContent className="p-5 md:p-6 lg:p-7">
            <div className="mb-1 flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight text-foreground md:text-xl">Mapa mensual</h2>
            </div>
            <p className="mb-5 text-sm text-muted-foreground md:mb-6">
              Cada punto representa un evento — inicio, entrega, completado o vencido. El número en la esquina marca vencimientos del día.
            </p>

            <div className="mb-4 flex items-center justify-between md:mb-5">
              <Button variant="ghost" size="icon" onClick={prevMonth} aria-label="Mes anterior">
                <ChevronLeft className="size-5" />
              </Button>
              <span className="text-base font-semibold capitalize text-foreground md:text-lg">
                {MONTH_NAMES[viewMonth]} {viewYear}
              </span>
              <Button variant="ghost" size="icon" onClick={nextMonth} aria-label="Mes siguiente">
                <ChevronRight className="size-5" />
              </Button>
            </div>

            <div className="mb-1 grid grid-cols-7">
              {DAY_LABELS.map((d) => (
                <div
                  key={d}
                  className="py-2 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground md:py-3 md:text-xs"
                >
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, idx) => {
                const inMonth = day.getMonth() === viewMonth
                const key = toKey(day)
                const running = runningByDay.get(key) ?? []
                const due = dueByDay.get(key) ?? []
                const todayFlag = isSameDay(day, today)
                const isSelected = isSameDay(day, selectedDate)

                let milestone: MilestoneType | null = null
                for (const task of tasks) {
                  const m = milestoneFor(task, day)
                  if (!m) continue
                  if (
                    !milestone ||
                    (m === 'overdue' && milestone !== 'overdue') ||
                    (m === 'end' && (milestone === 'start' || milestone === 'completed')) ||
                    (m === 'start' && milestone === 'completed')
                  ) {
                    milestone = m
                  }
                }

                const extraRunning = milestone ? Math.max(0, running.length - 1) : running.length
                const shownDots = Math.min(extraRunning, 3)
                const overflow = extraRunning - shownDots
                const dotsToShow = (milestone ? running.slice(1) : running).slice(0, shownDots)

                const dueCount = due.length
                const overdueHere = dueCount > 0 && key < todayKeyStr
                const upcomingHere = dueCount > 0 && key >= todayKeyStr && key <= plus7KeyStr

                const dayLabel = day.toLocaleDateString('es-CL', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })

                const cellButton = (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDate(day)
                      if (dueCount > 0) setPopoverOpenKey(key)
                    }}
                    aria-label={`${dayLabel}${dueCount > 0 ? `, ${dueCount} ${dueCount === 1 ? 'vencimiento' : 'vencimientos'}` : ''}${todayFlag ? ', hoy' : ''}`}
                    aria-pressed={isSelected}
                    className={cn(
                      'group relative flex min-h-20 w-full flex-col rounded-xl border border-transparent p-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:min-h-24 md:p-2.5 lg:min-h-28 lg:p-3 xl:min-h-32',
                      inMonth ? 'text-foreground hover:bg-accent/60' : 'text-muted-foreground/30',
                      isSelected && 'border-primary/40 bg-primary/8 ring-1 ring-primary/40',
                      !isSelected && todayFlag && 'bg-primary/5 ring-1 ring-primary/30',
                    )}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <span
                        className={cn(
                          'text-sm font-medium leading-none md:text-base lg:text-lg',
                          todayFlag && 'font-semibold text-primary',
                        )}
                      >
                        {day.getDate()}
                      </span>

                      {dueCount > 0 && inMonth ? (
                        <span
                          className={cn(
                            'inline-flex min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold leading-none tabular-nums md:min-w-[1.125rem] md:text-[11px]',
                            overdueHere
                              ? 'bg-danger text-danger-foreground'
                              : upcomingHere
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-primary/15 text-primary ring-1 ring-primary/30',
                          )}
                          aria-label={`${dueCount} ${dueCount === 1 ? 'tarea' : 'tareas'} con vencimiento`}
                          title={`${dueCount} ${dueCount === 1 ? 'tarea' : 'tareas'} con vencimiento`}
                        >
                          {dueCount}
                        </span>
                      ) : null}
                    </div>

                    {(milestone || extraRunning > 0) && inMonth ? (
                      <div className="mt-auto flex items-center gap-1 md:gap-1.5">
                        {milestone ? (
                          <span
                            aria-hidden="true"
                            className={cn('h-1.5 w-1.5 rounded-full md:h-2 md:w-2 lg:h-2.5 lg:w-2.5', MILESTONE_BG[milestone])}
                          />
                        ) : null}
                        {dotsToShow.map((task, j) => (
                          <span
                            key={`${task.id}-${j}`}
                            aria-hidden="true"
                            title={task.nombre}
                            className={cn('h-1.5 w-1.5 rounded-full md:h-2 md:w-2', RUNNING_BG[runningColorFor(task)])}
                          />
                        ))}
                        {overflow > 0 ? (
                          <span className="text-[10px] font-medium leading-none text-muted-foreground tabular-nums md:text-[11px]">
                            +{overflow}
                          </span>
                        ) : null}
                      </div>
                    ) : null}
                  </button>
                )

                if (dueCount === 0) return <div key={idx}>{cellButton}</div>

                return (
                  <div key={idx}>
                    <DayTasksPopover
                      open={popoverOpenKey === key}
                      onOpenChange={(next) => setPopoverOpenKey(next ? key : null)}
                      anchor={cellButton}
                      dayLabel={dayLabel}
                      tasks={due}
                      allOverdue={overdueHere}
                    />
                  </div>
                )
              })}
            </div>

            <Legend />
          </CardContent>
        </Card>

        <Card className="otc-soft-panel flex max-h-[70vh] flex-col lg:sticky lg:top-6 lg:max-h-[calc(100vh-6rem)]">
          <CardContent className="flex min-h-0 flex-1 flex-col p-5 md:p-6">
            <div className="mb-5 flex shrink-0 items-center justify-between gap-3">
              <div>
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Fecha seleccionada
                </h3>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {isSameDay(selectedDate, today)
                    ? 'Hoy'
                    : selectedDate.toLocaleDateString('es-CL', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                      })}
                </p>
              </div>
              <Badge variant="secondary" className="shrink-0 tabular-nums">
                {selectedTasks.length} {selectedTasks.length === 1 ? 'tarea' : 'tareas'}
              </Badge>
            </div>

            {selectedTasks.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 py-10 text-center">
                <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
                  <CalendarDays className="size-6 text-muted-foreground" aria-hidden="true" />
                </div>
                <p className="text-sm text-muted-foreground">Sin tareas activas en esta fecha.</p>
              </div>
            ) : (
              <div className="-mr-2 flex-1 overflow-y-auto pr-2">
                <div className="flex flex-col gap-3">
                  {selectedTasks.map((task) => (
                    <TaskCard key={task.id} task={task} day={selectedDate} />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function KpiStat({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone?: 'success' | 'warning' | 'destructive'
}) {
  const toneClass =
    tone === 'success'
      ? 'text-success-emphasis'
      : tone === 'warning'
        ? 'text-warning-emphasis'
        : tone === 'destructive'
          ? 'text-danger-emphasis'
          : 'text-foreground'
  return (
    <div className="otc-sheet-rail rounded-[calc(var(--radius)+0.125rem)] px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className={cn('mt-2 text-lg font-semibold otc-data-text tabular-nums', toneClass)}>{value}</p>
    </div>
  )
}

function TaskCard({ task, day }: { task: Tarea; day: Date }) {
  const milestone = milestoneFor(task, day)
  const start = parseDate(task.fechaInicio)
  const end = parseDate(task.fechaFin)
  return (
    <Link
      href="/tareas"
      className="group block rounded-xl border border-border/70 bg-card/80 p-4 transition-colors hover:border-primary/40 hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <p className="text-sm font-semibold leading-tight text-foreground">{task.nombre}</p>
        {milestone ? (
          <Badge
            className={cn(
              'shrink-0 text-[10px] font-semibold uppercase',
              milestone === 'start' && 'bg-info/15 text-info-emphasis',
              milestone === 'end' && 'bg-warning/15 text-warning-emphasis',
              milestone === 'completed' && 'bg-success/15 text-success-emphasis',
              milestone === 'overdue' && 'bg-danger/15 text-danger-emphasis',
            )}
          >
            {milestone === 'start'
              ? 'Inicio'
              : milestone === 'end'
                ? 'Entrega'
                : milestone === 'completed'
                  ? 'Completado'
                  : 'Vencido'}
          </Badge>
        ) : (
          <Badge className="shrink-0 bg-primary/10 text-[10px] font-semibold uppercase text-primary">En curso</Badge>
        )}
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
        <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide', ESTADO_TONE[task.estado])}>
          {task.estado}
        </span>
        <span aria-hidden="true">·</span>
        <span>{task.areas.join(', ')}</span>
      </div>

      <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
        <CalendarClock className="size-3.5 shrink-0" aria-hidden="true" />
        <span>
          {start.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}
          {' — '}
          {end.toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <CalendarCheck className="size-3.5" aria-hidden="true" />
          Avance {task.avanceTotal}%
        </span>
        <span className="inline-flex items-center gap-1 text-primary opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          Ver detalle
          <ArrowRight className="size-3" />
        </span>
      </div>
    </Link>
  )
}

function Legend() {
  return (
    <div className="mt-5 flex flex-col gap-3 border-t border-border/60 pt-4">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">En curso (lun-vie)</span>
        <LegendDot className="bg-success" label="Activa" />
        <LegendDot className="bg-danger" label="Atrasada" />
        <LegendDot className="bg-info" label="Finalizada" />
      </div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Eventos</span>
        <LegendDot className="bg-info" label="Inicio" />
        <LegendDot className="bg-warning" label="Entrega" />
        <LegendDot className="bg-success" label="Completado" />
        <LegendDot className="bg-danger" label="Vencido" />
      </div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Vencimientos</span>
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="inline-flex min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-danger-foreground">
            3
          </span>
          Vencidas
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="inline-flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
            2
          </span>
          Próximas
        </span>
      </div>
    </div>
  )
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className={cn('h-2 w-2 rounded-full', className)} aria-hidden="true" />
      {label}
    </span>
  )
}
