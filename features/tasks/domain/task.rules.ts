import type {
  Actividad,
  Area,
  CreateTaskInput,
  EstadoTarea,
  Notificacion,
  RolUsuario,
  Tarea,
} from '@/features/tasks/domain/task.types'

interface CreateTaskContext {
  areaUsuario: Area
  now?: Date
  rol: RolUsuario
}

export function calcularEstado(tarea: Pick<Tarea, 'avanceTotal' | 'fechaInicio' | 'fechaFin'>): EstadoTarea {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  const inicio = new Date(tarea.fechaInicio)
  const fin = new Date(tarea.fechaFin)

  if (tarea.avanceTotal === 100) return 'Finalizado'
  if (hoy < inicio) return 'Planificado'
  if (hoy > fin && tarea.avanceTotal < 100) return 'Atrasado'
  return 'En curso'
}

export function calcularAvance(actividades: Actividad[]): number {
  if (actividades.length === 0) return 0

  const suma = actividades.reduce((acc, actividad) => acc + actividad.porcentaje, 0)
  return Math.round(suma / actividades.length)
}

export function normalizarTarea(tarea: Tarea): Tarea {
  const avanceTotal = calcularAvance(tarea.actividades)

  return {
    ...tarea,
    avanceTotal,
    estado: calcularEstado({
      avanceTotal,
      fechaInicio: tarea.fechaInicio,
      fechaFin: tarea.fechaFin,
    }),
  }
}

export function buildCreateTaskInput(
  input: Omit<CreateTaskInput, 'creadoPor' | 'fechaCreacion'>,
  context: CreateTaskContext,
): CreateTaskInput {
  const now = context.now ?? new Date()

  return {
    ...input,
    creadoPor: context.rol === 'Administrador' ? 'Admin' : context.areaUsuario,
    fechaCreacion: now.toISOString().split('T')[0] ?? '',
  }
}

export function diasRestantes(fechaFin: string): number {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  const fin = new Date(fechaFin)
  const diff = Math.ceil((fin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))

  return diff
}

export function generarNotificaciones(tareas: Tarea[]): Notificacion[] {
  const notificaciones: Notificacion[] = []

  tareas.forEach((tarea) => {
    const dias = diasRestantes(tarea.fechaFin)
    const estado = calcularEstado(tarea)

    if (estado === 'Atrasado') {
      notificaciones.push({
        id: `notif-${tarea.id}-atrasada`,
        tipo: 'atrasada',
        mensaje: `"${tarea.nombre}" esta atrasada por ${Math.abs(dias)} dias`,
        tareaId: tarea.id,
        prioridad: 'alta',
        leida: false,
      })
    }

    if (dias > 0 && dias <= 7 && estado === 'En curso') {
      notificaciones.push({
        id: `notif-${tarea.id}-vencer`,
        tipo: 'porVencer',
        mensaje: `"${tarea.nombre}" vence en ${dias} dias`,
        tareaId: tarea.id,
        prioridad: 'media',
        leida: false,
      })
    }
  })

  const prioridadOrden = { alta: 0, media: 1, baja: 2 }

  return notificaciones.sort((a, b) => prioridadOrden[a.prioridad] - prioridadOrden[b.prioridad])
}

export function formatearFecha(fecha: string): string {
  return new Date(fecha).toLocaleDateString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function getMesFromFecha(fecha: string): number {
  return new Date(fecha).getMonth()
}

export function calcularKPIs(tareas: Tarea[]) {
  const total = tareas.length
  const pendientes = tareas.filter((tarea) => calcularEstado(tarea) !== 'Finalizado').length
  const avanceGeneral = total > 0 ? Math.round(tareas.reduce((acc, tarea) => acc + tarea.avanceTotal, 0) / total) : 0
  const diasPromedio = total > 0 ? Math.round(tareas.reduce((acc, tarea) => acc + tarea.diasEjecutar, 0) / total) : 0

  const porEstado = {
    Planificado: tareas.filter((tarea) => calcularEstado(tarea) === 'Planificado').length,
    'En curso': tareas.filter((tarea) => calcularEstado(tarea) === 'En curso').length,
    Finalizado: tareas.filter((tarea) => calcularEstado(tarea) === 'Finalizado').length,
    Atrasado: tareas.filter((tarea) => calcularEstado(tarea) === 'Atrasado').length,
  }

  return { total, pendientes, avanceGeneral, diasPromedio, porEstado }
}

export function calcularCumplimientoPorArea(tareas: Tarea[], areas: Area[]) {
  return areas
    .map((area) => {
      const tareasArea = tareas.filter((tarea) => tarea.areas.includes(area))
      const realizadas = tareasArea.filter((tarea) => calcularEstado(tarea) === 'Finalizado').length
      const avance =
        tareasArea.length > 0
          ? Math.round(tareasArea.reduce((acc, tarea) => acc + tarea.avanceTotal, 0) / tareasArea.length)
          : 0

      return { area, avance, cantidad: tareasArea.length, realizadas }
    })
    .filter((item) => item.cantidad > 0)
}

export function calcularTareasPorMes(tareas: Tarea[]) {
  const meses = Array.from({ length: 12 }, (_, mes) => ({
    mes,
    Planificado: 0,
    'En curso': 0,
    Finalizado: 0,
    Atrasado: 0,
  }))

  tareas.forEach((tarea) => {
    const mes = getMesFromFecha(tarea.fechaInicio)
    const estado = calcularEstado(tarea)

    if (meses[mes]) {
      meses[mes][estado] += 1
    }
  })

  return meses
}
