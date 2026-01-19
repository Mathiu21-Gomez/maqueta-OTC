"use client"

import { TaskProvider } from "@/lib/task-context"
import { AppLayout } from "@/components/app-layout"
import { Dashboard } from "@/components/dashboard"

export default function HomePage() {
  return (
    <TaskProvider>
      <AppLayout>
        <Dashboard />
      </AppLayout>
    </TaskProvider>
  )
}
