import type { LucideIcon } from 'lucide-react'
import { Building2, CalendarDays, LayoutDashboard, ListTodo, PlusSquare, User } from 'lucide-react'

export type ShellNavigationGroup = 'Operación' | 'Crear'

export interface ShellNavigationItem {
  title: string
  url: string
  icon: LucideIcon
  section: string
  summary: string
  group: ShellNavigationGroup
  shortcut: string
}

export interface ShellRouteMeta {
  eyebrow: string
  title: string
  description: string
  breadcrumb: [string, string]
  meta: Array<{
    label: string
    value: string
  }>
}

export const navigationItems: ShellNavigationItem[] = [
  {
    title: 'Dashboard',
    url: '/',
    icon: LayoutDashboard,
    section: 'Panorama',
    summary: 'Estado general de cartera y vencimientos.',
    group: 'Operación',
    shortcut: 'G D',
  },
  {
    title: 'Tareas',
    url: '/tareas',
    icon: ListTodo,
    section: 'Backlog',
    summary: 'Listado, filtros y detalle operativo.',
    group: 'Operación',
    shortcut: 'G T',
  },
  {
    title: 'Calendario',
    url: '/calendario',
    icon: CalendarDays,
    section: 'Agenda',
    summary: 'Inicios, entregas y vencimientos por mes.',
    group: 'Operación',
    shortcut: 'G C',
  },
  {
    title: 'Mis tareas',
    url: '/mis-tareas',
    icon: User,
    section: 'Personal',
    summary: 'Compromisos asignados y próximos vencimientos.',
    group: 'Operación',
    shortcut: 'G M',
  },
  {
    title: 'Colaborativas',
    url: '/colaborativas',
    icon: Building2,
    section: 'Transversal',
    summary: 'Tareas con múltiples áreas involucradas.',
    group: 'Operación',
    shortcut: 'G X',
  },
  {
    title: 'Nueva tarea',
    url: '/nueva-tarea',
    icon: PlusSquare,
    section: 'Crear',
    summary: 'Alta estructurada de una nueva iniciativa.',
    group: 'Crear',
    shortcut: 'N',
  },
]

export const navigationGroups: ShellNavigationGroup[] = ['Operación', 'Crear']

const routeMetaByPath: Record<string, ShellRouteMeta> = {
  '/': {
    eyebrow: 'Panorama',
    title: 'Dashboard operacional',
    description: 'Estado de cartera, ritmo de ejecución y focos del período.',
    breadcrumb: ['Workspace', 'Dashboard'],
    meta: [
      { label: 'Vista', value: 'Portafolio' },
      { label: 'Cadencia', value: 'Semanal' },
    ],
  },
  '/tareas': {
    eyebrow: 'Backlog',
    title: 'Lista de tareas',
    description: 'Backlog operativo con filtros por área, estado y prioridad.',
    breadcrumb: ['Workspace', 'Tareas'],
    meta: [
      { label: 'Modo', value: 'Analítico' },
      { label: 'Foco', value: 'Entrega' },
    ],
  },
  '/calendario': {
    eyebrow: 'Agenda',
    title: 'Calendario operacional',
    description: 'Inicios, entregas y vencimientos del mes por área.',
    breadcrumb: ['Workspace', 'Calendario'],
    meta: [
      { label: 'Vista', value: 'Mes' },
      { label: 'Cadencia', value: 'Semanal' },
    ],
  },
  '/mis-tareas': {
    eyebrow: 'Personal',
    title: 'Mis tareas',
    description: 'Compromisos asignados y riesgos por vencer.',
    breadcrumb: ['Workspace', 'Mis tareas'],
    meta: [
      { label: 'Prioridad', value: 'Owner' },
      { label: 'Vista', value: 'Personal' },
    ],
  },
  '/colaborativas': {
    eyebrow: 'Transversal',
    title: 'Tareas colaborativas',
    description: 'Seguimiento inter-área para iniciativas con múltiples frentes.',
    breadcrumb: ['Workspace', 'Colaborativas'],
    meta: [
      { label: 'Matriz', value: 'Multi-área' },
      { label: 'Vista', value: 'Compartida' },
    ],
  },
  '/nueva-tarea': {
    eyebrow: 'Crear',
    title: 'Nueva tarea',
    description: 'Carga estructurada para alta de una nueva iniciativa.',
    breadcrumb: ['Workspace', 'Nueva tarea'],
    meta: [
      { label: 'Modo', value: 'Creación' },
      { label: 'Formato', value: 'Guiado' },
    ],
  },
}

export function getShellRouteMeta(pathname: string): ShellRouteMeta {
  return routeMetaByPath[pathname] ?? routeMetaByPath['/']
}
