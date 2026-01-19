"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ListTodo,
  PlusCircle,
  User,
  Bell,
  Users,
  ChevronDown,
  Shield,
  Building2,
  Settings,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import type { ReactNode } from "react"

const navigationItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Tareas", url: "/tareas", icon: ListTodo },
  { title: "Mis Tareas", url: "/mis-tareas", icon: User },
  { title: "Colaborativas", url: "/colaborativas", icon: Users },
  { title: "Nueva Tarea", url: "/nueva-tarea", icon: PlusCircle },
]

function AppSidebar() {
  const pathname = usePathname()
  const { rol, setRol, areaUsuario, setAreaUsuario } = useTaskContext()

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/" className="flex items-center gap-2 px-2 py-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            OTI
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-sidebar-foreground">OTI</span>
            <span className="text-[10px] text-sidebar-foreground/70">Gestión Operacional</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
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

      <SidebarFooter>
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel>Simulación de Rol</SidebarGroupLabel>
          <SidebarGroupContent className="space-y-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between bg-sidebar hover:bg-sidebar-accent">
                  <span className="flex items-center gap-2">
                    {rol === "Administrador" ? (
                      <Shield className="h-4 w-4" />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                    <span className="truncate">{rol}</span>
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
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
              </DropdownMenuContent>
            </DropdownMenu>

            {rol === "Usuario" && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between bg-sidebar hover:bg-sidebar-accent">
                    <span className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      <span className="truncate">{areaUsuario}</span>
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuLabel>Seleccionar Área</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {AREAS.map((area) => (
                    <DropdownMenuItem key={area} onClick={() => setAreaUsuario(area)}>
                      {area}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  )
}

export function AppLayout({ children }: { children: ReactNode }) {
  const { rol, areaUsuario, notificaciones } = useTaskContext()

  const notificacionesNoLeidas = notificaciones.filter((n) => !n.leida).length

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-background px-4">
          <SidebarTrigger className="-ml-1" />

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {notificacionesNoLeidas > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] bg-destructive text-destructive-foreground">
                      {notificacionesNoLeidas}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notificaciones.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No hay notificaciones
                  </div>
                ) : (
                  notificaciones.slice(0, 5).map((notif) => (
                    <DropdownMenuItem key={notif.id} className="flex flex-col items-start gap-1 p-3">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={notif.tipo === "atrasada" ? "destructive" : "secondary"}
                          className="text-[10px]"
                        >
                          {notif.tipo === "atrasada" ? "Atrasada" : "Por vencer"}
                        </Badge>
                        {!notif.leida && (
                          <span className="h-2 w-2 rounded-full bg-primary" />
                        )}
                      </div>
                      <span className="text-sm text-foreground line-clamp-2">{notif.mensaje}</span>
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User */}
            <div className="flex items-center gap-2 pl-2 border-l border-border">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
                {rol === "Administrador" ? "AD" : areaUsuario.slice(0, 2).toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-foreground">
                  {rol === "Administrador" ? "Administrador" : `Usuario ${areaUsuario}`}
                </p>
                <p className="text-xs text-muted-foreground">{rol}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
