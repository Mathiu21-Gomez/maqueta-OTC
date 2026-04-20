'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Shield, User } from 'lucide-react'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { useSessionStore } from '@/features/session/application/session.store'
import { CommandPaletteTrigger } from '@/features/shell/ui/command-palette'
import { NotificationBell } from '@/features/shell/ui/notification-bell'
import { getShellRouteMeta } from '@/features/shell/ui/shell-navigation'
import { ThemeToggle } from '@/features/shell/ui/theme-toggle'

export function Topbar() {
  const pathname = usePathname()
  const { breadcrumb } = getShellRouteMeta(pathname)
  const rol = useSessionStore((state) => state.rol)
  const areaUsuario = useSessionStore((state) => state.areaUsuario)

  return (
    <header className="otc-shell-header">
      <div className="otc-shell-header-inner">
        <SidebarTrigger
          variant="outline"
          className="size-9 rounded-xl border-border/70 bg-surface-translucent-strong shadow-none hover:bg-surface-translucent-hover"
        />

        <Breadcrumb className="min-w-0 flex-1">
          <BreadcrumbList className="text-xs text-muted-foreground">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">{breadcrumb[0]}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{breadcrumb[1]}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex shrink-0 items-center gap-2">
          <CommandPaletteTrigger />
          <span className="otc-shell-badge hidden items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium md:inline-flex">
            {rol === 'Administrador' ? <Shield className="size-3.5" aria-hidden="true" /> : <User className="size-3.5" aria-hidden="true" />}
            {rol === 'Administrador' ? 'Administrador' : areaUsuario}
          </span>
          <ThemeToggle />
          <NotificationBell />
        </div>
      </div>
    </header>
  )
}
