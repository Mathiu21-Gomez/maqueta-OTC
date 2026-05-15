import { normalizarTarea } from '@/features/tasks/domain/task.rules'
import type { Tarea } from '@/features/tasks/domain/task.types'
import { createTaskDtoFromInput, taskFromDto, taskToDto, type TaskDto } from '@/features/tasks/infrastructure/dto'
import type { TaskRepository } from '@/features/tasks/infrastructure/task.repository'
import { tareasIniciales as seedTasks } from '@/features/tasks/infrastructure/task.seed'

const STORAGE_KEY = 'otc-tasks'
// Subir si cambia la forma del DTO o la semilla, para invalidar datos viejos
// y evitar que un localStorage corrupto rompa la demo.
const STORAGE_VERSION = 1

function buildInitialDtos(): TaskDto[] {
  return seedTasks.map(taskToDto)
}

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && !!window.localStorage
}

function readStored(): TaskDto[] | null {
  if (!canUseStorage()) return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { v?: number; dtos?: TaskDto[] }
    if (parsed?.v !== STORAGE_VERSION || !Array.isArray(parsed.dtos)) return null
    return parsed.dtos
  } catch {
    return null
  }
}

function writeStored(dtos: TaskDto[]): void {
  if (!canUseStorage()) return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: STORAGE_VERSION, dtos }))
  } catch {
    // Almacenamiento lleno o no disponible: degradamos a solo-memoria.
  }
}

export function createMockTaskRepository(): TaskRepository {
  // Se resuelve en el primer acceso (cliente). En SSR no hay localStorage:
  // queda la semilla en memoria, sin persistir.
  let taskDtos: TaskDto[] | null = null

  function load(): TaskDto[] {
    if (taskDtos) return taskDtos

    const stored = readStored()
    if (stored) {
      taskDtos = stored
    } else {
      taskDtos = buildInitialDtos()
      writeStored(taskDtos)
    }

    return taskDtos
  }

  function commit(next: TaskDto[]): void {
    taskDtos = next
    writeStored(next)
  }

  return {
    async list() {
      return load().map((dto) => normalizarTarea(taskFromDto(dto)))
    },

    async create(input) {
      const dto = createTaskDtoFromInput(input, `tarea-${Date.now()}`)
      const normalized = normalizarTarea(taskFromDto(dto))

      commit([...load(), taskToDto(normalized)])

      return normalized
    },

    async update(id, input) {
      let updatedTask: Tarea | null = null

      const next = load().map((dto) => {
        if (dto.id !== id) {
          return dto
        }

        updatedTask = normalizarTarea(taskFromDto({
          ...dto,
          ...input,
          actividades: input.actividades ? input.actividades.map((actividad) => ({ ...actividad })) : dto.actividades,
          areas: input.areas ? [...input.areas] : dto.areas,
          areasApoyo: input.areasApoyo ? [...input.areasApoyo] : dto.areasApoyo,
          documentos: input.documentos ? input.documentos.map((documento) => ({ ...documento })) : dto.documentos,
        }))

        return taskToDto(updatedTask)
      })

      if (!updatedTask) {
        throw new Error(`Task ${id} not found in mock repository`)
      }

      commit(next)

      return updatedTask
    },

    async finalize(id) {
      const currentTask = load().find((dto) => dto.id === id)

      if (!currentTask) {
        throw new Error(`Task ${id} not found in mock repository`)
      }

      return this.update(id, {
        actividades: currentTask.actividades.map((actividad) => ({
          ...actividad,
          completada: true,
          porcentaje: 100,
        })),
      })
    },
  }
}

export const tareasIniciales = buildInitialDtos().map((dto) => normalizarTarea(taskFromDto(dto)))
