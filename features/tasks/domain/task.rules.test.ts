import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  buildCreateTaskInput,
  generarNotificaciones,
  normalizarTarea,
} from '@/features/tasks/domain/task.rules'
import { createTaskFixture } from '@/features/tasks/testing/task.fixtures'

describe('task.rules', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('normaliza avance total y estado desde las actividades', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-15T12:00:00Z'))

    const normalizedTask = normalizarTarea(
      createTaskFixture({
        actividades: [
          { id: 'a-1', nombre: 'Planificacion', porcentaje: 100, completada: true },
          { id: 'a-2', nombre: 'Ejecucion', porcentaje: 50, completada: false },
        ],
        fechaFin: '2026-01-25',
        fechaInicio: '2026-01-05',
      }),
    )

    expect(normalizedTask.avanceTotal).toBe(75)
    expect(normalizedTask.estado).toBe('En curso')
  })

  it('genera notificaciones priorizando atrasadas sobre proximas a vencer', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-15T12:00:00Z'))

    const notifications = generarNotificaciones([
      createTaskFixture({ id: 'late', fechaFin: '2026-01-10', fechaInicio: '2026-01-01' }),
      createTaskFixture({ id: 'due-soon', fechaFin: '2026-01-18', fechaInicio: '2026-01-01' }),
    ])

    expect(notifications).toHaveLength(2)
    expect(notifications[0]?.tareaId).toBe('late')
    expect(notifications[0]?.tipo).toBe('atrasada')
    expect(notifications[1]?.tareaId).toBe('due-soon')
    expect(notifications[1]?.tipo).toBe('porVencer')
  })

  it('completa metadatos de creacion segun el contexto del usuario', () => {
    const createTaskInput = buildCreateTaskInput(
      {
        actividades: [{ id: 'a-1', nombre: 'Actividad', porcentaje: 0, completada: false }],
        areas: ['Calidad'],
        areasApoyo: [],
        descripcion: 'Nueva tarea creada desde tests',
        diasEjecutar: 12,
        documentos: [],
        fechaFin: '2026-01-31',
        fechaInicio: '2026-01-20',
        nombre: 'Nueva tarea',
        prioridad: 'Alta',
        requiereApoyo: false,
      },
      {
        areaUsuario: 'Calidad',
        now: new Date('2026-01-12T08:30:00Z'),
        rol: 'Usuario',
      },
    )

    expect(createTaskInput.creadoPor).toBe('Calidad')
    expect(createTaskInput.fechaCreacion).toBe('2026-01-12')
  })
})
