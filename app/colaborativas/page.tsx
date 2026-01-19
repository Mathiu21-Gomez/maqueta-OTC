"use client"

import { TaskProvider } from "@/lib/task-context"
import { AppLayout } from "@/components/app-layout"
import { TareasColaborativas } from "@/components/tareas-colaborativas"

export default function ColaborativasPage() {
  return (
    <TaskProvider>
      <AppLayout>
        <TareasColaborativas />
      </AppLayout>
    </TaskProvider>
  )
}
