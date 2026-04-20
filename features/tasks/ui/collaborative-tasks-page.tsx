'use client'

import { startTransition, useMemo, useState } from 'react'
import { ArrowRight, Clock3, Gauge, ListChecks, Users } from 'lucide-react'

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
import { selectTasks } from '@/features/tasks/application/task.selectors'
import { useTaskStore } from '@/features/tasks/application/task.store'
import { calcularEstado } from '@/features/tasks/domain/task.rules'
import type { Area, Tarea } from '@/features/tasks/domain/task.types'
import { TaskDetailSheet } from '@/features/tasks/ui/task-detail-sheet'
import { TaskFilters } from '@/features/tasks/ui/task-filters'
import { TaskPageHeader } from '@/features/tasks/ui/task-page-header'
import { getAreaColor } from '@/features/tasks/ui/task-presentation'
import { TaskSummaryCards } from '@/features/tasks/ui/task-summary-cards'

export function CollaborativeTasksPage() {
  const tasks = useTaskStore(selectTasks)
  const [selectedTask, setSelectedTask] = useState<Tarea | null>(null)
  const [areaFilter, setAreaFilter] = useState('todas')
  const [estadoFilter, setEstadoFilter] = useState('todos')

  const collaborativeTasks = useMemo(
    () => tasks.filter((task) => task.areas.length > 1 || (task.requiereApoyo && task.areasApoyo.length > 0)),
    [tasks],
  )

  const filteredTasks = useMemo(() => {
    return collaborativeTasks.filter((task) => {
      const estado = calcularEstado(task)
      const allAreas = [...task.areas, ...task.areasApoyo]

      if (areaFilter !== 'todas' && !allAreas.includes(areaFilter as Area)) return false
      if (estadoFilter !== 'todos' && estado !== estadoFilter) return false
      return true
    })
  }, [areaFilter, collaborativeTasks, estadoFilter])

  const summaryItems = useMemo(() => {
    const total = collaborativeTasks.length
    const enCurso = collaborativeTasks.filter((task) => calcularEstado(task) === 'En curso').length
    const finalizadas = collaborativeTasks.filter((task) => calcularEstado(task) === 'Finalizado').length
    const avancePromedio = total > 0 ? Math.round(collaborativeTasks.reduce((sum, task) => sum + task.avanceTotal, 0) / total) : 0

    return [
      {
        accent: 'linear-gradient(135deg,var(--chart-2),#4c81ad)',
        description: 'Procesos con mas de un frente operativo',
        icon: Users,
        title: 'Total colaborativas',
        value: total.toString(),
      },
      {
        accent: 'linear-gradient(135deg,var(--chart-3),var(--chart-1))',
        description: 'Tareas activas en coordinacion',
        icon: Clock3,
        title: 'En curso',
        value: enCurso.toString(),
      },
      {
        accent: 'linear-gradient(135deg,var(--chart-5),#499470)',
        description: 'Cierres completos de trabajo transversal',
        icon: ListChecks,
        title: 'Finalizadas',
        value: finalizadas.toString(),
      },
      {
        accent: 'linear-gradient(135deg,var(--chart-1),#9f6037)',
        description: 'Nivel medio de progreso conjunto',
        icon: Gauge,
        title: 'Avance promedio',
        value: `${avancePromedio}%`,
      },
    ]
  }, [collaborativeTasks])

  const stats = useMemo(() => {
    const total = collaborativeTasks.length
    const finalizadas = collaborativeTasks.filter((task) => calcularEstado(task) === 'Finalizado').length
    const atrasadas = collaborativeTasks.filter((task) => calcularEstado(task) === 'Atrasado').length
    const avancePromedio = total > 0 ? Math.round(collaborativeTasks.reduce((sum, task) => sum + task.avanceTotal, 0) / total) : 0

    return { avancePromedio, atrasadas, finalizadas }
  }, [collaborativeTasks])
  const openTask = (task: Tarea) => startTransition(() => setSelectedTask(task))

  return (
    <div className="otc-grid-shell flex flex-col gap-6 rounded-[calc(var(--radius)+0.5rem)] p-1">
      <TaskPageHeader
        eyebrow="Trabajo transversal"
        title="Tareas colaborativas"
        description="Seguimiento de tareas que cruzan multiples areas o necesitan apoyo coordinado."
        meta={[
          { label: 'Visibles', value: filteredTasks.length.toString() },
          { label: 'En curso', value: summaryItems[1]?.value ?? '0' },
          { label: 'Promedio', value: `${stats.avancePromedio}%` },
        ]}
        narrative="Tareas con impacto en más de un área. Usá los filtros para aislar responsables y desbloquear las pendientes."
        actions={<Badge variant="outline" className="otc-glass-badge border-border/70 px-3 py-1 text-xs text-muted-foreground">{filteredTasks.length} visibles</Badge>}
      />

      <TaskSummaryCards items={summaryItems} />

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
        <div className="otc-soft-panel rounded-[calc(var(--radius)+0.125rem)] px-5 py-4">
          <p className="otc-section-kicker">Coordinación</p>
          <h2 className="mt-2 text-2xl font-semibold text-foreground">Dónde se traba la ejecución</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Panorama del trabajo que depende de varias áreas. La tabla de abajo permite bajar al detalle y actuar solo donde hace falta.
          </p>
        </div>
        <div className="otc-soft-panel flex items-center justify-between gap-4 rounded-[calc(var(--radius)+0.125rem)] px-5 py-4">
          <div>
            <p className="otc-section-kicker">Detalle</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Cada fila conserva scan rapido y una accion clara para abrir evidencia y actividades.</p>
          </div>
          <ArrowRight className="size-5 text-muted-foreground" aria-hidden="true" />
        </div>
      </section>

      <TaskFilters title="Filtros colaborativos" area={{ value: areaFilter, onChange: setAreaFilter }} estado={{ value: estadoFilter, onChange: setEstadoFilter }} />

      <div className="overflow-hidden rounded-[calc(var(--radius)+0.25rem)] border border-border/70 bg-card">
        <Table className="otc-data-table">
          <TableHeader>
            <TableRow>
              <TableHead>Tarea</TableHead>
              <TableHead>Area principal</TableHead>
              <TableHead>Areas de apoyo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Avance</TableHead>
              <TableHead className="text-right">Accion</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-28 text-center text-muted-foreground">
                  No se encontraron tareas colaborativas.
                </TableCell>
              </TableRow>
            ) : (
                filteredTasks.map((task) => <CollaborativeRow key={task.id} onSelect={openTask} task={task} />)
              )}
            </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3}>Resumen colaborativo</TableCell>
              <TableCell className="text-center">
                <span className="text-success">{stats.finalizadas}</span> / <span className="text-danger">{stats.atrasadas}</span>
              </TableCell>
              <TableCell className="text-right font-medium">{stats.avancePromedio}% promedio</TableCell>
              <TableCell className="text-right font-medium">{filteredTasks.length} mostradas</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>

      {selectedTask ? <TaskDetailSheet task={selectedTask} open={Boolean(selectedTask)} onClose={() => startTransition(() => setSelectedTask(null))} /> : null}
    </div>
  )
}

function CollaborativeRow({ onSelect, task }: { onSelect: (task: Tarea) => void; task: Tarea }) {
  const estado = calcularEstado(task)

  return (
    <TableRow>
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          <Users className="size-4 text-[var(--chart-2)]" aria-hidden="true" />
          <span className="line-clamp-1">{task.nombre}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1">
          {task.areas.map((area) => (
            <Badge key={area} className={getAreaColor(area)}>
              {area}
            </Badge>
          ))}
        </div>
      </TableCell>
      <TableCell>
        {task.areasApoyo.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {task.areasApoyo.map((area) => (
              <Badge key={area} variant="outline" className="text-xs">
                {area}
              </Badge>
            ))}
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        )}
      </TableCell>
      <TableCell>
        <span className={estado === 'Finalizado' ? 'font-medium text-success' : estado === 'Atrasado' ? 'font-medium text-danger' : estado === 'En curso' ? 'font-medium text-info' : 'font-medium text-warning'}>{estado}</span>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <div className="h-2 w-16 overflow-hidden rounded-full bg-secondary">
            <div className="h-full bg-primary transition-all" style={{ width: `${task.avanceTotal}%` }} />
          </div>
          <span className="text-sm text-muted-foreground">{task.avanceTotal}%</span>
        </div>
        </TableCell>
        <TableCell className="text-right">
          <Button type="button" variant="outline" size="sm" className="otc-table-action" onClick={() => onSelect(task)}>
            Ver detalle
            <ArrowRight data-icon="inline-end" aria-hidden="true" />
          </Button>
        </TableCell>
    </TableRow>
  )
}
