'use client'

import Link from 'next/link'

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { navigationGroups, navigationItems } from '@/features/shell/ui/shell-navigation'

interface SidebarNavProps {
  /** URL de la ruta activa. El container la inyecta vía usePathname. */
  activeUrl: string
}

/**
 * Presentacional puro: render de los grupos/items de navegación.
 * No conoce el router — recibe `activeUrl` por props, así se puede
 * testear con cualquier valor sin montar Next.
 */
export function SidebarNav({ activeUrl }: SidebarNavProps) {
  return (
    <>
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
                  const isActive = activeUrl === item.url
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.title}
                        className="group/item h-10 rounded-lg border border-transparent px-2.5 transition-colors duration-150 ease-out hover:bg-sidebar-accent/60 data-[active=true]:border-sidebar-border/80 data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground data-[active=true]:shadow-[0_8px_24px_rgba(0,58,142,0.18)]"
                      >
                        <Link href={item.url} aria-current={isActive ? 'page' : undefined}>
                          <item.icon className="shrink-0" aria-hidden="true" />
                          <span className="truncate text-sm font-medium">{item.title}</span>
                          <kbd className="ml-auto hidden items-center gap-0.5 rounded border border-sidebar-border/60 bg-sidebar-accent/40 px-1.5 py-0.5 text-[10px] font-medium text-sidebar-foreground/60 tabular-nums group-data-[active=true]/menu-button:border-transparent group-data-[active=true]/menu-button:bg-white/15 group-data-[active=true]/menu-button:text-sidebar-primary-foreground/80 group-data-[collapsible=icon]:hidden sm:inline-flex">
                            {item.shortcut}
                          </kbd>
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
    </>
  )
}
