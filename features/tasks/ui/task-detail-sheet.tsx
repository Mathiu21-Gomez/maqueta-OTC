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
        ? `${Math.abs(dias)}d atrasado`
        : `${dias} dias restantes`

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
              <div className="otc-executive-hero rounded-[calc(var(--radius)+0.25rem)] px-5 py-5">
                <div className="space-y-5">
                  <div className="space-y-2">
                    <p className="otc-section-kicker">Estado arriba del fold</p>
                    <p className="text-2xl font-semibold text-foreground">{statusSummary}</p>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {currentTask.requiereApoyo && currentTask.areasApoyo.length > 0
                        ? 'La tarea depende de coordinacion entre areas, por eso el detalle prioriza progreso, fechas y evidencia.'
                        : 'La tarea puede leerse completa desde progreso, fechas y actividades sin bajar a ruido secundario.'}
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <MetricRail label="Avance" value={`${currentTask.avanceTotal}%`} />
                    <MetricRail label="Actividades" value={`${completadas}/${currentTask.actividades.length}`} />
                    <MetricRail label="Duracion" value={`${currentTask.diasEjecutar} dias`} />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-foreground">Progreso general</span>
                      <span className="otc-data-text text-sm font-semibold text-primary">{currentTask.avanceTotal}%</span>
                    </div>
                    <Progress value={currentTask.avanceTotal} className="h-3" />
                  </div>
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
                  <p className="otc-section-kicker">Coordinacion</p>
                  <h2 className="text-lg font-semibold text-foreground">Areas de apoyo</h2>
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
                    className={`rounded-[calc(var(--radius)+0.125rem)] border px-4 py-3 transition-colors ${actividad.completada ? 'border-emerald-200 bg-emerald-50/80 dark:border-emerald-900/50 dark:bg-emerald-950/20' : 'border-border bg-card'}`}
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
                        <CheckCircle2 className="size-5 text-emerald-600" aria-hidden="true" />
                      ) : (
                        <Circle className="size-5 text-muted-foreground" aria-hidden="true" />
                      )}
                      <label htmlFor={actividad.id} className={`min-w-0 flex-1 text-sm ${actividad.completada ? 'text-emerald-700 line-through dark:text-emerald-300' : 'text-foreground'}`}>
                        {actividad.nombre}
                      </label>
                      <span className={`otc-data-text text-xs font-medium ${actividad.completada ? 'text-emerald-600' : 'text-muted-foreground'}`}>
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
    <div className="otc-sheet-rail rounded-[calc(var(--radius)+0.125rem)] px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-2 otc-data-text text-lg font-semibold text-foreground">{value}</p>
    </div>
  )
}

function DetailRail({ icon: Icon, label, value }: { icon: typeof Calendar; label: string; value: string }) {
  return (
    <div className="otc-sheet-rail rounded-[calc(var(--radius)+0.125rem)] px-4 py-3">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        <Icon className="size-4" aria-hidden="true" />
        {label}
      </div>
      <p className="mt-2 text-sm font-medium text-foreground">{value}</p>
    </div>
  )
}
