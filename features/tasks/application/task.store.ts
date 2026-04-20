import { create } from 'zustand'

import { generarNotificaciones } from '@/features/tasks/domain/task.rules'
import type { Notificacion, Tarea } from '@/features/tasks/domain/task.types'

interface TaskStoreState {
  hydrated: boolean
  notifications: Notificacion[]
  tasks: Tarea[]
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  replaceTask: (task: Tarea) => void
  setTasks: (tasks: Tarea[]) => void
}

const initialTaskState = {
  hydrated: false,
  notifications: [] as Notificacion[],
  tasks: [] as Tarea[],
}

export const useTaskStore = create<TaskStoreState>((set) => ({
  ...initialTaskState,
  markNotificationRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((notification) =>
        notification.id === id ? { ...notification, leida: true } : notification,
      ),
    }))
  },
  markAllNotificationsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((notification) =>
        notification.leida ? notification : { ...notification, leida: true },
      ),
    }))
  },
  replaceTask: (task) => {
    set((state) => {
      const tasks = state.tasks.map((currentTask) => (currentTask.id === task.id ? task : currentTask))

      return {
        notifications: generarNotificaciones(tasks),
        tasks,
      }
    })
  },
  setTasks: (tasks) => {
    set({
      hydrated: true,
      notifications: generarNotificaciones(tasks),
      tasks,
    })
  },
}))

export function resetTaskStore() {
  useTaskStore.setState(initialTaskState)
}
