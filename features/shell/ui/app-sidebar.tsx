'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Building2, LogOut, Shield, User } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { useSessionStore } from '@/features/session/application/session.store'
import { AREAS } from '@/features/tasks/domain/task.constants'
import type { Area } from '@/features/tasks/domain/task.types'
import { navigationGroups, navigationItems } from '@/features/shell/ui/shell-navigation'

const labelMotion = {
  initial: { opacity: 0, x: -6 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -6 },
  transition: { duration: 0.18, ease: [0.4, 0, 0.2, 1] as const },
}

export function AppSidebar() {
  const pathname = usePathname()
  const rol = useSessionStore((state) => state.rol)
  const setRol = useSessionStore((state) => state.setRol)
  const areaUsuario = useSessionStore((state) => state.areaUsuario)
  const setAreaUsuario = useSessionStore((state) => state.setAreaUsuario)

  return (
    <Sidebar variant="inset" collapsible="icon" className="otc-sidebar">
      <SidebarHeader className="gap-2 border-b border-sidebar-border/70 p-2 group-data-[collapsible=icon]:p-1.5">
        <SidebarBrand />
      </SidebarHeader>

      <SidebarContent className="gap-0">
        {navigationGroups.map((group) => {
          const items = navigationItems.filter((item) => item.group === group)
          if (items.length === 0) return null
          return (
            <SidebarGroup key={group} className="gap-1.5 px-2 py-2.5">
              <SidebarGroupLabel className="px-2 text-[0.64rem] font-semibold uppercase tracking-[0.22em] text-sidebar-label">
                {group}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-1">
                  {items.map((item) => {
                    const isActive = pathname === item.url
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={item.title}
                          className="group/item h-10 rounded-lg border border-transparent px-2.5 transition-[background,border,color,box-shadow] duration-200 ease-out hover:bg-sidebar-accent/60 data-[active=true]:border-sidebar-border/80 data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground data-[active=true]:shadow-[0_8px_24px_rgba(0,58,142,0.18)]"
                        >
                          <Link href={item.url} aria-current={isActive ? 'page' : undefined}>
                            <item.icon className="shrink-0 transition-transform duration-200 ease-out group-hover/item:scale-110" aria-hidden="true" />
                            <SidebarLabel>
                              <span className="truncate text-sm font-medium">{item.title}</span>
                            </SidebarLabel>
                            <SidebarLabel className="ml-auto">
                              <kbd className="hidden items-center gap-0.5 rounded border border-sidebar-border/60 bg-sidebar-accent/40 px-1.5 py-0.5 text-[10px] font-medium text-sidebar-foreground/60 tabular-nums group-data-[active=true]/menu-button:border-transparent group-data-[active=true]/menu-button:bg-white/15 group-data-[active=true]/menu-button:text-sidebar-primary-foreground/80 sm:inline-flex">
                                {item.shortcut}
                              </kbd>
                            </SidebarLabel>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )
        })}
      </SidebarContent>

      <SidebarFooter className="gap-0 border-t border-sidebar-border/70 p-2">
        <AccountMenu
          rol={rol}
          areaUsuario={areaUsuario}
          setRol={setRol}
          setAreaUsuario={setAreaUsuario}
        />
      </SidebarFooter>
    </Sidebar>
  )
}

function SidebarBrand() {
  const { state } = useSidebar()
  const collapsed = state === 'collapsed'
  const reducedMotion = useReducedMotion()

  return (
    <Link
      href="/"
      aria-label="Ir al dashboard de OTC Boardroom"
      className="group/brand flex items-center gap-2.5 rounded-lg border border-sidebar-border/60 bg-surface-translucent px-2 py-2 shadow-[var(--shadow-sidebar)] transition-colors hover:bg-surface-translucent-hover group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
    >
      <motion.div
        layout={!reducedMotion}
        className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-white/80 dark:bg-white/90 ring-1 ring-sidebar-border/50"
      >
        <Image
          src="/logo-mark.svg"
          alt=""
          width={28}
          height={28}
          className="size-6 object-contain"
          priority
        />
      </motion.div>

      <AnimatePresence initial={false}>
        {!collapsed ? (
          <motion.div
            key="brand-wordmark"
            initial={reducedMotion ? false : { opacity: 0, x: -8 }}
            animate={reducedMotion ? undefined : { opacity: 1, x: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, x: -8 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="flex min-w-0 items-center"
          >
            <span className="truncate text-[1.05rem] leading-none font-semibold tracking-[-0.02em] text-sidebar-foreground">
              IngSimple
            </span>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </Link>
  )
}

function SidebarLabel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const { state } = useSidebar()
  const collapsed = state === 'collapsed'
  return (
    <AnimatePresence initial={false} mode="wait">
      {!collapsed ? (
        <motion.span
          key="label"
          {...labelMotion}
          className={`flex min-w-0 ${className}`}
        >
          {children}
        </motion.span>
      ) : null}
    </AnimatePresence>
  )
}

interface AccountMenuProps {
  rol: 'Administrador' | 'Usuario'
  areaUsuario: string
  setRol: (rol: 'Administrador' | 'Usuario') => void
  setAreaUsuario: (area: Area) => void
}

function AccountMenu({ rol, areaUsuario, setRol, setAreaUsuario }: AccountMenuProps) {
  const { state } = useSidebar()
  const collapsed = state === 'collapsed'
  const initials = rol === 'Administrador' ? 'AD' : (areaUsuario?.slice(0, 2).toUpperCase() ?? 'OP')
  const displayName = rol === 'Administrador' ? 'Admin' : areaUsuario
  const email = rol === 'Administrador' ? 'admin@otc360.com' : `${areaUsuario.toLowerCase()}@otc360.com`

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Abrir menú de cuenta"
          title={collapsed ? `${displayName} — ${email}` : undefined}
          className="flex w-full items-center gap-2.5 rounded-lg border border-sidebar-border/60 bg-sidebar-accent/40 p-2 text-left transition-colors hover:bg-sidebar-accent/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-1"
        >
          <Avatar className="size-8 rounded-md shrink-0">
            <AvatarFallback className="rounded-md bg-sidebar-primary text-sidebar-primary-foreground text-[11px] font-semibold tracking-wide">
              {initials}
            </AvatarFallback>
          </Avatar>
          <AnimatePresence initial={false}>
            {!collapsed ? (
              <motion.div
                key="account-body"
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.18 }}
                className="flex min-w-0 flex-1 items-center gap-2"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate text-sm font-medium text-sidebar-foreground">
                    {displayName}
                  </span>
                  <span className="truncate text-[11px] text-sidebar-foreground/70">
                    {email}
                  </span>
                </div>
                <LogOut className="size-4 text-sidebar-foreground/60" aria-hidden="true" />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        side={collapsed ? 'right' : 'top'}
        className="w-64 rounded-xl border-border/70 bg-popover/96 p-2 shadow-[var(--shadow-overlay)]"
      >
        <DropdownMenuLabel>Cambiar rol</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => setRol('Administrador')}>
            <Shield />
            Administrador
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setRol('Usuario')}>
            <User />
            Usuario de área
          </DropdownMenuItem>
        </DropdownMenuGroup>
        {rol === 'Usuario' ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Seleccionar área</DropdownMenuLabel>
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
  )
}
