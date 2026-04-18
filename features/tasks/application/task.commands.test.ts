import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  createTask,
  finalizeTask,
  hydrateTaskStore,
  toggleTaskActivity,
} from '@/features/tasks/application/task.commands'
import { resetTaskStore, useTaskStore } from '@/features/tasks/application/task.store'
import { normalizarTarea } from '@/features/tasks/domain/task.rules'
import type { CreateTaskInput, Tarea, UpdateTaskInput } from '@/features/tasks/domain/task.types'
import {
  resetTaskRepository,
  setTaskRepository,
  type TaskRepository,
} from '@/features/tasks/infrastructure/task.repository'
import { createTaskFixture } from '@/features/tasks/testing/task.fixtures'

function createInMemoryRepository(seedTasks: Tarea[] = []) {
  let tasks = seedTasks.map((task) => normalizarTarea(task))
  let listCalls = 0

  const repository: TaskRepository = {
    async list() {
      listCalls += 1
      return tasks.map((task) => normalizarTarea(task))
    },
    async create(input: CreateTaskInput) {
      const createdTask = normalizarTarea({
        ...input,
        id: `task-${tasks.length + 1}`,
        avanceTotal: 0,
        estado: 'Planificado',
      })

      tasks = [...tasks, createdTask]
      return createdTask
    },
    async update(id: string, input: UpdateTaskInput) {
      let updatedTask: Tarea | null = null

      tasks = tasks.map((task) => {
        if (task.id !== id) {
          return task
        }

        updatedTask = normalizarTarea({
          ...task,
          ...input,
          actividades: input.actividades ? input.actividades.map((actividad) => ({ ...actividad })) : task.actividades,
          areas: input.areas ? [...input.areas] : task.areas,
          areasApoyo: input.areasApoyo ? [...input.areasApoyo] : task.areasApoyo,
          documentos: input.documentos ? input.documentos.map((documento) => ({ ...documento })) : task.documentos,
        })

        return updatedTask
      })

      if (!updatedTask) {
        throw new Error(`Task ${id} not found`)
      }

      return updatedTask
    },
    async finalize(id: string) {
      const currentTask = tasks.find((task) => task.id === id)

      if (!currentTask) {
        throw new Error(`Task ${id} not found`)
      }

      return repository.update(id, {
        actividades: currentTask.actividades.map((actividad) => ({
          ...actividad,
          completada: true,
          porcentaje: 100,
        })),
      })
    },
  }

  return {
    getListCalls: () => listCalls,
    repository,
  }
}

describe('task.commands', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-15T12:00:00Z'))
    resetTaskRepository()
    resetTaskStore()
  })

  it('hidrata el store una sola vez aunque haya llamados concurrentes', async () => {
    const inMemoryRepository = createInMemoryRepository([createTaskFixture({ id: 'seed-task' })])

    setTaskRepository(inMemoryRepository.repository)

    await Promise.all([hydrateTaskStore(), hydrateTaskStore()])

    expect(inMemoryRepository.getListCalls()).toBe(1)
    expect(useTaskStore.getState().hydrated).toBe(true)
    expect(useTaskStore.getState().tasks).toHaveLength(1)
  })

  it('crea tareas nuevas y las deja disponibles en el store', async () => {
    const inMemoryRepository = createInMemoryRepository([])

    setTaskRepository(inMemoryRepository.repository)

    const createdTask = await createTask(
      {
        actividades: [{ id: 'activity-1', nombre: 'Preparacion', porcentaje: 0, completada: false }],
        areas: ['Compras'],
        areasApoyo: [],
        descripcion: 'Alta de tarea desde comando',
        diasEjecutar: 9,
        documentos: [],
        fechaFin: '2026-01-30',
        fechaInicio: '2026-01-21',
        nombre: 'Nueva tarea comando',
        prioridad: 'Alta',
        requiereApoyo: false,
      },
      { areaUsuario: 'Compras', rol: 'Usuario' },
    )

    expect(createdTask.creadoPor).toBe('Compras')
    expect(useTaskStore.getState().tasks).toHaveLength(1)
    expect(useTaskStore.getState().tasks[0]?.nombre).toBe('Nueva tarea comando')
  })

  it('actualiza actividades y permite finalizar tareas desde el store vigente', async () => {
    const seedTask = createTaskFixture({
      id: 'seed-task',
      actividades: [
        { id: 'activity-1', nombre: 'Actividad 1', porcentaje: 100, completada: true },
        { id: 'activity-2', nombre: 'Actividad 2', porcentaje: 0, completada: false },
      ],
    })
    const inMemoryRepository = createInMemoryRepository([seedTask])

    setTaskRepository(inMemoryRepository.repository)
    await hydrateTaskStore()

    const toggledTask = await toggleTaskActivity('seed-task', 'activity-2', true)
    const finalizedTask = await finalizeTask('seed-task')

    expect(toggledTask.avanceTotal).toBe(100)
    expect(finalizedTask.estado).toBe('Finalizado')
    expect(useTaskStore.getState().tasks[0]?.estado).toBe('Finalizado')
  })
})
