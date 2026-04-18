import type { ReactNode } from 'react'

import { WorkspaceShell } from '@/features/shell/ui/workspace-shell'

interface WorkspaceLayoutProps {
  children: ReactNode
}

export default function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
  return <WorkspaceShell>{children}</WorkspaceShell>
}
