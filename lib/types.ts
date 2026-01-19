export type EstadoTarea = "Planificado" | "En curso" | "Finalizado" | "Atrasado"
export type Prioridad = "Alta" | "Media" | "Baja"

export type Area =
  | "Seguridad"
  | "Comunidades"
  | "Legal"
  | "Mantenimiento"
  | "Medio Ambiente"
  | "Operaciones"
  | "Calidad"
  | "Compras"

export interface Actividad {
  id: string
  nombre: string
  porcentaje: number
  completada: boolean
}

export interface Documento {
  nombre: string
  url: string
}

export interface Tarea {
  id: string
  nombre: string
  descripcion: string
  areas: Area[]
  estado: EstadoTarea
  fechaInicio: string
  fechaFin: string
  diasEjecutar: number
  prioridad: Prioridad
  requiereApoyo: boolean
  areasApoyo: Area[]
  documentos: Documento[]
  actividades: Actividad[]
  avanceTotal: number
  creadoPor: string
  fechaCreacion: string
}

export interface Notificacion {
  id: string
  tipo: "atrasada" | "porVencer" | "completada"
  mensaje: string
  tareaId: string
  prioridad: "alta" | "media" | "baja"
  leida: boolean
}

export type RolUsuario = "Administrador" | "Usuario"

export const AREAS: Area[] = [
  "Seguridad",
  "Comunidades",
  "Legal",
  "Mantenimiento",
  "Medio Ambiente",
  "Operaciones",
  "Calidad",
  "Compras",
]

export const ESTADOS: EstadoTarea[] = ["Planificado", "En curso", "Finalizado", "Atrasado"]
export const PRIORIDADES: Prioridad[] = ["Alta", "Media", "Baja"]
export const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
]
