import type { Metadata } from 'next'

import { CollaborativeTasksPage } from '@/features/tasks/ui/collaborative-tasks-page'

export const metadata: Metadata = {
  title: 'Colaborativas',
  description: 'Seguimiento inter-área para iniciativas con múltiples frentes.',
}

export default function ColaborativasPage() {
  return <CollaborativeTasksPage />
}
