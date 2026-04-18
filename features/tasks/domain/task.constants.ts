import type { Area, EstadoTarea, Prioridad } from '@/features/tasks/domain/task.types'

export const AREAS: Area[] = [
  'Seguridad',
  'Comunidades',
  'Legal',
  'Mantenimiento',
  'Medio Ambiente',
  'Operaciones',
  'Calidad',
  'Compras',
]

export const ESTADOS: EstadoTarea[] = ['Planificado', 'En curso', 'Finalizado', 'Atrasado']
export const PRIORIDADES: Prioridad[] = ['Alta', 'Media', 'Baja']
export const MESES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
] as const
