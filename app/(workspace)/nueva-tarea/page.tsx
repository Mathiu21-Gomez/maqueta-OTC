import type { Metadata } from 'next'

import { NewTaskRoute } from '@/features/tasks/ui/new-task-route'

export const metadata: Metadata = {
  title: 'Nueva tarea',
  description: 'Carga estructurada para alta de una nueva iniciativa.',
}

export default function NuevaTareaPage() {
  return <NewTaskRoute />
}
