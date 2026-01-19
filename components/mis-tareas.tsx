"use client"

import { useState, useMemo } from "react"
import { User, Users, AlertCircle, Clock, CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTaskContext } from "@/lib/task-context"
import {
  calcularEstado,
  diasRestantes,
  formatearFecha,
  getEstadoColor,
  getPrioridadColor,
} from "@/lib/helpers"
import { TareaDetalleModal } from "@/components/tarea-detalle-modal"
import type { Tarea } from "@/lib/types"

export function MisTareas() {
  const { tareas, rol, areaUsuario } = useTaskContext()
  const [selectedTarea, setSelectedTarea] = useState<Tarea | null>(null)

  const misTareasPrincipales = useMemo(() => {
    if (rol === "Administrador") return tareas
    return tareas.filter((t) => t.areas.includes(areaUsuario))
  }, [tareas, rol, areaUsuario])

  const tareasCompartidas = useMemo(() => {
    if (rol === "Administrador") return []
    return tareas.filter(
      (t) => !t.areas.includes(areaUsuario) && t.areasApoyo.includes(areaUsuario)
    )
  }, [tareas, rol, areaUsuario])

  const tareasOrdenadas = (lista: Tarea[]) =>
    [...lista].sort((a, b) => {
      const diasA = diasRestantes(a.fechaFin)
      const diasB = diasRestantes(b.fechaFin)
      return diasA - diasB
    })

  const getStatusIcon = (tarea: Tarea) => {
    const estado = calcularEstado(tarea)
    const dias = diasRestantes(tarea.fechaFin)

    if (estado === "Atrasado") return <AlertCircle className="h-5 w-5 text-red-500" />
    if (estado === "Finalizado") return <CheckCircle className="h-5 w-5 text-emerald-500" />
    if (dias <= 5) return <Clock className="h-5 w-5 text-amber-500" />
    return <Clock className="h-5 w-5 text-blue-500" />
  }

  const TareaCard = ({ tarea, showAreaPrincipal = false }: { tarea: Tarea; showAreaPrincipal?: boolean }) => {
    const estado = calcularEstado(tarea)
    const dias = diasRestantes(tarea.fechaFin)

    return (
      <Card
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => setSelectedTarea(tarea)}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {getStatusIcon(tarea)}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-foreground line-clamp-1">{tarea.nombre}</h3>
              <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                {tarea.descripcion}
              </p>

              {showAreaPrincipal && (
                <div className="mt-2 flex items-center gap-2 text-xs">
                  <User className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Principal:</span>
                  <span className="font-medium text-foreground">{tarea.areas.join(", ")}</span>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 mt-3">
                <Badge className={getEstadoColor(estado)} variant="secondary">
                  {estado}
                </Badge>
                <Badge className={getPrioridadColor(tarea.prioridad)} variant="secondary">
                  {tarea.prioridad}
                </Badge>
                <span
                  className={`text-xs font-medium ${
                    dias < 0 ? "text-red-600" : dias <= 5 ? "text-amber-600" : "text-muted-foreground"
                  }`}
                >
                  {dias < 0 ? `${Math.abs(dias)}d atrasado` : `${dias}d restantes`}
                </span>
              </div>

              <div className="mt-3 flex items-center gap-3">
                <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full bg-accent transition-all"
                    style={{ width: `${tarea.avanceTotal}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-foreground">{tarea.avanceTotal}%</span>
              </div>

              <div className="mt-2 text-xs text-muted-foreground">
                {formatearFecha(tarea.fechaInicio)} - {formatearFecha(tarea.fechaFin)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const EmptyState = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
        <CheckCircle className="h-8 w-8 text-emerald-600" />
      </div>
      <p className="text-muted-foreground">{message}</p>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mis Tareas</h1>
        <p className="text-sm text-muted-foreground">
          {rol === "Administrador"
            ? "Vista de todas las tareas (modo administrador)"
            : `Tareas asignadas a ${areaUsuario}`}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {misTareasPrincipales.filter((t) => calcularEstado(t) === "En curso").length}
                </p>
                <p className="text-xs text-muted-foreground">En curso</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {
                    misTareasPrincipales.filter((t) => {
                      const dias = diasRestantes(t.fechaFin)
                      return dias > 0 && dias <= 7 && calcularEstado(t) !== "Finalizado"
                    }).length
                  }
                </p>
                <p className="text-xs text-muted-foreground">Por vencer</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {misTareasPrincipales.filter((t) => calcularEstado(t) === "Atrasado").length}
                </p>
                <p className="text-xs text-muted-foreground">Atrasadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="principales" className="space-y-4">
        <TabsList>
          <TabsTrigger value="principales" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Mis Tareas Principales
            <Badge variant="secondary" className="ml-1">
              {misTareasPrincipales.length}
            </Badge>
          </TabsTrigger>
          {rol === "Usuario" && (
            <TabsTrigger value="compartidas" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Tareas Compartidas
              <Badge variant="secondary" className="ml-1">
                {tareasCompartidas.length}
              </Badge>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="principales" className="space-y-4">
          {misTareasPrincipales.length === 0 ? (
            <EmptyState message="No tienes tareas asignadas" />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tareasOrdenadas(misTareasPrincipales).map((tarea) => (
                <TareaCard key={tarea.id} tarea={tarea} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="compartidas" className="space-y-4">
          {tareasCompartidas.length === 0 ? (
            <EmptyState message="No tienes tareas compartidas como area de apoyo" />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tareasOrdenadas(tareasCompartidas).map((tarea) => (
                <TareaCard key={tarea.id} tarea={tarea} showAreaPrincipal />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Detail Modal */}
      {selectedTarea && (
        <TareaDetalleModal
          tarea={selectedTarea}
          open={!!selectedTarea}
          onClose={() => setSelectedTarea(null)}
        />
      )}
    </div>
  )
}
