import type { Area, Prioridad } from '@/features/tasks/domain/task.types'

export interface TaskDraftActivity {
  completada: boolean
  id: string
  nombre: string
  porcentaje: number
}

export interface TaskDraftDocument {
  nombre: string
  url: string
}

export interface RouteTaskDraft {
  actividades: TaskDraftActivity[]
  areas: Area[]
  areasApoyo: Area[]
  descripcion: string
  documentos: TaskDraftDocument[]
  fechaFin: string
  fechaInicio: string
  nombre: string
  prioridad: Prioridad
  requiereApoyo: boolean
}

export interface SheetTaskDraft {
  actividades: TaskDraftActivity[]
  area: Area | null
  areasApoyo: Area[]
  descripcion: string
  documentos: TaskDraftDocument[]
  fechaFin: string
  fechaInicio: string
  nombre: string
  prioridad: Prioridad
  requiereApoyo: boolean
}

export interface NewTaskErrors {
  actividades?: string
  areas?: string
  fechaFin?: string
  fechaInicio?: string
  nombre?: string
}

export const NEW_TASK_FIELD_ORDER = ['nombre', 'areas', 'fechaInicio', 'fechaFin', 'actividades'] as const

export type NewTaskFieldKey = (typeof NEW_TASK_FIELD_ORDER)[number]

export function getFirstInvalidField(errors: NewTaskErrors): NewTaskFieldKey | null {
  return NEW_TASK_FIELD_ORDER.find((field) => Boolean(errors[field])) ?? null
}

export function createActivityDraft(seed = Date.now()) {
  return {
    completada: false,
    id: `act-${seed}`,
    nombre: '',
    porcentaje: 0,
  }
}

export function createRouteTaskDraft(): RouteTaskDraft {
  return {
    actividades: [createActivityDraft()],
    areas: [],
    areasApoyo: [],
    descripcion: '',
    documentos: [],
    fechaFin: '',
    fechaInicio: '',
    nombre: '',
    prioridad: 'Media',
    requiereApoyo: false,
  }
}

export function createSheetTaskDraft(): SheetTaskDraft {
  return {
    actividades: [createActivityDraft()],
    area: null,
    areasApoyo: [],
    descripcion: '',
    documentos: [],
    fechaFin: '',
    fechaInicio: '',
    nombre: '',
    prioridad: 'Media',
    requiereApoyo: false,
  }
}

export function calculateExecutionDays(start: string, end: string) {
  if (!start || !end) return 0

  const startDate = new Date(start)
  const endDate = new Date(end)
  const diff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

  return Math.max(0, diff)
}

export function createDocumentDraft() {
  return {
    nombre: `Documento_${Date.now()}.pdf`,
    url: '#',
  }
}

export function sanitizeActivities(activities: TaskDraftActivity[]) {
  return activities
    .filter((activity) => activity.nombre.trim())
    .map((activity, index) => ({
      ...activity,
      id: `act-${Date.now()}-${index}`,
    }))
}

export function validateTaskDraft(input: {
  actividades: TaskDraftActivity[]
  fechaFin: string
  fechaInicio: string
  nombre: string
  primarySelectionCount: number
}) {
  const errors: NewTaskErrors = {}

  if (!input.nombre.trim()) errors.nombre = 'El nombre es requerido'
  if (input.primarySelectionCount === 0) errors.areas = 'Selecciona al menos un area'
  if (!input.fechaInicio) errors.fechaInicio = 'La fecha de inicio es requerida'

  if (!input.fechaFin) {
    errors.fechaFin = 'La fecha de fin es requerida'
  } else if (input.fechaInicio && new Date(input.fechaFin) <= new Date(input.fechaInicio)) {
    errors.fechaFin = 'La fecha de fin debe ser posterior a la fecha de inicio'
  }

  if (sanitizeActivities(input.actividades).length === 0) {
    errors.actividades = 'Agrega al menos una actividad'
  }

  return errors
}
