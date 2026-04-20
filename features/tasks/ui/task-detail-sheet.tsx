'use client'

import {
  Calendar,
  CheckCircle2,
  Circle,
  Clock3,
  Download,
  Users,
} from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { finalizeTask, toggleTaskActivity } from '@/features/tasks/application/task.commands'
import { selectTasks } from '@/features/tasks/application/task.selectors'
import { useTaskStore } from '@/features/tasks/application/task.store'
import { diasRestantes, formatearFecha } from '@/features/tasks/domain/task.rules'
import type { Tarea } from '@/features/tasks/domain/task.types'
import { getAreaColor, getEstadoColor, getPrioridadColor } from '@/features/tasks/ui/task-presentation'
import { useSessionStore } from '@/features/session/application/session.store'
import { useToast } from '@/hooks/use-toast'

interface TaskDetailSheetProps {
  onClose: () => void
  open: boolean
  task: Tarea
}

export function TaskDetailSheet({ onClose, open, task }: TaskDetailSheetProps) {
  const tasks = useTaskStore(selectTasks)
  const rol = useSessionStore((state) => state.rol)
  const { toast } = useToast()
  const reducedMotion = useReducedMotion()

  const currentTask = tasks.find((item) => item.id === task.id) ?? task
  const dias = diasRestantes(currentTask.fechaFin)
  const puedeEditar = rol === 'Administrador' || rol === 'Usuario'
  const completadas = currentTask.actividades.filter((actividad) => actividad.completada).length
  const todasCompletadas = completadas === currentTask.actividades.length
  const statusSummary =
    currentTask.estado === 'Finalizado'
      ? 'Completada'
      : dias < 0
        ? `${Math.abs(dias)} días de atraso`
        : dias === 0
          ? 'Vence hoy'
          : `Faltan ${dias} días`

  const statusTone =
    currentTask.estado === 'Finalizado'
      ? 'text-primary'
      : dias < 0
        ? 'text-destructive'
        : dias <= 3
          ? 'text-amber-600 dark:text-amber-400'
          : 'text-foreground'

  const getMotionProps = (delay = 0) => {
    if (reducedMotion) return {}

    return {
      animate: { opacity: 1, x: 0, y: 0 },
      initial: { opacity: 0, x: 12, y: 10 },
      transition: { delay, duration: 0.24 },
    }
  }

  const handleToggleActividad = async (actividadId: string, completada: boolean) => {
    await toggleTaskActivity(currentTask.id, actividadId, completada)
    toast({
      title: completada ? 'Actividad completada' : 'Actividad desmarcada',
      description: 'El avance se actualizo automaticamente.',
    })
  }

  const handleFinalizarTarea = async () => {
    await finalizeTask(currentTask.id)
    toast({
      title: 'Tarea finalizada',
      description: 'La tarea fue marcada como completada.',
    })
    onClose()
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="otc-sheet-shell overflow-y-auto p-0 sm:max-w-2xl" data-motion="enter">
        <div className="flex min-h-full flex-col">
          <SheetHeader className="border-b border-border/70 px-5 pb-5 pt-6 sm:px-6">
            <motion.div className="space-y-4" {...getMotionProps()}>
              <div className="space-y-2">
                <span className="otc-section-kicker">Detalle operativo</span>
                <div className="space-y-3">
                  <SheetTitle className="otc-page-title pr-10 text-3xl font-semibold text-foreground">{currentTask.nombre}</SheetTitle>
                  <SheetDescription className="max-w-2xl text-sm leading-7 text-muted-foreground">
                    {currentTask.descripcion || 'Detalle operativo de la tarea seleccionada.'}
                  </SheetDescription>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge className={getEstadoColor(currentTask.estado)}>{currentTask.estado}</Badge>
                <Badge className={getPrioridadColor(currentTask.prioridad)}>{currentTask.prioridad}</Badge>
                {currentTask.areas.map((area) => (
                  <Badge key={area} className={getAreaColor(area)}>
                    {area}
                  </Badge>
                ))}
              </div>
            </motion.div>
          </SheetHeader>

          <div className="flex flex-1 flex-col gap-6 px-5 py-6 sm:px-6">
            <motion.section className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.85fr)]" {...getMotionProps(0.03)}>
              <div className="otc-executive-hero rounded-[calc(var(--radius)+0.25rem)] px-6 py-6">
                <div className="space-y-6">
                  <div className="flex items-end justify-between gap-4">
                    <div className="space-y-1.5">
                      <p className="otc-section-kicker">Estado actual</p>
                      <p className={`text-xl font-semibold tracking-tight ${statusTone}`}>{statusSummary}</p>
                    </div>
                    <p className="otc-data-text text-5xl font-semibold leading-none tracking-tight tabular-nums text-foreground">
                      {currentTask.avanceTotal}
                      <span className="ml-1 text-2xl font-medium text-muted-foreground">%</span>
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Progress value={currentTask.avanceTotal} className="h-2" />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Progreso general</span>
                      <span className="tabular-nums">{completadas} de {currentTask.actividades.length} actividades</span>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <MetricRail label="Actividades" value={`${completadas}/${currentTask.actividades.length}`} />
                    <MetricRail label="Duración" value={`${currentTask.diasEjecutar} días`} />
                  </div>

                  {currentTask.requiereApoyo && currentTask.areasApoyo.length > 0 ? (
                    <p className="text-sm leading-6 text-muted-foreground">
                      Requiere coordinación con {currentTask.areasApoyo.length === 1 ? 'el área' : 'las áreas'} de {currentTask.areasApoyo.join(', ')}.
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-3">
                <DetailRail icon={Calendar} label="Inicio" value={formatearFecha(currentTask.fechaInicio)} />
                <DetailRail icon={Calendar} label="Fin" value={formatearFecha(currentTask.fechaFin)} />
                <DetailRail icon={Clock3} label="Seguimiento" value={statusSummary} />
                <DetailRail icon={Users} label="Creada por" value={`${currentTask.creadoPor} - ${formatearFecha(currentTask.fechaCreacion)}`} />
              </div>
            </motion.section>

            {currentTask.requiereApoyo && currentTask.areasApoyo.length > 0 ? (
              <motion.section className="space-y-3" {...getMotionProps(0.06)}>
                <div className="space-y-1">
                  <p className="otc-section-kicker">Coordinación</p>
                  <h2 className="text-lg font-semibold text-foreground">Áreas de apoyo</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentTask.areasApoyo.map((area) => (
                    <Badge key={area} variant="outline" className="rounded-full px-3 py-1 text-xs">
                      {area}
                    </Badge>
                  ))}
                </div>
              </motion.section>
            ) : null}

            {currentTask.documentos.length > 0 ? (
              <motion.section className="space-y-3" {...getMotionProps(0.09)}>
                <div className="space-y-1">
                  <p className="otc-section-kicker">Evidencia</p>
                  <h2 className="text-lg font-semibold text-foreground">Documentos asociados</h2>
                </div>
                <div className="grid gap-2">
                  {currentTask.documentos.map((documento) => (
                    <div key={`${currentTask.id}-${documento.nombre}`} className="otc-soft-panel flex items-center justify-between gap-3 rounded-[calc(var(--radius)+0.125rem)] px-4 py-3">
                      <div className="min-w-0">
                        <p className="line-clamp-1 text-sm font-medium text-foreground">{documento.nombre}</p>
                        <p className="text-xs text-muted-foreground">Disponible para simulacion de descarga.</p>
                      </div>
                      <Button type="button" variant="ghost" size="icon" aria-label={`Descargar ${documento.nombre}`}>
                        <Download aria-hidden="true" />
                      </Button>
                    </div>
                  ))}
                </div>
              </motion.section>
            ) : null}

            <motion.section className="space-y-3" {...getMotionProps(0.12)}>
              <div className="space-y-1">
                <p className="otc-section-kicker">Ejecucion</p>
                <h2 className="text-lg font-semibold text-foreground">Actividades de seguimiento</h2>
              </div>
              <div className="grid gap-2">
                {currentTask.actividades.map((actividad) => (
                  <div
                    key={actividad.id}
                    className={`rounded-[calc(var(--radius)+0.125rem)] border px-4 py-3 transition-colors ${actividad.completada ? 'border-success/30 bg-success/10' : 'border-border bg-card'}`}
                  >
                    <div className="flex items-center gap-3">
                      {puedeEditar && currentTask.estado !== 'Finalizado' ? (
                        <Checkbox
                          id={actividad.id}
                          checked={actividad.completada}
                          onCheckedChange={(checked) => {
                            void handleToggleActividad(actividad.id, checked === true)
                          }}
                        />
                      ) : actividad.completada ? (
                        <CheckCircle2 className="size-5 text-success" aria-hidden="true" />
                      ) : (
                        <Circle className="size-5 text-muted-foreground" aria-hidden="true" />
                      )}
                      <label htmlFor={actividad.id} className={`min-w-0 flex-1 text-sm ${actividad.completada ? 'text-success-emphasis line-through' : 'text-foreground'}`}>
                        {actividad.nombre}
                      </label>
                      <span className={`otc-data-text text-xs font-medium ${actividad.completada ? 'text-success' : 'text-muted-foreground'}`}>
                        {actividad.porcentaje}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          </div>

          <SheetFooter className="otc-sticky-action-bar border-t border-border/70 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            <SheetClose asChild>
              <Button variant="ghost">Cerrar</Button>
            </SheetClose>
            {puedeEditar && currentTask.estado !== 'Finalizado' ? (
              <div className="flex flex-col gap-2 sm:items-end">
                <Button disabled={!todasCompletadas} onClick={() => void handleFinalizarTarea()}>
                  {todasCompletadas ? 'Finalizar tarea' : 'Completa todas las actividades'}
                </Button>
                {!todasCompletadas ? <p className="text-xs text-muted-foreground">El cierre se habilita cuando no quedan pendientes.</p> : null}
              </div>
            ) : null}
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function MetricRail({ label, value }: { label: string; value: string }) {
  return (
    <div className="otc-sheet-rail rounded-[calc(var(--radius)+0.125rem)] px-4 py-3.5">
      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
      <p className="mt-1.5 otc-data-text text-lg font-semibold leading-tight tabular-nums text-foreground">{value}</p>
    </div>
  )
}

function DetailRail({ icon: Icon, label, value }: { icon: typeof Calendar; label: string; value: string }) {
  return (
    <div className="otc-sheet-rail rounded-[calc(var(--radius)+0.125rem)] px-4 py-3.5">
      <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
        <Icon className="size-3.5" aria-hidden="true" />
        {label}
      </div>
      <p className="mt-1.5 text-sm font-medium leading-snug text-foreground">{value}</p>
    </div>
  )
}
