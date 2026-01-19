"use client"

import { useState, useMemo } from "react"
import { Users, User, Eye, Filter } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useTaskContext } from "@/lib/task-context"
import {
  calcularEstado,
  getAreaColor,
} from "@/lib/helpers"
import { AREAS, ESTADOS, type Area } from "@/lib/types"
import { TareaDetalleModal } from "@/components/tarea-detalle-modal"
import type { Tarea } from "@/lib/types"

export function TareasColaborativas() {
  const { tareas } = useTaskContext()
  const [areaFilter, setAreaFilter] = useState<string>("todas")
  const [estadoFilter, setEstadoFilter] = useState<string>("todos")
  const [selectedTarea, setSelectedTarea] = useState<Tarea | null>(null)

  // Filter only collaborative tasks (multiple areas or requires support)
  const tareasColaborativas = useMemo(() => {
    return tareas.filter((t) => t.areas.length > 1 || (t.requiereApoyo && t.areasApoyo.length > 0))
  }, [tareas])

  const tareasFiltradas = useMemo(() => {
    return tareasColaborativas.filter((tarea) => {
      const estado = calcularEstado(tarea)
      const todasAreas = [...tarea.areas, ...tarea.areasApoyo]

      if (areaFilter !== "todas" && !todasAreas.includes(areaFilter as Area)) return false
      if (estadoFilter !== "todos" && estado !== estadoFilter) return false

      return true
    })
  }, [tareasColaborativas, areaFilter, estadoFilter])

  const stats = useMemo(() => {
    const total = tareasColaborativas.length
    const enCurso = tareasColaborativas.filter((t) => calcularEstado(t) === "En curso").length
    const finalizadas = tareasColaborativas.filter((t) => calcularEstado(t) === "Finalizado").length
    const atrasadas = tareasColaborativas.filter((t) => calcularEstado(t) === "Atrasado").length
    const avancePromedio =
      total > 0
        ? Math.round(tareasColaborativas.reduce((acc, t) => acc + t.avanceTotal, 0) / total)
        : 0

    return { total, enCurso, finalizadas, atrasadas, avancePromedio }
  }, [tareasColaborativas])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Tareas Colaborativas</h1>
        <p className="text-sm text-muted-foreground">
          Tareas que involucran múltiples áreas o requieren apoyo
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total colaborativas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.enCurso}</p>
                <p className="text-xs text-muted-foreground">En curso</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.finalizadas}</p>
                <p className="text-xs text-muted-foreground">Finalizadas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.avancePromedio}%</p>
                <p className="text-xs text-muted-foreground">Avance promedio</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="h-4 w-4" />
              Filtros:
            </div>
            <Select value={areaFilter} onValueChange={setAreaFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Área involucrada" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las áreas</SelectItem>
                {AREAS.map((area) => (
                  <SelectItem key={area} value={area}>
                    {area}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={estadoFilter} onValueChange={setEstadoFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {ESTADOS.map((estado) => (
                  <SelectItem key={estado} value={estado}>
                    {estado}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableCaption className="mb-4">
              Lista de tareas colaborativas que involucran múltiples áreas
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Tarea</TableHead>
                <TableHead>Área Principal</TableHead>
                <TableHead>Áreas de Apoyo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Avance</TableHead>
                <TableHead className="w-[80px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tareasFiltradas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <p className="text-muted-foreground">No se encontraron tareas colaborativas</p>
                  </TableCell>
                </TableRow>
              ) : (
                tareasFiltradas.map((tarea) => {
                  const estado = calcularEstado(tarea)

                  return (
                    <TableRow
                      key={tarea.id}
                      className="cursor-pointer"
                      onClick={() => setSelectedTarea(tarea)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-blue-500 flex-shrink-0" />
                          <span className="line-clamp-1">
                            {tarea.nombre}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {tarea.areas.map((area) => (
                            <Badge key={area} className={getAreaColor(area)}>
                              <User className="h-3 w-3 mr-1" />
                              {area}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {tarea.areasApoyo.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {tarea.areasApoyo.map((area) => (
                              <Badge key={area} variant="outline" className="text-xs">
                                {area}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className={`font-medium ${estado === "Finalizado" ? "text-green-600" :
                            estado === "Atrasado" ? "text-red-600" :
                              estado === "En curso" ? "text-blue-600" :
                                "text-yellow-600"
                          }`}>
                          {estado}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 rounded-full bg-secondary overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all"
                              style={{ width: `${tarea.avanceTotal}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {tarea.avanceTotal}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedTarea(tarea)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3}>Resumen de tareas colaborativas</TableCell>
                <TableCell className="text-center">
                  <span className="text-green-600">{stats.finalizadas}</span> / <span className="text-red-600">{stats.atrasadas}</span>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {stats.avancePromedio}% promedio
                </TableCell>
                <TableCell className="text-right font-medium">
                  {tareasFiltradas.length} mostradas
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>

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
