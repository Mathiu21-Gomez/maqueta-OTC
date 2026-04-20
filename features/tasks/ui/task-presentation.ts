import type { Area, EstadoTarea, Prioridad } from '@/features/tasks/domain/task.types'

export function getEstadoColor(estado: EstadoTarea): string {
  const colores: Record<EstadoTarea, string> = {
    Planificado: 'bg-warning/15 text-warning-emphasis border-warning/25',
    'En curso': 'bg-info/15 text-info-emphasis border-info/25',
    Finalizado: 'bg-success/15 text-success-emphasis border-success/25',
    Atrasado: 'bg-danger/15 text-danger-emphasis border-danger/25',
  }

  return colores[estado]
}

export function getPrioridadColor(prioridad: Prioridad): string {
  const colores: Record<Prioridad, string> = {
    Alta: 'bg-danger/15 text-danger-emphasis border-danger/25',
    Media: 'bg-warning/15 text-warning-emphasis border-warning/25',
    Baja: 'bg-muted text-muted-foreground border-border',
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
