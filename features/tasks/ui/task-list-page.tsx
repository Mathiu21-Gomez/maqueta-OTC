'use client'

import { startTransition, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, PlusCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from '@/components/ui/pagination'
import { TareasMensualesBarChart } from '@/components/charts/tareas-mensuales-bar-chart'
import { useShellStore } from '@/features/shell/application/shell.store'
import { selectTasks } from '@/features/tasks/application/task.selectors'
import { useTaskStore } from '@/features/tasks/application/task.store'
import { calcularEstado, calcularTareasPorMes, getMesFromFecha } from '@/features/tasks/domain/task.rules'
import type { Area, Prioridad, Tarea } from '@/features/tasks/domain/task.types'
import { TaskDetailSheet } from '@/features/tasks/ui/task-detail-sheet'
import { TaskFilters } from '@/features/tasks/ui/task-filters'
import { TaskPageHeader } from '@/features/tasks/ui/task-page-header'
import { TaskSortDirection, TaskSortField, TaskTable } from '@/features/tasks/ui/task-table'

const ITEMS_PER_PAGE = 10

export function TaskListPage() {
  const tasks = useTaskStore(selectTasks)
  const setNuevaTareaSheetOpen = useShellStore((state) => state.setNuevaTareaSheetOpen)
  const [selectedTask, setSelectedTask] = useState<Tarea | null>(null)
  const [search, setSearch] = useState('')
  const [mesFilter, setMesFilter] = useState('todos')
  const [areaFilter, setAreaFilter] = useState('todas')
  const [estadoFilter, setEstadoFilter] = useState('todos')
  const [prioridadFilter, setPrioridadFilter] = useState('todas')
  const [sortField, setSortField] = useState<TaskSortField>('fechaFin')
  const [sortDirection, setSortDirection] = useState<TaskSortDirection>('asc')
  const [currentPage, setCurrentPage] = useState(1)

  const filteredTasks = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    const results = tasks.filter((task) => {
      if (normalizedSearch) {
        const haystack = `${task.nombre} ${task.descripcion}`.toLowerCase()
        if (!haystack.includes(normalizedSearch)) return false
      }

      if (mesFilter !== 'todos' && getMesFromFecha(task.fechaInicio) !== Number.parseInt(mesFilter, 10)) return false
      if (areaFilter !== 'todas' && !task.areas.includes(areaFilter as Area)) return false
      if (estadoFilter !== 'todos' && calcularEstado(task) !== estadoFilter) return false
      if (prioridadFilter !== 'todas' && task.prioridad !== prioridadFilter) return false

      return true
    })

    return results.toSorted((left, right) => compareTasks(left, right, sortField, sortDirection))
  }, [areaFilter, estadoFilter, mesFilter, prioridadFilter, search, sortDirection, sortField, tasks])

  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / ITEMS_PER_PAGE))
  const paginatedTasks = useMemo(
    () => filteredTasks.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
    [currentPage, filteredTasks],
  )
  const chartData = useMemo(() => calcularTareasPorMes(filteredTasks), [filteredTasks])
  const stats = useMemo(() => {
    const total = filteredTasks.length
    const finalizadas = filteredTasks.filter((task) => calcularEstado(task) === 'Finalizado').length
    const atrasadas = filteredTasks.filter((task) => calcularEstado(task) === 'Atrasado').length
    const avancePromedio = total > 0 ? Math.round(filteredTasks.reduce((sum, task) => sum + task.avanceTotal, 0) / total) : 0

    return { avancePromedio, atrasadas, finalizadas, total }
  }, [filteredTasks])

  const pageNumbers = useMemo(() => buildPageNumbers(currentPage, totalPages), [currentPage, totalPages])

  const handleSort = (field: TaskSortField) => {
    setCurrentPage(1)
    if (sortField === field) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'))
      return
    }

    setSortField(field)
    setSortDirection('asc')
  }

  const openTask = (task: Tarea) => startTransition(() => setSelectedTask(task))
  const openNewTask = () => startTransition(() => setNuevaTareaSheetOpen(true))

  return (
    <div className="otc-grid-shell flex flex-col gap-6 rounded-[calc(var(--radius)+0.5rem)] p-1">
      <TaskPageHeader
        eyebrow="Vista principal"
        title="Lista de tareas"
        description={`${filteredTasks.length} tareas encontradas con la capa modular actual.`}
        meta={[
          { label: 'Visibles', value: filteredTasks.length.toString() },
          { label: 'Promedio', value: `${stats.avancePromedio}%` },
          { label: 'Paginas', value: totalPages.toString() },
        ]}
        narrative="Primero lee volumen y riesgo. Despues filtra y recien ahi entra al detalle de la tarea puntual."
        actions={
          <Button onClick={openNewTask}>
            <PlusCircle data-icon="inline-start" />
            Nueva tarea
          </Button>
        }
      />

      <TaskFilters
        title="Filtros y busqueda"
        search={{ value: search, onChange: (value) => { setSearch(value); setCurrentPage(1) }, placeholder: 'Buscar por nombre o descripcion...' }}
        mes={{ value: mesFilter, onChange: (value) => { setMesFilter(value); setCurrentPage(1) } }}
        area={{ value: areaFilter, onChange: (value) => { setAreaFilter(value); setCurrentPage(1) } }}
        estado={{ value: estadoFilter, onChange: (value) => { setEstadoFilter(value); setCurrentPage(1) } }}
        prioridad={{ value: prioridadFilter, onChange: (value) => { setPrioridadFilter(value); setCurrentPage(1) } }}
      />

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
        <div className="otc-soft-panel rounded-[calc(var(--radius)+0.125rem)] px-5 py-4">
          <p className="otc-section-kicker">Narrativa</p>
          <h2 className="mt-2 text-2xl font-semibold text-foreground">La tabla ya no compite con el contexto</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            El framing ejecutivo llega antes que la densidad: estado general, evolucion mensual y accion explicita para abrir el detalle.
          </p>
        </div>
        <div className="otc-soft-panel rounded-[calc(var(--radius)+0.125rem)] px-5 py-4">
          <p className="otc-section-kicker">Ritmo mensual</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Este corte ayuda a validar si la lista responde a un pico puntual o a una tendencia sostenida.</p>
        </div>
      </section>

      <TareasMensualesBarChart data={chartData} />

      <TaskTable
        onOpenTask={openTask}
        onSort={handleSort}
        sortDirection={sortDirection}
        sortField={sortField}
        stats={stats}
        tasks={paginatedTasks}
      />

      {totalPages > 1 ? (
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} a {Math.min(currentPage * ITEMS_PER_PAGE, filteredTasks.length)} de {filteredTasks.length} tareas
          </p>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <Button variant="ghost" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}>
                  <ChevronLeft data-icon="inline-start" />
                  Anterior
                </Button>
              </PaginationItem>
              {pageNumbers.map((page, index) => (
                <PaginationItem key={`${page}-${index}`}>
                  {page === 'ellipsis' ? (
                    <PaginationEllipsis />
                  ) : (
                    <Button variant={currentPage === page ? 'outline' : 'ghost'} size="icon" onClick={() => setCurrentPage(page)}>
                      {page}
                    </Button>
                  )}
                </PaginationItem>
              ))}
              <PaginationItem>
                <Button variant="ghost" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}>
                  Siguiente
                  <ChevronRight data-icon="inline-end" />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      ) : null}

      {selectedTask ? <TaskDetailSheet task={selectedTask} open={Boolean(selectedTask)} onClose={() => startTransition(() => setSelectedTask(null))} /> : null}
    </div>
  )
}

function buildPageNumbers(currentPage: number, totalPages: number) {
  const pages: Array<number | 'ellipsis'> = []

  if (totalPages <= 5) {
    for (let page = 1; page <= totalPages; page += 1) pages.push(page)
    return pages
  }

  pages.push(1)
  if (currentPage > 3) pages.push('ellipsis')

  for (let page = Math.max(2, currentPage - 1); page <= Math.min(totalPages - 1, currentPage + 1); page += 1) {
    pages.push(page)
  }

  if (currentPage < totalPages - 2) pages.push('ellipsis')
  pages.push(totalPages)
  return pages
}

function compareTasks(left: Tarea, right: Tarea, field: TaskSortField, direction: TaskSortDirection) {
  let result = 0

  switch (field) {
    case 'nombre':
      result = left.nombre.localeCompare(right.nombre)
      break
    case 'estado':
      result = calcularEstado(left).localeCompare(calcularEstado(right))
      break
    case 'avanceTotal':
      result = left.avanceTotal - right.avanceTotal
      break
    case 'fechaFin':
      result = new Date(left.fechaFin).getTime() - new Date(right.fechaFin).getTime()
      break
    case 'prioridad': {
      const order: Record<Prioridad, number> = { Alta: 0, Media: 1, Baja: 2 }
      result = order[left.prioridad] - order[right.prioridad]
      break
    }
  }

  return direction === 'asc' ? result : -result
}
