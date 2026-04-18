import type { LucideIcon } from 'lucide-react'
import { Building2, LayoutDashboard, ListTodo, PlusSquare, User } from 'lucide-react'

export interface ShellNavigationItem {
  title: string
  url: string
  icon: LucideIcon
  section: string
  summary: string
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
    section: 'Control central',
    summary: 'Panorama general de avance, vencimientos y carga operacional.',
  },
  {
    title: 'Tareas',
    url: '/tareas',
    icon: ListTodo,
    section: 'Operacion diaria',
    summary: 'Seguimiento de backlog, filtros y detalle operativo.',
  },
  {
    title: 'Mis tareas',
    url: '/mis-tareas',
    icon: User,
    section: 'Ownership',
    summary: 'Prioridades personales, colaboracion y compromisos vigentes.',
  },
  {
    title: 'Colaborativas',
    url: '/colaborativas',
    icon: Building2,
    section: 'Coordinacion',
    summary: 'Trabajo transversal entre areas y dependencias compartidas.',
  },
  {
    title: 'Nueva tarea',
    url: '/nueva-tarea',
    icon: PlusSquare,
    section: 'Planeamiento',
    summary: 'Carga guiada para nuevas iniciativas dentro del demo.',
  },
]

const routeMetaByPath: Record<string, ShellRouteMeta> = {
  '/': {
    eyebrow: 'Resumen ejecutivo',
    title: 'Dashboard operacional',
    description: 'Lectura rapida de cartera, ritmo de ejecucion y focos inmediatos.',
    breadcrumb: ['Workspace', 'Dashboard'],
    meta: [
      { label: 'Vista', value: 'Portafolio' },
      { label: 'Cadencia', value: 'Semanal' },
    ],
  },
  '/tareas': {
    eyebrow: 'Supervision activa',
    title: 'Lista de tareas',
    description: 'Backlog operativo con filtros, prioridad y trazabilidad visible.',
    breadcrumb: ['Workspace', 'Tareas'],
    meta: [
      { label: 'Modo', value: 'Analitico' },
      { label: 'Foco', value: 'Entrega' },
    ],
  },
  '/mis-tareas': {
    eyebrow: 'Ownership por area',
    title: 'Mis tareas',
    description: 'Compromisos asignados, colaboracion y riesgos cercanos por vencer.',
    breadcrumb: ['Workspace', 'Mis tareas'],
    meta: [
      { label: 'Prioridad', value: 'Owner' },
      { label: 'Lectura', value: 'Personal' },
    ],
  },
  '/colaborativas': {
    eyebrow: 'Coordinacion transversal',
    title: 'Tareas colaborativas',
    description: 'Seguimiento inter-area para tareas con multiples frentes operativos.',
    breadcrumb: ['Workspace', 'Colaborativas'],
    meta: [
      { label: 'Matriz', value: 'Multi-area' },
      { label: 'Lectura', value: 'Shared' },
    ],
  },
  '/nueva-tarea': {
    eyebrow: 'Planeamiento guiado',
    title: 'Nueva tarea',
    description: 'Carga estructurada para alta de iniciativas dentro del entorno demo.',
    breadcrumb: ['Workspace', 'Nueva tarea'],
    meta: [
      { label: 'Modo', value: 'Creacion' },
      { label: 'Formato', value: 'Guiado' },
    ],
  },
}

export function getShellRouteMeta(pathname: string): ShellRouteMeta {
  return routeMetaByPath[pathname] ?? routeMetaByPath['/']
}
