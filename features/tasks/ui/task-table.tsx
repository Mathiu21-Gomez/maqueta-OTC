'use client'

import { ArrowRight, ArrowUpDown, Eye, Users, Zap } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { calcularEstado, diasRestantes, formatearFecha } from '@/features/tasks/domain/task.rules'
import type { Prioridad, Tarea } from '@/features/tasks/domain/task.types'

export type TaskSortField = 'avanceTotal' | 'estado' | 'fechaCreacion' | 'fechaFin' | 'nombre' | 'prioridad'
export type TaskSortDirection = 'asc' | 'desc'

interface TaskTableProps {
  onOpenTask: (task: Tarea) => void
  onSort: (field: TaskSortField) => void
  sortDirection: TaskSortDirection
  sortField: TaskSortField
  stats: {
    avancePromedio: number
    atrasadas: number
    finalizadas: number
    total: number
  }
  tasks: Tarea[]
}

export function TaskTable({ onOpenTask, onSort, sortDirection, sortField, stats, tasks }: TaskTableProps) {
  return (
    <div className="otc-table-shell rounded-[calc(var(--radius)+0.25rem)]">
      <div className="otc-table-meta flex flex-col gap-3 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="otc-section-kicker">Detalle operativo</p>
          <h2 className="mt-2 text-lg font-semibold text-foreground">Tareas visibles</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            La tabla mantiene encabezados fijos, numeros tabulares y una accion explicita para entrar al detalle sin ambiguedades.
          </p>
        </div>
        <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
          <span className="otc-sheet-rail rounded-full px-3 py-2 otc-data-text">{stats.total} visibles</span>
          <span className="otc-sheet-rail rounded-full px-3 py-2 otc-data-text">{stats.avancePromedio}% promedio</span>
          <span className="otc-sheet-rail rounded-full px-3 py-2 otc-data-text">{stats.atrasadas} en riesgo</span>
        </div>
      </div>

      <Table className="otc-data-table">
        <TableHeader>
          <TableRow>
            <SortableHead active={sortField === 'nombre'} field="nombre" label="Nombre" onSort={onSort} sortDirection={sortDirection} />
            <TableHead className={PLAIN_HEAD}>Areas</TableHead>
            <SortableHead active={sortField === 'estado'} field="estado" label="Estado" onSort={onSort} sortDirection={sortDirection} />
            <SortableHead active={sortField === 'avanceTotal'} field="avanceTotal" label="Avance" onSort={onSort} sortDirection={sortDirection} />
            <TableHead className={PLAIN_HEAD}>Inicio</TableHead>
            <SortableHead active={sortField === 'fechaFin'} field="fechaFin" label="Fin" onSort={onSort} sortDirection={sortDirection} />
            <TableHead className={PLAIN_HEAD}>Tiempo</TableHead>
            <SortableHead active={sortField === 'prioridad'} field="prioridad" label="Prioridad" onSort={onSort} sortDirection={sortDirection} />
            <TableHead className={`${PLAIN_HEAD} w-[168px] text-right`}>Accion</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {tasks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-28 text-center text-muted-foreground">
                No se encontraron tareas con los filtros seleccionados.
              </TableCell>
            </TableRow>
          ) : (
            tasks.map((task) => {
              const estado = calcularEstado(task)
              const dias = diasRestantes(task.fechaFin)
              const esColaborativa = task.areas.length > 1 || task.requiereApoyo

              return (
                <TableRow key={task.id} className={getTaskRowTone(task)}>
                  <TableCell className="font-medium">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="mt-0.5 flex items-center gap-2">
                        {task.prioridad === 'Alta' ? <Zap className="size-4 text-danger" aria-hidden="true" /> : null}
                        {esColaborativa ? <Users className="size-4 text-info" aria-hidden="true" /> : null}
                      </div>
                      <div className="min-w-0 space-y-1">
                        <span className="block line-clamp-1">{task.nombre}</span>
                        <span className="block line-clamp-1 text-xs text-muted-foreground">{task.descripcion}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {task.areas.slice(0, 2).map((area) => (
                        <Badge key={area} variant="outline" className="text-xs">
                          {area}
                        </Badge>
                      ))}
                      {task.areas.length > 2 ? (
                        <Badge variant="outline" className="text-xs">
                          +{task.areas.length - 2}
                        </Badge>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={getStatusBadge(estado)}>{estado}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-16 overflow-hidden rounded-full bg-secondary">
                        <div className="h-full bg-primary transition-all" style={{ width: `${task.avanceTotal}%` }} />
                      </div>
                      <span className="otc-data-text text-sm text-muted-foreground">{task.avanceTotal}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="otc-data-text whitespace-nowrap text-muted-foreground tabular-nums">{formatearFecha(task.fechaInicio)}</TableCell>
                  <TableCell className="otc-data-text whitespace-nowrap text-muted-foreground tabular-nums">{formatearFecha(task.fechaFin)}</TableCell>
                  <TableCell>
                    <span className={`${getDaysTone(estado, dias)} otc-data-text whitespace-nowrap`}>
                      {estado === 'Finalizado' ? 'Completada' : dias < 0 ? `${Math.abs(dias)}d atrasado` : `${dias} dias`}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={getPriorityBadge(task.prioridad)}>{task.prioridad}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="otc-table-action"
                      onClick={() => onOpenTask(task)}
                    >
                      <Eye aria-hidden="true" />
                      Abrir detalle
                      <ArrowRight data-icon="inline-end" aria-hidden="true" />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>

        <TableFooter>
          <TableRow>
            <TableCell colSpan={3}>Resumen de tareas filtradas</TableCell>
            <TableCell className="text-right font-medium">{stats.avancePromedio}% promedio</TableCell>
            <TableCell colSpan={2} className="text-center">
              <span className="text-success">{stats.finalizadas}</span> finalizadas
            </TableCell>
            <TableCell colSpan={2} className="text-center">
              <span className="text-danger">{stats.atrasadas}</span> atrasadas
            </TableCell>
            <TableCell className="text-right font-medium">{stats.total} total</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  )
}

// Tratamiento tipográfico único para TODOS los encabezados (ordenables y no).
// Sin esto, los plain quedaban font-normal/muted y los sortable
// font-semibold/foreground → fila despareja.
const PLAIN_HEAD = 'font-semibold text-foreground whitespace-nowrap'

interface SortableHeadProps {
  active: boolean
  field: TaskSortField
  label: string
  onSort: (field: TaskSortField) => void
  sortDirection: TaskSortDirection
}

function SortableHead({ active, field, label, onSort, sortDirection }: SortableHeadProps) {
  return (
    <TableHead className={PLAIN_HEAD}>
      <button
        type="button"
        onClick={() => onSort(field)}
        aria-label={`Ordenar por ${label}`}
        className={`-mx-1 inline-flex items-center gap-1.5 rounded px-1 py-0.5 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${active ? 'text-primary' : ''}`}
      >
        {label}
        <ArrowUpDown
          aria-hidden="true"
          className={`size-3.5 transition-[transform,opacity] ${active ? 'opacity-100' : 'opacity-40'} ${active && sortDirection === 'desc' ? 'rotate-180' : ''}`}
        />
      </button>
    </TableHead>
  )
}

const BADGE_BASE = 'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap'

function getStatusBadge(estado: string) {
  if (estado === 'Finalizado') return `${BADGE_BASE} bg-success/12 text-success`
  if (estado === 'Atrasado') return `${BADGE_BASE} bg-danger/12 text-danger`
  if (estado === 'En curso') return `${BADGE_BASE} bg-info/12 text-info`
  return `${BADGE_BASE} bg-warning/14 text-warning`
}

function getPriorityBadge(prioridad: Prioridad) {
  if (prioridad === 'Alta') return `${BADGE_BASE} bg-danger/12 text-danger`
  if (prioridad === 'Media') return `${BADGE_BASE} bg-warning/14 text-warning`
  return `${BADGE_BASE} bg-success/12 text-success-emphasis`
}

function getDaysTone(estado: string, dias: number) {
  if (estado === 'Finalizado') return 'font-medium text-success'
  if (dias < 0) return 'font-medium text-danger'
  if (dias <= 5) return 'font-medium text-warning'
  return 'font-medium text-muted-foreground'
}

function getTaskRowTone(task: Tarea) {
  const estado = calcularEstado(task)
  const dias = diasRestantes(task.fechaFin)

  if (estado === 'Atrasado') return 'border-l-4 border-l-danger'
  if (dias > 0 && dias <= 5 && estado !== 'Finalizado') return 'border-l-4 border-l-warning'
  return ''
}
