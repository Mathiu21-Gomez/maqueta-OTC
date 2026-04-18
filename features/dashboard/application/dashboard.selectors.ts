import {
  calcularCumplimientoPorArea,
  calcularEstado,
  calcularKPIs,
  calcularTareasPorMes,
  getMesFromFecha,
} from '@/features/tasks/domain/task.rules'
import { AREAS } from '@/features/tasks/domain/task.constants'
import type { Area, EstadoTarea, Tarea } from '@/features/tasks/domain/task.types'

export interface DashboardFilters {
  area: string
  estado: string
  mes: string
}

export const DEFAULT_DASHBOARD_FILTERS: DashboardFilters = {
  area: 'todas',
  estado: 'todos',
  mes: 'todos',
}

export function filterDashboardTasks(tasks: Tarea[], filters: DashboardFilters) {
  return tasks.filter((task) => {
    const mes = getMesFromFecha(task.fechaInicio)
    const estado = calcularEstado(task)

    if (filters.mes !== 'todos' && mes !== Number.parseInt(filters.mes, 10)) return false
    if (filters.area !== 'todas' && !task.areas.includes(filters.area as Area)) return false
    if (filters.estado !== 'todos' && estado !== filters.estado) return false

    return true
  })
}

export function buildDashboardViewModel(tasks: Tarea[]) {
  return {
    cumplimientoPorArea: calcularCumplimientoPorArea(tasks, AREAS),
    kpis: calcularKPIs(tasks),
    tareasPorMes: calcularTareasPorMes(tasks),
    tareasVigentes: tasks,
  }
}

export function getDashboardStatusOptions(tasks: Tarea[]): EstadoTarea[] {
  const statuses = new Set<EstadoTarea>()

  tasks.forEach((task) => {
    statuses.add(calcularEstado(task))
  })

  return Array.from(statuses)
}
