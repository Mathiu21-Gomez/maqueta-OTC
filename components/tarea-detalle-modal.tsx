"use client"

import {
  Calendar,
  Clock,
  Users,
  FileText,
  Download,
  CheckCircle2,
  Circle,
  AlertCircle,
} from "lucide-react"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { useTaskContext } from "@/lib/task-context"
import {
  calcularEstado,
  diasRestantes,
  formatearFecha,
  getEstadoColor,
  getPrioridadColor,
  getAreaColor,
} from "@/lib/helpers"
import type { Tarea } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

interface TareaDetalleModalProps {
  tarea: Tarea
  open: boolean
  onClose: () => void
}

export function TareaDetalleModal({ tarea, open, onClose }: TareaDetalleModalProps) {
  const { tareas, marcarActividadCompletada, finalizarTarea, rol } = useTaskContext()
  const { toast } = useToast()

  // Get fresh tarea data from context
  const tareaActual = tareas.find((t) => t.id === tarea.id) || tarea
  const estado = calcularEstado(tareaActual)
  const dias = diasRestantes(tareaActual.fechaFin)
  const puedeEditar = rol === "Administrador" || rol === "Usuario"
  const todasCompletadas = tareaActual.actividades.every((a) => a.completada)

  const handleToggleActividad = (actividadId: string, completada: boolean) => {
    marcarActividadCompletada(tareaActual.id, actividadId, completada)
    toast({
      title: completada ? "Actividad completada" : "Actividad desmarcada",
      description: "El avance se ha actualizado automáticamente",
    })
  }

  const handleFinalizarTarea = () => {
    finalizarTarea(tareaActual.id)
    toast({
      title: "Tarea finalizada",
      description: "La tarea ha sido marcada como completada",
    })
    onClose()
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-xl font-bold text-foreground pr-4">
              {tareaActual.nombre}
            </SheetTitle>
            <SheetDescription>
              Detalles de la tarea operacional
            </SheetDescription>
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <Badge className={getEstadoColor(estado)}>{estado}</Badge>
              <Badge className={getPrioridadColor(tareaActual.prioridad)}>
                {tareaActual.prioridad}
              </Badge>
              {tareaActual.areas.map((area) => (
                <Badge key={area} className={getAreaColor(area)}>
                  {area}
                </Badge>
              ))}
            </div>
          </SheetHeader>

          <div className="grid flex-1 auto-rows-min gap-6 px-4 py-6">
            {/* Descripción */}
            <div className="grid gap-2">
              <Label className="text-sm font-semibold">Descripción</Label>
              <p className="text-sm text-muted-foreground">{tareaActual.descripcion}</p>
            </div>

            <Separator />

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-xs text-muted-foreground">Inicio</Label>
                </div>
                <p className="text-sm font-medium text-foreground">
                  {formatearFecha(tareaActual.fechaInicio)}
                </p>
              </div>
              <div className="grid gap-1">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-xs text-muted-foreground">Fin</Label>
                </div>
                <p className="text-sm font-medium text-foreground">
                  {formatearFecha(tareaActual.fechaFin)}
                </p>
              </div>
              <div className="grid gap-1">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-xs text-muted-foreground">Duración</Label>
                </div>
                <p className="text-sm font-medium text-foreground">
                  {tareaActual.diasEjecutar} días
                </p>
              </div>
              <div className="grid gap-1">
                <div className="flex items-center gap-2">
                  {estado === "Finalizado" ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : dias < 0 ? (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  ) : (
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  )}
                  <Label className="text-xs text-muted-foreground">
                    {estado === "Finalizado" ? "Estado" : "Días restantes"}
                  </Label>
                </div>
                <p
                  className={`text-sm font-medium ${estado === "Finalizado" ? "text-emerald-600" :
                    dias < 0 ? "text-red-600" :
                      dias <= 5 ? "text-amber-600" : "text-foreground"
                    }`}
                >
                  {estado === "Finalizado" ? "Completada" :
                    dias < 0 ? `${Math.abs(dias)}d atrasado` : `${dias} días`}
                </p>
              </div>
            </div>

            {/* Apoyo */}
            {tareaActual.requiereApoyo && tareaActual.areasApoyo.length > 0 && (
              <>
                <Separator />
                <div className="grid gap-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm font-semibold">Áreas de Apoyo</Label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tareaActual.areasApoyo.map((area) => (
                      <Badge key={area} variant="outline">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Documentos */}
            {tareaActual.documentos.length > 0 && (
              <>
                <Separator />
                <div className="grid gap-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm font-semibold">Documentos</Label>
                  </div>
                  <div className="space-y-2">
                    {tareaActual.documentos.map((doc, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                      >
                        <span className="text-sm text-foreground">{doc.nombre}</span>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* Progress */}
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Progreso General</Label>
                <span className="text-sm font-bold text-primary">{tareaActual.avanceTotal}%</span>
              </div>
              <Progress value={tareaActual.avanceTotal} className="h-3" />
            </div>

            {/* Actividades */}
            <div className="grid gap-3">
              <Label className="text-sm font-semibold">
                Actividades ({tareaActual.actividades.filter((a) => a.completada).length}/
                {tareaActual.actividades.length})
              </Label>
              <div className="space-y-2">
                {tareaActual.actividades.map((actividad) => (
                  <div
                    key={actividad.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${actividad.completada
                      ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800"
                      : "bg-card border-border"
                      }`}
                  >
                    {puedeEditar && estado !== "Finalizado" ? (
                      <Checkbox
                        id={actividad.id}
                        checked={actividad.completada}
                        onCheckedChange={(checked) =>
                          handleToggleActividad(actividad.id, checked === true)
                        }
                      />
                    ) : actividad.completada ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                    <div className="flex-1">
                      <label
                        htmlFor={actividad.id}
                        className={`text-sm cursor-pointer ${actividad.completada
                          ? "text-emerald-700 dark:text-emerald-400 line-through"
                          : "text-foreground"
                          }`}
                      >
                        {actividad.nombre}
                      </label>
                    </div>
                    <span
                      className={`text-xs font-medium ${actividad.completada ? "text-emerald-600" : "text-muted-foreground"
                        }`}
                    >
                      {actividad.porcentaje}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Meta info */}
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Creado por {tareaActual.creadoPor} el {formatearFecha(tareaActual.fechaCreacion)}
              </p>
            </div>
          </div>

          <SheetFooter className="gap-2 pt-4 border-t mt-4 sm:justify-end">
            <SheetClose asChild>
              <Button
                variant="ghost"
                className="w-full sm:w-auto mt-2 sm:mt-0 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900"
              >
                Cerrar
              </Button>
            </SheetClose>
            {puedeEditar && estado !== "Finalizado" && (
              <Button
                className="w-full sm:w-auto"
                disabled={!todasCompletadas}
                onClick={handleFinalizarTarea}
              >
                {todasCompletadas
                  ? "Marcar como Finalizada"
                  : "Completa todas las actividades"}
              </Button>
            )}
          </SheetFooter>
        </SheetContent>
      </Sheet>
      <Toaster />
    </>
  )
}
