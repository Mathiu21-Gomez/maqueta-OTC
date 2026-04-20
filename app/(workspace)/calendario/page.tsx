import type { Metadata } from 'next'

import { TaskCalendar } from '@/features/calendar/ui/task-calendar'

export const metadata: Metadata = {
  title: 'Calendario',
  description: 'Inicios, entregas y vencimientos del mes por área.',
}

export default function CalendarioPage() {
  return <TaskCalendar />
}
