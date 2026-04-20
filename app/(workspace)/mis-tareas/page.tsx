import type { Metadata } from 'next'

import { MyTasksPage } from '@/features/tasks/ui/my-tasks-page'

export const metadata: Metadata = {
  title: 'Mis tareas',
  description: 'Compromisos asignados y riesgos por vencer.',
}

export default function MisTareasPage() {
  return <MyTasksPage />
}
