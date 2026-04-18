import type { Actividad, CreateTaskInput, Documento, Tarea, UpdateTaskInput } from '@/features/tasks/domain/task.types'

export type TaskDto = Tarea
export type CreateTaskDto = CreateTaskInput
export type UpdateTaskDto = UpdateTaskInput

function cloneActividad(actividad: Actividad): Actividad {
  return { ...actividad }
}

function cloneDocumento(documento: Documento): Documento {
  return { ...documento }
}

export function taskFromDto(dto: TaskDto): Tarea {
  return {
    ...dto,
    areas: [...dto.areas],
    areasApoyo: [...dto.areasApoyo],
    documentos: dto.documentos.map(cloneDocumento),
    actividades: dto.actividades.map(cloneActividad),
  }
}

export function taskToDto(task: Tarea): TaskDto {
  return taskFromDto(task)
}

export function createTaskDtoFromInput(input: CreateTaskInput, id: string): TaskDto {
  return {
    ...input,
    id,
    avanceTotal: 0,
    estado: 'Planificado',
    areas: [...input.areas],
    areasApoyo: [...input.areasApoyo],
    documentos: input.documentos.map(cloneDocumento),
    actividades: input.actividades.map(cloneActividad),
  }
}
