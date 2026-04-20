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

export type TaskSortField = 'avanceTotal' | 'estado' | 'fechaFin' | 'nombre' | 'prioridad'
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
            <TableHead>Areas</TableHead>
            <SortableHead active={sortField === 'estado'} field="estado" label="Estado" onSort={onSort} sortDirection={sortDirection} />
            <SortableHead active={sortField === 'avanceTotal'} field="avanceTotal" label="Avance" onSort={onSort} sortDirection={sortDirection} />
            <TableHead>Inicio</TableHead>
            <SortableHead active={sortField === 'fechaFin'} field="fechaFin" label="Fin" onSort={onSort} sortDirection={sortDirection} />
            <TableHead>Tiempo</TableHead>
            <SortableHead active={sortField === 'prioridad'} field="prioridad" label="Prioridad" onSort={onSort} sortDirection={sortDirection} />
            <TableHead className="w-[168px] text-right">Accion</TableHead>
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
                    <span className={`${getStatusTone(estado)} inline-flex rounded-full border border-current/12 px-2.5 py-1 text-xs`}>{estado}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-16 overflow-hidden rounded-full bg-secondary">
                        <div className="h-full bg-primary transition-all" style={{ width: `${task.avanceTotal}%` }} />
                      </div>
                      <span className="otc-data-text text-sm text-muted-foreground">{task.avanceTotal}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="otc-data-text text-muted-foreground">{formatearFecha(task.fechaInicio)}</TableCell>
                  <TableCell className="otc-data-text text-muted-foreground">{formatearFecha(task.fechaFin)}</TableCell>
                  <TableCell>
                    <span className={`${getDaysTone(estado, dias)} otc-data-text`}>
                      {estado === 'Finalizado' ? 'Completada' : dias < 0 ? `${Math.abs(dias)}d atrasado` : `${dias} dias`}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`${getPriorityTone(task.prioridad)} inline-flex rounded-full border border-current/12 px-2.5 py-1 text-xs`}>{task.prioridad}</span>
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

interface SortableHeadProps {
  active: boolean
  field: TaskSortField
  label: string
  onSort: (field: TaskSortField) => void
  sortDirection: TaskSortDirection
}

function SortableHead({ active, field, label, onSort, sortDirection }: SortableHeadProps) {
  return (
    <TableHead>
      <Button type="button" variant="ghost" size="sm" className="-ml-3 h-8 font-semibold text-foreground hover:bg-secondary" onClick={() => onSort(field)}>
        {label}
        <ArrowUpDown className={`transition-transform ${active && sortDirection === 'desc' ? 'rotate-180' : ''}`} aria-hidden="true" />
      </Button>
    </TableHead>
  )
}

function getDaysTone(estado: string, dias: number) {
  if (estado === 'Finalizado') return 'font-medium text-success'
  if (dias < 0) return 'font-medium text-danger'
  if (dias <= 5) return 'font-medium text-warning'
  return 'font-medium text-muted-foreground'
}

function getPriorityTone(prioridad: Prioridad) {
  if (prioridad === 'Alta') return 'font-medium text-danger'
  if (prioridad === 'Media') return 'font-medium text-warning'
  return 'font-medium text-success-emphasis'
}

function getStatusTone(estado: string) {
  if (estado === 'Finalizado') return 'font-medium text-success'
  if (estado === 'Atrasado') return 'font-medium text-danger'
  if (estado === 'En curso') return 'font-medium text-info'
  return 'font-medium text-warning'
}

function getTaskRowTone(task: Tarea) {
  const estado = calcularEstado(task)
  const dias = diasRestantes(task.fechaFin)

  if (estado === 'Atrasado') return 'border-l-4 border-l-red-500'
  if (dias > 0 && dias <= 5 && estado !== 'Finalizado') return 'border-l-4 border-l-amber-500'
  return ''
}
