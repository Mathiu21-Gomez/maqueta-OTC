import { useTaskStore } from '@/features/tasks/application/task.store'
import { calcularCumplimientoPorArea, calcularKPIs, calcularTareasPorMes } from '@/features/tasks/domain/task.rules'
import type { Area } from '@/features/tasks/domain/task.types'

export const selectTasks = (state: ReturnType<typeof useTaskStore.getState>) => state.tasks
export const selectNotifications = (state: ReturnType<typeof useTaskStore.getState>) => state.notifications
export const selectUnreadNotificationCount = (state: ReturnType<typeof useTaskStore.getState>) =>
  state.notifications.reduce((count, notification) => (notification.leida ? count : count + 1), 0)
export const selectTasksHydrated = (state: ReturnType<typeof useTaskStore.getState>) => state.hydrated

export function selectTaskById(taskId: string) {
  return (state: ReturnType<typeof useTaskStore.getState>) => state.tasks.find((task) => task.id === taskId)
}

export function selectTaskKpis() {
  return calcularKPIs(useTaskStore.getState().tasks)
}

export function selectComplianceByArea(areas: Area[]) {
  return calcularCumplimientoPorArea(useTaskStore.getState().tasks, areas)
}

export function selectTaskDistributionByMonth() {
  return calcularTareasPorMes(useTaskStore.getState().tasks)
}
