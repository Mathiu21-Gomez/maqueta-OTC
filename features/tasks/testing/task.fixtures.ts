import { normalizarTarea } from '@/features/tasks/domain/task.rules'
import type { Tarea } from '@/features/tasks/domain/task.types'

export function createTaskFixture(overrides: Partial<Tarea> = {}): Tarea {
  const baseTask: Tarea = {
    id: 'task-fixture',
    nombre: 'Tarea fixture',
    descripcion: 'Tarea base para pruebas',
    areas: ['Seguridad'],
    estado: 'En curso',
    fechaInicio: '2026-01-10',
    fechaFin: '2026-01-20',
    diasEjecutar: 10,
    prioridad: 'Media',
    requiereApoyo: false,
    areasApoyo: [],
    documentos: [],
    actividades: [
      { id: 'act-1', nombre: 'Actividad 1', porcentaje: 100, completada: true },
      { id: 'act-2', nombre: 'Actividad 2', porcentaje: 0, completada: false },
    ],
    avanceTotal: 50,
    creadoPor: 'Admin',
    fechaCreacion: '2026-01-01',
  }

  return normalizarTarea({
    ...baseTask,
    ...overrides,
    actividades: overrides.actividades ? overrides.actividades.map((actividad) => ({ ...actividad })) : baseTask.actividades.map((actividad) => ({ ...actividad })),
    areas: overrides.areas ? [...overrides.areas] : [...baseTask.areas],
    areasApoyo: overrides.areasApoyo ? [...overrides.areasApoyo] : [...baseTask.areasApoyo],
    documentos: overrides.documentos ? overrides.documentos.map((documento) => ({ ...documento })) : baseTask.documentos.map((documento) => ({ ...documento })),
  })
}
