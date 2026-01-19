"use client"

import { TaskProvider } from "@/lib/task-context"
import { AppLayout } from "@/components/app-layout"
import { MisTareas } from "@/components/mis-tareas"

export default function MisTareasPage() {
  return (
    <TaskProvider>
      <AppLayout>
        <MisTareas />
      </AppLayout>
    </TaskProvider>
  )
}
