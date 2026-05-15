'use client'

import { usePathname } from 'next/navigation'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from '@/components/ui/sidebar'
import { useSessionStore } from '@/features/session/application/session.store'
import { SidebarAccountMenu } from '@/features/shell/ui/sidebar-account-menu'
import { SidebarBrand } from '@/features/shell/ui/sidebar-brand'
import { SidebarNav } from '@/features/shell/ui/sidebar-nav'

/**
 * Container del sidebar: única pieza que conoce el router y el store de
 * sesión. Conecta el estado y lo baja como props a presentacionales puros
 * (SidebarBrand / SidebarNav / SidebarAccountMenu). Esa frontera es lo
 * que mantiene los hijos testeables en aislamiento.
 */
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
        <SidebarNav activeUrl={pathname} />
      </SidebarContent>

      <SidebarFooter className="gap-0 border-t border-sidebar-border/70 p-2">
        <SidebarAccountMenu
          rol={rol}
          area={areaUsuario}
          onRolChange={setRol}
          onAreaChange={setAreaUsuario}
        />
      </SidebarFooter>
    </Sidebar>
  )
}
