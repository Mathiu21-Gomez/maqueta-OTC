export type EstadoTarea = 'Planificado' | 'En curso' | 'Finalizado' | 'Atrasado'
export type Prioridad = 'Alta' | 'Media' | 'Baja'

export type Area =
  | 'Seguridad'
  | 'Comunidades'
  | 'Legal'
  | 'Mantenimiento'
  | 'Medio Ambiente'
  | 'Operaciones'
  | 'Calidad'
  | 'Compras'

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
  tipo: 'atrasada' | 'porVencer' | 'completada'
  mensaje: string
  tareaId: string
  prioridad: 'alta' | 'media' | 'baja'
  leida: boolean
}

export type RolUsuario = 'Administrador' | 'Usuario'

export type CreateTaskInput = Omit<Tarea, 'id' | 'avanceTotal' | 'estado'>
export type UpdateTaskInput = Partial<Omit<Tarea, 'id' | 'fechaCreacion' | 'creadoPor'>>
