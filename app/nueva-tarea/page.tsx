"use client"

import { TaskProvider } from "@/lib/task-context"
import { AppLayout } from "@/components/app-layout"
import { NuevaTareaForm } from "@/components/nueva-tarea-form"

export default function NuevaTareaPage() {
  return (
    <TaskProvider>
      <AppLayout>
        <NuevaTareaForm />
      </AppLayout>
    </TaskProvider>
  )
}
