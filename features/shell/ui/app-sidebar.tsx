'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Building2, ChevronRight, LogOut, Shield, User } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarSeparator,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { useSessionStore } from '@/features/session/application/session.store'
import { AREAS } from '@/features/tasks/domain/task.constants'
import { navigationItems } from '@/features/shell/ui/shell-navigation'

export function AppSidebar() {
  const pathname = usePathname()
  const rol = useSessionStore((state) => state.rol)
  const setRol = useSessionStore((state) => state.setRol)
  const areaUsuario = useSessionStore((state) => state.areaUsuario)
  const setAreaUsuario = useSessionStore((state) => state.setAreaUsuario)

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader className="gap-4 border-b border-sidebar-border/80 px-3 py-4">
        <Link href="/" className="rounded-xl border border-sidebar-border/70 bg-white/55 p-3 shadow-[var(--shadow-sidebar)] transition-colors hover:bg-white/70 dark:bg-white/4 dark:hover:bg-white/8">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl border border-sidebar-border/70 bg-sidebar-accent/80">
              <Image src="/logo.svg" alt="OTC Logo" width={30} height={30} className="size-7 object-contain" />
            </div>
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="truncate text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-sidebar-label">
                Oleoducto Trasandino
              </span>
              <span className="truncate text-[1.35rem] leading-none font-semibold tracking-[-0.04em] text-sidebar-foreground">
                OTC Boardroom
              </span>
              <span className="truncate text-[12px] text-sidebar-foreground/70">Demo premium de gestion operacional</span>
            </div>
          </div>
        </Link>

        <div className="rounded-xl border border-sidebar-border/70 bg-sidebar-accent/55 px-3 py-3">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-sidebar-label">Contexto activo</p>
          <div className="mt-2 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-sidebar-foreground">{rol}</p>
              <p className="text-xs text-sidebar-foreground/70">{rol === 'Administrador' ? 'Cobertura total del demo' : areaUsuario}</p>
            </div>
            <span className="rounded-full border border-sidebar-border/80 bg-sidebar-badge-bg px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-sidebar-badge-text">
              Fase 2
            </span>
          </div>
          <p className="mt-2 text-xs leading-5 text-sidebar-foreground/68">
            Shell editorial con lectura ejecutiva, foco en jerarquia y continuidad visual.
          </p>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="gap-3 px-3 py-4">
          <SidebarGroupLabel className="px-0 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-sidebar-label">
            Navegacion ejecutiva
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    className="h-auto rounded-xl border border-transparent px-3 py-3 data-[active=true]:border-sidebar-border/80 data-[active=true]:bg-sidebar-primary data-[active=true]:shadow-[0_10px_30px_rgba(20,24,29,0.12)] data-[active=true]:text-sidebar-primary-foreground"
                  >
                    <Link href={item.url}>
                      <item.icon className="mt-0.5" />
                      <span className="flex min-w-0 flex-1 flex-col gap-1">
                        <span className="truncate text-sm font-medium">{item.title}</span>
                        <span className="truncate text-[11px] font-normal tracking-[0.02em] text-current/72">
                          {item.section}
                        </span>
                      </span>
                      <ChevronRight className="size-3.5 opacity-45" />
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="mx-3" />

        <SidebarGroup className="px-3 py-4">
          <SidebarGroupLabel className="px-0 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-sidebar-label">
            Lectura del entorno
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="rounded-xl border border-sidebar-border/70 bg-sidebar-accent/45 px-3 py-3">
              <p className="text-sm font-medium text-sidebar-foreground">Prioridad del dia</p>
              <p className="mt-1 text-xs leading-5 text-sidebar-foreground/70">
                Revisar desviaciones, confirmar ownership y sostener una narrativa clara antes de entrar al detalle.
              </p>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="gap-3 border-t border-sidebar-border/80 px-3 py-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-xl border border-sidebar-border/70 bg-sidebar-accent/45 p-3 text-left transition-colors hover:bg-sidebar-accent/70 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sidebar-ring">
              <Image
                src="/placeholder-user.jpg"
                alt="Avatar"
                width={36}
                height={36}
                className="size-10 rounded-xl object-cover"
              />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate text-sm font-medium text-sidebar-foreground">
                  {rol === 'Administrador' ? 'Admin' : areaUsuario}
                </span>
                <span className="truncate text-xs text-sidebar-foreground/70">
                  {rol === 'Administrador' ? 'admin@otc360.com' : `${areaUsuario.toLowerCase()}@otc360.com`}
                </span>
              </div>
              <LogOut className="text-sidebar-foreground/60" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="w-64 rounded-xl border-border/70 bg-popover/96 p-2 shadow-[var(--shadow-overlay)]">
            <DropdownMenuLabel>Cambiar rol</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => setRol('Administrador')}>
                <Shield />
                Administrador
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRol('Usuario')}>
                <User />
                Usuario de area
              </DropdownMenuItem>
            </DropdownMenuGroup>
            {rol === 'Usuario' ? (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Seleccionar area</DropdownMenuLabel>
                <DropdownMenuGroup>
                  {AREAS.map((area) => (
                    <DropdownMenuItem key={area} onClick={() => setAreaUsuario(area)}>
                      <Building2 />
                      {area}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
