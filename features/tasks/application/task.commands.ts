import { useTaskStore } from '@/features/tasks/application/task.store'
import { buildCreateTaskInput } from '@/features/tasks/domain/task.rules'
import type { Area, CreateTaskInput, RolUsuario, UpdateTaskInput } from '@/features/tasks/domain/task.types'
import { getTaskRepository } from '@/features/tasks/infrastructure/task.repository'

interface CreateTaskCommandContext {
  areaUsuario: Area
  rol: RolUsuario
}

let hydrationPromise: Promise<void> | null = null

export async function hydrateTaskStore() {
  const { hydrated, setTasks } = useTaskStore.getState()

  if (hydrated) {
    return
  }

  if (!hydrationPromise) {
    hydrationPromise = getTaskRepository().list().then((tasks) => {
      setTasks(tasks)
    }).finally(() => {
      hydrationPromise = null
    })
  }

  await hydrationPromise
}

export async function createTask(
  input: Omit<CreateTaskInput, 'creadoPor' | 'fechaCreacion'>,
  context: CreateTaskCommandContext,
) {
  const task = await getTaskRepository().create(buildCreateTaskInput(input, context))
  const store = useTaskStore.getState()

  store.setTasks([...store.tasks, task])

  return task
}

export async function updateTask(id: string, input: UpdateTaskInput) {
  const updatedTask = await getTaskRepository().update(id, input)
  useTaskStore.getState().replaceTask(updatedTask)

  return updatedTask
}

export async function toggleTaskActivity(taskId: string, activityId: string, completed: boolean) {
  const currentTask = useTaskStore.getState().tasks.find((task) => task.id === taskId)

  if (!currentTask) {
    throw new Error(`Task ${taskId} not found in store`)
  }

  return updateTask(taskId, {
    actividades: currentTask.actividades.map((actividad) =>
      actividad.id === activityId
        ? { ...actividad, completada: completed, porcentaje: completed ? 100 : 0 }
        : actividad,
    ),
  })
}

export async function finalizeTask(id: string) {
  const updatedTask = await getTaskRepository().finalize(id)
  useTaskStore.getState().replaceTask(updatedTask)

  return updatedTask
}

export function markNotificationRead(id: string) {
  useTaskStore.getState().markNotificationRead(id)
}
