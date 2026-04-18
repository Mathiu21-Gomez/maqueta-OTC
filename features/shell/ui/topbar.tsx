'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Building2, Shield, User } from 'lucide-react'

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
import { getShellRouteMeta } from '@/features/shell/ui/shell-navigation'

export function Topbar() {
  const pathname = usePathname()
  const { breadcrumb, description, eyebrow, meta, title } = getShellRouteMeta(pathname)
  const rol = useSessionStore((state) => state.rol)
  const areaUsuario = useSessionStore((state) => state.areaUsuario)

  return (
    <header className="otc-shell-header">
      <div className="otc-shell-header-inner">
        <SidebarTrigger
          variant="outline"
          className="mt-1 size-10 rounded-xl border-border/70 bg-white/70 shadow-none hover:bg-white dark:bg-white/4 dark:hover:bg-white/8"
        />

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 flex-col gap-2">
              <span className="otc-shell-kicker">{eyebrow}</span>
              <div className="flex min-w-0 flex-col gap-1">
                <h1 className="otc-shell-title">{title}</h1>
                <p className="otc-shell-summary">{description}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-start justify-start gap-2 lg:max-w-[26rem] lg:justify-end">
              <span className="otc-shell-badge inline-flex min-h-9 items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium">
                {rol === 'Administrador' ? <Shield className="size-3.5" /> : <User className="size-3.5" />}
                {rol === 'Administrador' ? 'Administrador' : areaUsuario}
              </span>
              <span className="otc-shell-badge inline-flex min-h-9 items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium">
                <Building2 className="size-3.5" />
                Demo premium Fase 2
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <Breadcrumb>
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

            <div className="grid gap-2 sm:grid-cols-2 xl:flex">
              {meta.map((item) => (
                <div key={item.label} className="otc-shell-meta-card rounded-xl px-3 py-2.5">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
