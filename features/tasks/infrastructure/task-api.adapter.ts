import type { TaskRepository } from '@/features/tasks/infrastructure/task.repository'

function notImplemented(): never {
  throw new Error('task-api.adapter is not implemented in Phase 1')
}

export function createTaskApiRepository(): TaskRepository {
  return {
    async list() {
      return notImplemented()
    },
    async create() {
      return notImplemented()
    },
    async update() {
      return notImplemented()
    },
    async finalize() {
      return notImplemented()
    },
  }
}
