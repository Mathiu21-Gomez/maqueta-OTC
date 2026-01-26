"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ListTodo,
  User,
  Shield,
  Building2,
  LogOut,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { useTaskContext } from "@/lib/task-context"
import { AREAS } from "@/lib/types"
import { NuevaTareaSheet } from "@/components/nueva-tarea-sheet"
import type { ReactNode } from "react"

const navigationItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Tareas", url: "/tareas", icon: ListTodo },
  { title: "Mis Tareas", url: "/mis-tareas", icon: User },
]

function AppSidebar() {
  const pathname = usePathname()
  const { rol, setRol, areaUsuario, setAreaUsuario } = useTaskContext()

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-3 px-3 py-4">
          <img src="/logo.svg" alt="OTC Logo" className="h-10 w-10 object-contain" />
          <div className="flex flex-col gap-0.5">
            <span className="text-lg font-bold text-[#111827] tracking-tight leading-tight">OTC</span>
            <span className="text-[13px] font-medium text-[#6B7280] leading-tight">360 ERP</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-[#9CA3AF] font-semibold">Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-lg p-3 text-left transition-all duration-150 hover:bg-sidebar-accent">
              {/* Avatar */}
              <img
                src="/3e41d0768d4fe9bd835fad6807f1e431ac41a63a0afab7bddd62fe732c5e79d3._SX1080_FMjpg_.jpg"
                alt="Avatar"
                className="h-9 w-9 rounded-lg object-cover"
              />
              {/* Info */}
              <div className="flex flex-1 flex-col min-w-0">
                <span className="text-sm font-medium text-[#111827] truncate">
                  {rol === "Administrador" ? "Admin" : areaUsuario}
                </span>
                <span className="text-xs text-[#6B7280] truncate">
                  {rol === "Administrador" ? "admin@otc360.com" : `${areaUsuario.toLowerCase()}@otc360.com`}
                </span>
              </div>
              {/* Logout icon */}
              <LogOut className="h-4 w-4 shrink-0 text-[#6B7280]" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="w-56">
            <DropdownMenuLabel>Cambiar Rol</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setRol("Administrador")}>
              <Shield className="mr-2 h-4 w-4" />
              Administrador
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setRol("Usuario")}>
              <User className="mr-2 h-4 w-4" />
              Usuario de Área
            </DropdownMenuItem>
            {rol === "Usuario" && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Seleccionar Área</DropdownMenuLabel>
                {AREAS.map((area) => (
                  <DropdownMenuItem key={area} onClick={() => setAreaUsuario(area)}>
                    <Building2 className="mr-2 h-4 w-4" />
                    {area}
                  </DropdownMenuItem>
                ))}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

export function AppLayout({ children }: { children: ReactNode }) {
  const { rol, areaUsuario, nuevaTareaSheetOpen, setNuevaTareaSheetOpen } = useTaskContext()

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-12 items-center gap-4 border-b border-border bg-background px-4">
          <SidebarTrigger
            variant="default"
            className="-ml-1 h-8 w-8 shrink-0 rounded-md bg-violet-600 text-white hover:bg-violet-700 hover:text-white focus:bg-violet-700 focus:text-white [&_svg]:size-4"
          />
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">{children}</main>
      </SidebarInset>
      
      {/* Nueva Tarea Sheet - Disponible en todas las páginas */}
      <NuevaTareaSheet 
        open={nuevaTareaSheetOpen} 
        onOpenChange={setNuevaTareaSheetOpen} 
      />
    </SidebarProvider>
  )
}
