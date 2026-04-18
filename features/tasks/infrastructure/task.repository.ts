import type { CreateTaskInput, Tarea, UpdateTaskInput } from '@/features/tasks/domain/task.types'
import { createTaskApiRepository } from '@/features/tasks/infrastructure/task-api.adapter'
import { createMockTaskRepository } from '@/features/tasks/infrastructure/task-mock.adapter'

export interface TaskRepository {
  create(input: CreateTaskInput): Promise<Tarea>
  finalize(id: string): Promise<Tarea>
  list(): Promise<Tarea[]>
  update(id: string, input: UpdateTaskInput): Promise<Tarea>
}

export const taskMockRepository = createMockTaskRepository()
export const taskApiRepository = createTaskApiRepository()

let activeTaskRepository: TaskRepository = taskMockRepository

export function getTaskRepository() {
  return activeTaskRepository
}

export function setTaskRepository(repository: TaskRepository) {
  activeTaskRepository = repository
}

export function resetTaskRepository() {
  activeTaskRepository = taskMockRepository
}
