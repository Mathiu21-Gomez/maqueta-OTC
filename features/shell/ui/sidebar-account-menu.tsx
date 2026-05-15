'use client'

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
import { useSidebar } from '@/components/ui/sidebar'
import { AREAS } from '@/features/tasks/domain/task.constants'
import type { Area } from '@/features/tasks/domain/task.types'

interface SidebarAccountMenuProps {
  rol: 'Administrador' | 'Usuario'
  area: string
  onRolChange: (rol: 'Administrador' | 'Usuario') => void
  onAreaChange: (area: Area) => void
}

/**
 * Presentacional: menú de cuenta + switch de rol/área (lógica de maqueta).
 * No accede al store de sesión — recibe estado y callbacks por props.
 * Sí usa useSidebar(): es el contexto de UI del propio sidebar
 * (colapsado/expandido), no estado de dominio.
 */
export function SidebarAccountMenu({
  rol,
  area,
  onRolChange,
  onAreaChange,
}: SidebarAccountMenuProps) {
  const { state } = useSidebar()
  const collapsed = state === 'collapsed'
  const initials = rol === 'Administrador' ? 'AD' : (area?.slice(0, 2).toUpperCase() ?? 'OP')
  const displayName = rol === 'Administrador' ? 'Admin' : area
  const email = rol === 'Administrador' ? 'admin@otc360.com' : `${area.toLowerCase()}@otc360.com`

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
          <div className="flex min-w-0 flex-1 items-center gap-2 group-data-[collapsible=icon]:hidden">
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="truncate text-sm font-medium text-sidebar-foreground">
                {displayName}
              </span>
              <span className="truncate text-[11px] text-sidebar-foreground/70">
                {email}
              </span>
            </div>
            <LogOut className="size-4 text-sidebar-foreground/60" aria-hidden="true" />
          </div>
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
          <DropdownMenuItem onClick={() => onRolChange('Administrador')}>
            <Shield />
            Administrador
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onRolChange('Usuario')}>
            <User />
            Usuario de área
          </DropdownMenuItem>
        </DropdownMenuGroup>
        {rol === 'Usuario' ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Seleccionar área</DropdownMenuLabel>
            <DropdownMenuGroup>
              {AREAS.map((areaOption) => (
                <DropdownMenuItem key={areaOption} onClick={() => onAreaChange(areaOption)}>
                  <Building2 />
                  {areaOption}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
