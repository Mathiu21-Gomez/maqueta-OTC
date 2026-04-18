import type { Area, EstadoTarea, Prioridad } from '@/features/tasks/domain/task.types'

export function getEstadoColor(estado: EstadoTarea): string {
  const colores: Record<EstadoTarea, string> = {
    Planificado: 'bg-amber-100 text-amber-800 border-amber-200',
    'En curso': 'bg-blue-100 text-blue-800 border-blue-200',
    Finalizado: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    Atrasado: 'bg-red-100 text-red-800 border-red-200',
  }

  return colores[estado]
}

export function getPrioridadColor(prioridad: Prioridad): string {
  const colores: Record<Prioridad, string> = {
    Alta: 'bg-red-100 text-red-800 border-red-200',
    Media: 'bg-amber-100 text-amber-800 border-amber-200',
    Baja: 'bg-slate-100 text-slate-800 border-slate-200',
  }

  return colores[prioridad]
}

export function getAreaColor(area: Area): string {
  const colores: Record<Area, string> = {
    Seguridad: 'bg-red-50 text-red-700 border-red-200',
    Comunidades: 'bg-purple-50 text-purple-700 border-purple-200',
    Legal: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    Mantenimiento: 'bg-orange-50 text-orange-700 border-orange-200',
    'Medio Ambiente': 'bg-green-50 text-green-700 border-green-200',
    Operaciones: 'bg-blue-50 text-blue-700 border-blue-200',
    Calidad: 'bg-teal-50 text-teal-700 border-teal-200',
    Compras: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  }

  return colores[area]
}
