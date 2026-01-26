import type { Tarea, EstadoTarea, Notificacion, Area } from "./types"

export function calcularEstado(tarea: Tarea): EstadoTarea {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const inicio = new Date(tarea.fechaInicio)
  const fin = new Date(tarea.fechaFin)

  if (tarea.avanceTotal === 100) return "Finalizado"
  if (hoy < inicio) return "Planificado"
  if (hoy > fin && tarea.avanceTotal < 100) return "Atrasado"
  return "En curso"
}

export function calcularAvance(actividades: Tarea["actividades"]): number {
  if (actividades.length === 0) return 0
  const suma = actividades.reduce((acc, act) => acc + act.porcentaje, 0)
  return Math.round(suma / actividades.length)
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

    if (estado === "Atrasado") {
      notificaciones.push({
        id: `notif-${tarea.id}-atrasada`,
        tipo: "atrasada",
        mensaje: `"${tarea.nombre}" esta atrasada por ${Math.abs(dias)} dias`,
        tareaId: tarea.id,
        prioridad: "alta",
        leida: false,
      })
    }

    if (dias > 0 && dias <= 7 && estado === "En curso") {
      notificaciones.push({
        id: `notif-${tarea.id}-vencer`,
        tipo: "porVencer",
        mensaje: `"${tarea.nombre}" vence en ${dias} dias`,
        tareaId: tarea.id,
        prioridad: "media",
        leida: false,
      })
    }
  })

  return notificaciones.sort((a, b) => {
    const prioridadOrden = { alta: 0, media: 1, baja: 2 }
    return prioridadOrden[a.prioridad] - prioridadOrden[b.prioridad]
  })
}

export function formatearFecha(fecha: string): string {
  return new Date(fecha).toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

export function getMesFromFecha(fecha: string): number {
  return new Date(fecha).getMonth()
}

export function getEstadoColor(estado: EstadoTarea): string {
  const colores: Record<EstadoTarea, string> = {
    Planificado: "bg-amber-100 text-amber-800 border-amber-200",
    "En curso": "bg-blue-100 text-blue-800 border-blue-200",
    Finalizado: "bg-emerald-100 text-emerald-800 border-emerald-200",
    Atrasado: "bg-red-100 text-red-800 border-red-200",
  }
  return colores[estado]
}

export function getPrioridadColor(prioridad: string): string {
  const colores: Record<string, string> = {
    Alta: "bg-red-100 text-red-800 border-red-200",
    Media: "bg-amber-100 text-amber-800 border-amber-200",
    Baja: "bg-slate-100 text-slate-800 border-slate-200",
  }
  return colores[prioridad] || colores.Baja
}

export function getAreaColor(area: Area): string {
  const colores: Record<Area, string> = {
    Seguridad: "bg-red-50 text-red-700 border-red-200",
    Comunidades: "bg-purple-50 text-purple-700 border-purple-200",
    Legal: "bg-indigo-50 text-indigo-700 border-indigo-200",
    Mantenimiento: "bg-orange-50 text-orange-700 border-orange-200",
    "Medio Ambiente": "bg-green-50 text-green-700 border-green-200",
    Operaciones: "bg-blue-50 text-blue-700 border-blue-200",
    Calidad: "bg-teal-50 text-teal-700 border-teal-200",
    Compras: "bg-cyan-50 text-cyan-700 border-cyan-200",
  }
  return colores[area] || "bg-slate-50 text-slate-700 border-slate-200"
}

export function calcularKPIs(tareas: Tarea[]) {
  const total = tareas.length
  const pendientes = tareas.filter((t) => calcularEstado(t) !== "Finalizado").length
  const avanceGeneral = total > 0 ? Math.round(tareas.reduce((acc, t) => acc + t.avanceTotal, 0) / total) : 0
  const diasPromedio =
    total > 0 ? Math.round(tareas.reduce((acc, t) => acc + t.diasEjecutar, 0) / total) : 0

  const porEstado = {
    Planificado: tareas.filter((t) => calcularEstado(t) === "Planificado").length,
    "En curso": tareas.filter((t) => calcularEstado(t) === "En curso").length,
    Finalizado: tareas.filter((t) => calcularEstado(t) === "Finalizado").length,
    Atrasado: tareas.filter((t) => calcularEstado(t) === "Atrasado").length,
  }

  return { total, pendientes, avanceGeneral, diasPromedio, porEstado }
}

export function calcularCumplimientoPorArea(tareas: Tarea[], areas: Area[]) {
  return areas.map((area) => {
    const tareasArea = tareas.filter((t) => t.areas.includes(area))
    const realizadas = tareasArea.filter((t) => calcularEstado(t) === "Finalizado").length
    const avance =
      tareasArea.length > 0
        ? Math.round(tareasArea.reduce((acc, t) => acc + t.avanceTotal, 0) / tareasArea.length)
        : 0
    return { area, avance, cantidad: tareasArea.length, realizadas }
  }).filter(a => a.cantidad > 0)
}

export function calcularTareasPorMes(tareas: Tarea[]) {
  const meses = Array.from({ length: 12 }, (_, i) => ({
    mes: i,
    Planificado: 0,
    "En curso": 0,
    Finalizado: 0,
    Atrasado: 0,
  }))

  tareas.forEach((tarea) => {
    const mes = getMesFromFecha(tarea.fechaInicio)
    const estado = calcularEstado(tarea)
    if (meses[mes]) {
      meses[mes][estado]++
    }
  })

  return meses
}
