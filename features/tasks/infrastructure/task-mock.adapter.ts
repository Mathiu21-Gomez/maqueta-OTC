import { normalizarTarea } from '@/features/tasks/domain/task.rules'
import type { Tarea } from '@/features/tasks/domain/task.types'
import { createTaskDtoFromInput, taskFromDto, taskToDto, type TaskDto } from '@/features/tasks/infrastructure/dto'
import type { TaskRepository } from '@/features/tasks/infrastructure/task.repository'
import { tareasIniciales as seedTasks } from '@/features/tasks/infrastructure/task.seed'

function buildInitialDtos(): TaskDto[] {
  return seedTasks.map(taskToDto)
}

export function createMockTaskRepository(): TaskRepository {
  let taskDtos = buildInitialDtos()

  return {
    async list() {
      return taskDtos.map((dto) => normalizarTarea(taskFromDto(dto)))
    },

    async create(input) {
      const dto = createTaskDtoFromInput(input, `tarea-${Date.now()}`)
      const normalized = normalizarTarea(taskFromDto(dto))

      taskDtos = [...taskDtos, taskToDto(normalized)]

      return normalized
    },

    async update(id, input) {
      let updatedTask: Tarea | null = null

      taskDtos = taskDtos.map((dto) => {
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

      return updatedTask
    },

    async finalize(id) {
      const currentTask = taskDtos.find((dto) => dto.id === id)

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
