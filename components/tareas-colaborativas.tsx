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
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4 mb-8">
        {/* Card 1: Total colaborativas - Azul */}
        <div className="relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 min-h-[160px]">
          <div className="h-2 w-full" style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)' }} />
          <div className="px-6 pt-5 pb-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-[15px] font-semibold text-[#374151] leading-tight m-0">Total colaborativas</h3>
              <div className="w-11 h-11 rounded-full bg-[#DBEAFE] flex items-center justify-center shrink-0">
                <Users className="w-[22px] h-[22px] text-[#2563EB]" />
              </div>
            </div>
            <div className="text-[36px] font-bold text-[#111827] leading-tight mb-2 tracking-tight">
              {stats.total}
            </div>
            <p className="text-[13px] font-normal text-[#6B7280] leading-normal m-0">tareas colaborativas</p>
          </div>
        </div>

        {/* Card 2: En curso - Naranja */}
        <div className="relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 min-h-[160px]">
          <div className="h-2 w-full" style={{ background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)' }} />
          <div className="px-6 pt-5 pb-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-[15px] font-semibold text-[#374151] leading-tight m-0">En curso</h3>
              <div className="w-11 h-11 rounded-full bg-[#FFEDD5] flex items-center justify-center shrink-0">
                <Users className="w-[22px] h-[22px] text-[#EA580C]" />
              </div>
            </div>
            <div className="text-[36px] font-bold text-[#111827] leading-tight mb-2 tracking-tight">
              {stats.enCurso}
            </div>
            <p className="text-[13px] font-normal text-[#6B7280] leading-normal m-0">en progreso</p>
          </div>
        </div>

        {/* Card 3: Finalizadas - Verde */}
        <div className="relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 min-h-[160px]">
          <div className="h-2 w-full" style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }} />
          <div className="px-6 pt-5 pb-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-[15px] font-semibold text-[#374151] leading-tight m-0">Finalizadas</h3>
              <div className="w-11 h-11 rounded-full bg-[#D1FAE5] flex items-center justify-center shrink-0">
                <Users className="w-[22px] h-[22px] text-[#059669]" />
              </div>
            </div>
            <div className="text-[36px] font-bold text-[#111827] leading-tight mb-2 tracking-tight">
              {stats.finalizadas}
            </div>
            <p className="text-[13px] font-normal text-[#6B7280] leading-normal m-0">completadas</p>
          </div>
        </div>

        {/* Card 4: Avance promedio - Púrpura */}
        <div className="relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 min-h-[160px]">
          <div className="h-2 w-full" style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)' }} />
          <div className="px-6 pt-5 pb-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-[15px] font-semibold text-[#374151] leading-tight m-0">Avance promedio</h3>
              <div className="w-11 h-11 rounded-full bg-[#EDE9FE] flex items-center justify-center shrink-0">
                <Users className="w-[22px] h-[22px] text-[#7C3AED]" />
              </div>
            </div>
            <div className="text-[36px] font-bold text-[#111827] leading-tight mb-2 tracking-tight">
              {stats.avancePromedio}%
            </div>
            <p className="text-[13px] font-normal text-[#6B7280] leading-normal m-0">progreso general</p>
          </div>
        </div>
      </div>

      {/* Filters */}
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
