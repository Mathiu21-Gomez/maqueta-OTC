"use client"

import type { ReactNode } from "react"

import { WorkspaceShell } from "@/features/shell/ui/workspace-shell"

export function AppLayout({ children }: { children: ReactNode }) {
  return <WorkspaceShell>{children}</WorkspaceShell>
}
