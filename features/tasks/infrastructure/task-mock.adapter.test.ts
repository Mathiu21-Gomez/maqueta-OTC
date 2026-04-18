import { describe, expect, it } from 'vitest'

import { createMockTaskRepository } from '@/features/tasks/infrastructure/task-mock.adapter'

describe('task mock repository', () => {
  it('crea tareas nuevas preservando el contrato de dominio', async () => {
    const repository = createMockTaskRepository()
    const initialTasks = await repository.list()

    const createdTask = await repository.create({
      actividades: [{ id: 'activity-1', nombre: 'Inspeccion inicial', porcentaje: 0, completada: false }],
      areas: ['Operaciones'],
      areasApoyo: ['Seguridad'],
      creadoPor: 'Admin',
      descripcion: 'Nueva tarea desde el repositorio mock',
      diasEjecutar: 7,
      documentos: [],
      fechaCreacion: '2026-01-15',
      fechaFin: '2026-12-30',
      fechaInicio: '2026-12-23',
      nombre: 'Tarea mock creada',
      prioridad: 'Alta',
      requiereApoyo: true,
    })

    const updatedTasks = await repository.list()

    expect(updatedTasks).toHaveLength(initialTasks.length + 1)
    expect(createdTask.estado).toBe('Planificado')
    expect(createdTask.areasApoyo).toEqual(['Seguridad'])
  })

  it('finaliza una tarea marcando todas las actividades al 100%', async () => {
    const repository = createMockTaskRepository()
    const [firstTask] = await repository.list()

    if (!firstTask) {
      throw new Error('Expected seeded tasks in mock repository')
    }

    const finalizedTask = await repository.finalize(firstTask.id)

    expect(finalizedTask.estado).toBe('Finalizado')
    expect(finalizedTask.avanceTotal).toBe(100)
    expect(finalizedTask.actividades.every((activity) => activity.completada)).toBe(true)
  })
})
