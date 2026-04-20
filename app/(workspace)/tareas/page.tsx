import type { Metadata } from 'next'

import { TaskListPage } from '@/features/tasks/ui/task-list-page'

export const metadata: Metadata = {
  title: 'Tareas',
  description: 'Backlog operativo con filtros por área, estado y prioridad.',
}

export default function TareasPage() {
  return <TaskListPage />
}
