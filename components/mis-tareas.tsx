"use client"

import { useState, useMemo } from "react"
import { User, Users, AlertCircle, Clock, CheckCircle, Filter, Eye } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  diasRestantes,
  formatearFecha,
  getEstadoColor,
  getPrioridadColor,
  getAreaColor,
} from "@/lib/helpers"
import { TareaDetalleModal } from "@/components/tarea-detalle-modal"
import type { Tarea } from "@/lib/types"
import { AREAS, ESTADOS, type Area } from "@/lib/types"

export function MisTareas() {
  const { tareas, rol, areaUsuario } = useTaskContext()
  const [selectedTarea, setSelectedTarea] = useState<Tarea | null>(null)

  // Filtros para colaborativas
  const [areaFilter, setAreaFilter] = useState<string>("todas")
  const [estadoFilter, setEstadoFilter] = useState<string>("todos")

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

  // Mis tareas colaborativas: tareas donde el usuario participa y son colaborativas
  const misColaborativas = useMemo(() => {
    // Una tarea es colaborativa si tiene múltiples áreas o requiere apoyo
    const esColaborativa = (t: Tarea) => t.areas.length > 1 || (t.requiereApoyo && t.areasApoyo.length > 0)

    if (rol === "Administrador") {
      // Admin ve todas las colaborativas
      return tareas.filter(esColaborativa)
    }

    // Usuario ve colaborativas donde participa (como área principal o de apoyo)
    return tareas.filter(
      (t) => esColaborativa(t) && (t.areas.includes(areaUsuario) || t.areasApoyo.includes(areaUsuario))
    )
  }, [tareas, rol, areaUsuario])

  // Filtrar colaborativas según filtros
  const colaborativasFiltradas = useMemo(() => {
    return misColaborativas.filter((tarea) => {
      const estado = calcularEstado(tarea)
      const todasAreas = [...tarea.areas, ...tarea.areasApoyo]

      if (areaFilter !== "todas" && !todasAreas.includes(areaFilter as Area)) return false
      if (estadoFilter !== "todos" && estado !== estadoFilter) return false

      return true
    })
  }, [misColaborativas, areaFilter, estadoFilter])

  // Stats para colaborativas
  const statsColaborativas = useMemo(() => {
    const total = misColaborativas.length
    const enCurso = misColaborativas.filter((t) => calcularEstado(t) === "En curso").length
    const finalizadas = misColaborativas.filter((t) => calcularEstado(t) === "Finalizado").length
    const atrasadas = misColaborativas.filter((t) => calcularEstado(t) === "Atrasado").length
    const avancePromedio =
      total > 0
        ? Math.round(misColaborativas.reduce((acc, t) => acc + t.avanceTotal, 0) / total)
        : 0

    return { total, enCurso, finalizadas, atrasadas, avancePromedio }
  }, [misColaborativas])

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
                  className={`text-xs font-medium ${dias < 0 ? "text-red-600" : dias <= 5 ? "text-amber-600" : "text-muted-foreground"
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
      <div className="grid gap-5 sm:grid-cols-3 mb-8">
        {/* Card 1: En curso - Azul */}
        <div className="relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 min-h-[160px]">
          <div className="h-2 w-full" style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)' }} />
          <div className="px-6 pt-5 pb-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-[15px] font-semibold text-[#374151] leading-tight m-0">En curso</h3>
              <div className="w-11 h-11 rounded-full bg-[#DBEAFE] flex items-center justify-center shrink-0">
                <Clock className="w-[22px] h-[22px] text-[#2563EB]" />
              </div>
            </div>
            <div className="text-[36px] font-bold text-[#111827] leading-tight mb-2 tracking-tight">
              {misTareasPrincipales.filter((t) => calcularEstado(t) === "En curso").length}
            </div>
            <p className="text-[13px] font-normal text-[#6B7280] leading-normal m-0">tareas en progreso</p>
          </div>
        </div>

        {/* Card 2: Por vencer - Naranja */}
        <div className="relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 min-h-[160px]">
          <div className="h-2 w-full" style={{ background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)' }} />
          <div className="px-6 pt-5 pb-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-[15px] font-semibold text-[#374151] leading-tight m-0">Por vencer</h3>
              <div className="w-11 h-11 rounded-full bg-[#FFEDD5] flex items-center justify-center shrink-0">
                <AlertCircle className="w-[22px] h-[22px] text-[#EA580C]" />
              </div>
            </div>
            <div className="text-[36px] font-bold text-[#111827] leading-tight mb-2 tracking-tight">
              {
                misTareasPrincipales.filter((t) => {
                  const dias = diasRestantes(t.fechaFin)
                  return dias > 0 && dias <= 7 && calcularEstado(t) !== "Finalizado"
                }).length
              }
            </div>
            <p className="text-[13px] font-normal text-[#6B7280] leading-normal m-0">próximas a vencer</p>
          </div>
        </div>

        {/* Card 3: Atrasadas - Rojo (usando púrpura como base pero con rojo) */}
        <div className="relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 min-h-[160px]">
          <div className="h-2 w-full" style={{ background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)' }} />
          <div className="px-6 pt-5 pb-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-[15px] font-semibold text-[#374151] leading-tight m-0">Atrasadas</h3>
              <div className="w-11 h-11 rounded-full bg-[#FEE2E2] flex items-center justify-center shrink-0">
                <AlertCircle className="w-[22px] h-[22px] text-[#DC2626]" />
              </div>
            </div>
            <div className="text-[36px] font-bold text-[#111827] leading-tight mb-2 tracking-tight">
              {misTareasPrincipales.filter((t) => calcularEstado(t) === "Atrasado").length}
            </div>
            <p className="text-[13px] font-normal text-[#6B7280] leading-normal m-0">requieren atención</p>
          </div>
        </div>
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
          <TabsTrigger value="colaborativas" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Mis Colaborativas
            <Badge variant="secondary" className="ml-1">
              {misColaborativas.length}
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

        <TabsContent value="colaborativas" className="space-y-6">
          {/* Filtros de Colaborativas */}
          <div className="relative bg-white rounded-xl overflow-hidden shadow-sm">
            <div className="h-2 w-full" style={{ background: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)' }} />
            <div className="px-6 pt-5 pb-6">
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
            </div>
          </div>

          {/* Tabla de Colaborativas */}
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
                  {colaborativasFiltradas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center">
                        <p className="text-muted-foreground">No se encontraron tareas colaborativas</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    colaborativasFiltradas.map((tarea) => {
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
                      <span className="text-green-600">{statsColaborativas.finalizadas}</span> / <span className="text-red-600">{statsColaborativas.atrasadas}</span>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {statsColaborativas.avancePromedio}% promedio
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {colaborativasFiltradas.length} mostradas
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </CardContent>
          </Card>
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
