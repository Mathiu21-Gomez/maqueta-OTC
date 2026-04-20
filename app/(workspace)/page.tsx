import type { Metadata } from 'next'

import { DashboardPage } from '@/features/dashboard/ui/dashboard-page'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Estado de cartera, ritmo de ejecución y focos del período.',
}

export default function HomePage() {
  return <DashboardPage />
}
