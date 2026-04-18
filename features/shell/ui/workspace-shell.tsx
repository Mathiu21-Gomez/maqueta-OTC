'use client'

import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { useShellStore } from '@/features/shell/application/shell.store'

import { AppSidebar } from '@/features/shell/ui/app-sidebar'
import { NewTaskSheet } from '@/features/tasks/ui/new-task-sheet'
import { TaskStoreHydrator } from '@/features/tasks/ui/task-store-hydrator'
import { Topbar } from '@/features/shell/ui/topbar'

interface WorkspaceShellProps {
  children: ReactNode
}

export function WorkspaceShell({ children }: WorkspaceShellProps) {
  const nuevaTareaSheetOpen = useShellStore((state) => state.nuevaTareaSheetOpen)
  const setNuevaTareaSheetOpen = useShellStore((state) => state.setNuevaTareaSheetOpen)
  const reducedMotion = useReducedMotion()

  return (
    <SidebarProvider className="otc-shell-canvas">
      <TaskStoreHydrator />
      <a href="#main-content" className="otc-skip-link">
        Saltar al contenido principal
      </a>
      <AppSidebar />
      <SidebarInset className="otc-shell-frame min-h-svh overflow-hidden">
        <div className="otc-shell-content">
          <Topbar />
          <main id="main-content" className="otc-shell-main">
            <motion.section
              className="otc-route-stage p-3 sm:p-4 lg:p-5"
              data-motion="enter"
              initial={reducedMotion ? false : { opacity: 0, y: 10 }}
              animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
              transition={reducedMotion ? undefined : { duration: 0.24 }}
            >
              {children}
            </motion.section>
          </main>
        </div>
      </SidebarInset>
      <NewTaskSheet open={nuevaTareaSheetOpen} onOpenChange={setNuevaTareaSheetOpen} />
    </SidebarProvider>
  )
}
