"use client"

import { TaskProvider } from "@/lib/task-context"
import { AppLayout } from "@/components/app-layout"
import { TareasLista } from "@/components/tareas-lista"

export default function TareasPage() {
  return (
    <TaskProvider>
      <AppLayout>
        <TareasLista />
      </AppLayout>
    </TaskProvider>
  )
}
