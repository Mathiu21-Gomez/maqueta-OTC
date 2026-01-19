"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { Tarea, RolUsuario, Area, Notificacion } from "./types"
import { tareasIniciales } from "./mock-data"
import { calcularEstado, calcularAvance, generarNotificaciones } from "./helpers"

interface TaskContextType {
  tareas: Tarea[]
  rol: RolUsuario
  areaUsuario: Area
  notificaciones: Notificacion[]
  setRol: (rol: RolUsuario) => void
  setAreaUsuario: (area: Area) => void
  agregarTarea: (tarea: Omit<Tarea, "id" | "fechaCreacion" | "creadoPor" | "avanceTotal" | "estado">) => void
  actualizarTarea: (id: string, updates: Partial<Tarea>) => void
  marcarActividadCompletada: (tareaId: string, actividadId: string, completada: boolean) => void
  finalizarTarea: (id: string) => void
  marcarNotificacionLeida: (id: string) => void
}

const TaskContext = createContext<TaskContextType | undefined>(undefined)

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tareas, setTareas] = useState<Tarea[]>(() => {
    // Actualizar estados al cargar
    return tareasIniciales.map((t) => ({
      ...t,
      estado: calcularEstado(t),
    }))
  })
  const [rol, setRol] = useState<RolUsuario>("Administrador")
  const [areaUsuario, setAreaUsuario] = useState<Area>("Seguridad")
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>(() =>
    generarNotificaciones(tareasIniciales)
  )

  const agregarTarea = useCallback(
    (nuevaTarea: Omit<Tarea, "id" | "fechaCreacion" | "creadoPor" | "avanceTotal" | "estado">) => {
      const tarea: Tarea = {
        ...nuevaTarea,
        id: `tarea-${Date.now()}`,
        fechaCreacion: new Date().toISOString().split("T")[0],
        creadoPor: rol === "Administrador" ? "Admin" : areaUsuario,
        avanceTotal: calcularAvance(nuevaTarea.actividades),
        estado: "Planificado",
      }
      tarea.estado = calcularEstado(tarea)
      
      setTareas((prev) => {
        const updated = [...prev, tarea]
        setNotificaciones(generarNotificaciones(updated))
        return updated
      })
    },
    [rol, areaUsuario]
  )

  const actualizarTarea = useCallback((id: string, updates: Partial<Tarea>) => {
    setTareas((prev) => {
      const updated = prev.map((t) => {
        if (t.id !== id) return t
        const updated = { ...t, ...updates }
        updated.avanceTotal = calcularAvance(updated.actividades)
        updated.estado = calcularEstado(updated)
        return updated
      })
      setNotificaciones(generarNotificaciones(updated))
      return updated
    })
  }, [])

  const marcarActividadCompletada = useCallback(
    (tareaId: string, actividadId: string, completada: boolean) => {
      setTareas((prev) => {
        const updated = prev.map((t) => {
          if (t.id !== tareaId) return t
          const actividades = t.actividades.map((a) => {
            if (a.id !== actividadId) return a
            return { ...a, completada, porcentaje: completada ? 100 : 0 }
          })
          const tarea = { ...t, actividades }
          tarea.avanceTotal = calcularAvance(actividades)
          tarea.estado = calcularEstado(tarea)
          return tarea
        })
        setNotificaciones(generarNotificaciones(updated))
        return updated
      })
    },
    []
  )

  const finalizarTarea = useCallback((id: string) => {
    setTareas((prev) => {
      const updated = prev.map((t) => {
        if (t.id !== id) return t
        const actividades = t.actividades.map((a) => ({ ...a, completada: true, porcentaje: 100 }))
        return { ...t, actividades, avanceTotal: 100, estado: "Finalizado" as const }
      })
      setNotificaciones(generarNotificaciones(updated))
      return updated
    })
  }, [])

  const marcarNotificacionLeida = useCallback((id: string) => {
    setNotificaciones((prev) => prev.map((n) => (n.id === id ? { ...n, leida: true } : n)))
  }, [])

  return (
    <TaskContext.Provider
      value={{
        tareas,
        rol,
        areaUsuario,
        notificaciones,
        setRol,
        setAreaUsuario,
        agregarTarea,
        actualizarTarea,
        marcarActividadCompletada,
        finalizarTarea,
        marcarNotificacionLeida,
      }}
    >
      {children}
    </TaskContext.Provider>
  )
}

export function useTaskContext() {
  const context = useContext(TaskContext)
  if (!context) {
    throw new Error("useTaskContext must be used within TaskProvider")
  }
  return context
}
