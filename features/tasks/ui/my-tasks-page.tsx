'use client'

import { startTransition, useMemo, useState } from 'react'
import { AlertCircle, ArrowRight, Clock3, ListChecks, Users } from 'lucide-react'

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
import { useSessionStore } from '@/features/session/application/session.store'
import { selectTasks } from '@/features/tasks/application/task.selectors'
import { useTaskStore } from '@/features/tasks/application/task.store'
import { calcularEstado, diasRestantes } from '@/features/tasks/domain/task.rules'
import type { Area, Tarea } from '@/features/tasks/domain/task.types'
import { TaskCardGrid } from '@/features/tasks/ui/task-card-grid'
import { TaskDetailSheet } from '@/features/tasks/ui/task-detail-sheet'
import { TaskFilters } from '@/features/tasks/ui/task-filters'
import { TaskPageHeader } from '@/features/tasks/ui/task-page-header'
import { getAreaColor } from '@/features/tasks/ui/task-presentation'
import { TaskSummaryCards } from '@/features/tasks/ui/task-summary-cards'

export function MyTasksPage() {
  const tasks = useTaskStore(selectTasks)
  const rol = useSessionStore((state) => state.rol)
  const areaUsuario = useSessionStore((state) => state.areaUsuario)
  const [selectedTask, setSelectedTask] = useState<Tarea | null>(null)
  const [areaFilter, setAreaFilter] = useState('todas')
  const [estadoFilter, setEstadoFilter] = useState('todos')

  const mainTasks = useMemo(() => {
    if (rol === 'Administrador') return tasks
    return tasks.filter((task) => task.areas.includes(areaUsuario))
  }, [areaUsuario, rol, tasks])

  const sharedTasks = useMemo(() => {
    if (rol === 'Administrador') return []
    return tasks.filter((task) => !task.areas.includes(areaUsuario) && task.areasApoyo.includes(areaUsuario))
  }, [areaUsuario, rol, tasks])

  const collaborativeTasks = useMemo(() => {
    const isCollaborative = (task: Tarea) => task.areas.length > 1 || (task.requiereApoyo && task.areasApoyo.length > 0)

    if (rol === 'Administrador') return tasks.filter(isCollaborative)
    return tasks.filter((task) => isCollaborative(task) && (task.areas.includes(areaUsuario) || task.areasApoyo.includes(areaUsuario)))
  }, [areaUsuario, rol, tasks])

  const filteredCollaborativeTasks = useMemo(() => {
    return collaborativeTasks.filter((task) => {
      const estado = calcularEstado(task)
      const allAreas = [...task.areas, ...task.areasApoyo]

      if (areaFilter !== 'todas' && !allAreas.includes(areaFilter as Area)) return false
      if (estadoFilter !== 'todos' && estado !== estadoFilter) return false
      return true
    })
  }, [areaFilter, collaborativeTasks, estadoFilter])

  const summaryItems = useMemo(() => {
    const enCurso = mainTasks.filter((task) => calcularEstado(task) === 'En curso').length
    const porVencer = mainTasks.filter((task) => {
      const dias = diasRestantes(task.fechaFin)
      return dias > 0 && dias <= 7 && calcularEstado(task) !== 'Finalizado'
    }).length
    const atrasadas = mainTasks.filter((task) => calcularEstado(task) === 'Atrasado').length

    return [
      {
        accent: 'linear-gradient(135deg,var(--chart-2),#4c81ad)',
        description: 'Tareas activas bajo seguimiento',
        icon: Clock3,
        title: 'En curso',
        value: enCurso.toString(),
      },
      {
        accent: 'linear-gradient(135deg,var(--chart-3),var(--chart-1))',
        description: 'Compromisos cercanos a vencer',
        icon: AlertCircle,
        title: 'Por vencer',
        value: porVencer.toString(),
      },
      {
        accent: 'linear-gradient(135deg,#d35f55,var(--chart-4))',
        description: 'Requieren atencion inmediata',
        icon: ListChecks,
        title: 'Atrasadas',
        value: atrasadas.toString(),
      },
    ]
  }, [mainTasks])

  const collaborativeStats = useMemo(() => {
    const total = collaborativeTasks.length
    const finalizadas = collaborativeTasks.filter((task) => calcularEstado(task) === 'Finalizado').length
    const atrasadas = collaborativeTasks.filter((task) => calcularEstado(task) === 'Atrasado').length
    const avancePromedio = total > 0 ? Math.round(collaborativeTasks.reduce((sum, task) => sum + task.avanceTotal, 0) / total) : 0

    return { avancePromedio, atrasadas, finalizadas, total }
  }, [collaborativeTasks])
  const openTask = (task: Tarea) => startTransition(() => setSelectedTask(task))

  return (
    <div className="otc-grid-shell flex flex-col gap-6 rounded-[calc(var(--radius)+0.5rem)] p-1">
      <TaskPageHeader
        eyebrow="Carga personal"
        title="Mis tareas"
        description={rol === 'Administrador' ? 'Vista completa de control para revisar ownership, colaboracion y vencimientos.' : `Tareas donde participa ${areaUsuario}.`}
        meta={[
          { label: 'Principales', value: mainTasks.length.toString() },
          { label: 'Colaborativas', value: collaborativeTasks.length.toString() },
          { label: 'Compartidas', value: sharedTasks.length.toString() },
        ]}
        narrative="Primero resolve lo propio. Despues mira colaboracion y, solo al final, revisa apoyo compartido para no mezclar prioridades."
        actions={<Badge variant="outline" className="otc-glass-badge border-border/70 px-3 py-1 text-xs text-muted-foreground">{mainTasks.length} principales</Badge>}
      />

      <TaskSummaryCards items={summaryItems} />

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
        <div className="otc-soft-panel rounded-[calc(var(--radius)+0.125rem)] px-5 py-4">
          <p className="otc-section-kicker">Prioridad</p>
          <h2 className="mt-2 text-2xl font-semibold text-foreground">Tu carga principal queda arriba de la colaboracion</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            El orden favorece decisiones rapidas: primero ownership directo, despues coordinacion y recien ahi apoyo transversal.
          </p>
        </div>
        <div className="otc-soft-panel flex items-center justify-between gap-4 rounded-[calc(var(--radius)+0.125rem)] px-5 py-4">
          <div>
            <p className="otc-section-kicker">Accion</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Cada fila ahora abre el detalle con CTA explicita para evitar falsas interacciones.</p>
          </div>
          <ArrowRight className="size-5 text-muted-foreground" aria-hidden="true" />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <SectionHeader title="Mis tareas principales" count={mainTasks.length} />
        <TaskCardGrid emptyMessage="No tenes tareas asignadas por ahora." onSelectTask={openTask} tasks={orderTasksByUrgency(mainTasks)} />
      </section>

      <section className="flex flex-col gap-4">
        <SectionHeader title="Mis tareas colaborativas" count={collaborativeTasks.length} />
        <TaskFilters
          title="Filtrar colaborativas"
          area={{ value: areaFilter, onChange: setAreaFilter }}
          estado={{ value: estadoFilter, onChange: setEstadoFilter }}
        />

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
              {filteredCollaborativeTasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-28 text-center text-muted-foreground">
                    No se encontraron tareas colaborativas.
                  </TableCell>
                </TableRow>
              ) : (
                  filteredCollaborativeTasks.map((task) => (
                    <CollaborativeRow key={task.id} onSelect={openTask} task={task} />
                  ))
                )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3}>Resumen colaborativo</TableCell>
                <TableCell className="text-center">
                  <span className="text-emerald-600">{collaborativeStats.finalizadas}</span> / <span className="text-red-600">{collaborativeStats.atrasadas}</span>
                </TableCell>
                <TableCell className="text-right font-medium">{collaborativeStats.avancePromedio}% promedio</TableCell>
                <TableCell className="text-right font-medium">{filteredCollaborativeTasks.length} visibles</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </section>

      {rol === 'Usuario' ? (
        <section className="flex flex-col gap-4">
          <SectionHeader title="Tareas compartidas" count={sharedTasks.length} />
          <TaskCardGrid emptyMessage="No hay tareas compartidas como area de apoyo." onSelectTask={openTask} showPrimaryArea tasks={orderTasksByUrgency(sharedTasks)} />
        </section>
      ) : null}

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
        <span className={estado === 'Finalizado' ? 'font-medium text-emerald-600' : estado === 'Atrasado' ? 'font-medium text-red-600' : estado === 'En curso' ? 'font-medium text-[var(--chart-2)]' : 'font-medium text-[var(--chart-3)]'}>{estado}</span>
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

function SectionHeader({ count, title }: { count: number; title: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <Badge variant="outline" className="otc-glass-badge border-border/70 text-xs text-muted-foreground">
        {count}
      </Badge>
    </div>
  )
}

function orderTasksByUrgency(tasks: Tarea[]) {
  return tasks.toSorted((left, right) => diasRestantes(left.fechaFin) - diasRestantes(right.fechaFin))
}
