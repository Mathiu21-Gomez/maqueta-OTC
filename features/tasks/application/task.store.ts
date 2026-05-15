import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { generarNotificaciones } from '@/features/tasks/domain/task.rules'
import type { Notificacion, Tarea } from '@/features/tasks/domain/task.types'

interface TaskStoreState {
  hydrated: boolean
  notifications: Notificacion[]
  readNotificationIds: string[]
  tasks: Tarea[]
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  replaceTask: (task: Tarea) => void
  setTasks: (tasks: Tarea[]) => void
}

const initialTaskState = {
  hydrated: false,
  notifications: [] as Notificacion[],
  readNotificationIds: [] as string[],
  tasks: [] as Tarea[],
}

/**
 * Las notificaciones son DERIVADAS de las tareas (se regeneran). Lo único
 * que es "verdad" del usuario es qué IDs marcó leídos. Aplicamos ese estado
 * sobre la lista recién generada para que `leida` sobreviva tanto a una
 * edición de tarea (bug histórico) como a un refresh (persistencia).
 */
function applyRead(notifications: Notificacion[], readIds: string[]): Notificacion[] {
  if (readIds.length === 0) return notifications
  const readSet = new Set(readIds)
  return notifications.map((notification) =>
    readSet.has(notification.id) ? { ...notification, leida: true } : notification,
  )
}

export const useTaskStore = create<TaskStoreState>()(
  persist(
    (set, get) => ({
      ...initialTaskState,
      markNotificationRead: (id) => {
        set((state) => {
          const readNotificationIds = state.readNotificationIds.includes(id)
            ? state.readNotificationIds
            : [...state.readNotificationIds, id]

          return {
            readNotificationIds,
            notifications: state.notifications.map((notification) =>
              notification.id === id ? { ...notification, leida: true } : notification,
            ),
          }
        })
      },
      markAllNotificationsRead: () => {
        set((state) => {
          const idsToRead = state.notifications.map((notification) => notification.id)
          const readNotificationIds = Array.from(
            new Set([...state.readNotificationIds, ...idsToRead]),
          )

          return {
            readNotificationIds,
            notifications: state.notifications.map((notification) =>
              notification.leida ? notification : { ...notification, leida: true },
            ),
          }
        })
      },
      replaceTask: (task) => {
        set((state) => {
          const tasks = state.tasks.map((currentTask) =>
            currentTask.id === task.id ? task : currentTask,
          )

          return {
            notifications: applyRead(generarNotificaciones(tasks), state.readNotificationIds),
            tasks,
          }
        })
      },
      setTasks: (tasks) => {
        set({
          hydrated: true,
          notifications: applyRead(generarNotificaciones(tasks), get().readNotificationIds),
          tasks,
        })
      },
    }),
    {
      name: 'otc-notif-read',
      storage: createJSONStorage(() => localStorage),
      // Solo persistimos el estado de lectura. Tareas y notificaciones
      // se rehidratan/derivan en cada sesión, no se guardan.
      partialize: (state) => ({ readNotificationIds: state.readNotificationIds }),
    },
  ),
)

export function resetTaskStore() {
  useTaskStore.setState(initialTaskState)
}
