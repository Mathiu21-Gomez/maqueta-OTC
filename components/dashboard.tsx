"use client"

import { useState, useMemo } from "react"
import {
  ClipboardList,
  Clock,
  TrendingUp,
  AlertCircle,
  Filter,
  PlusCircle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTaskContext } from "@/lib/task-context"
import { Button } from "@/components/ui/button"
import { calcularKPIs, calcularCumplimientoPorArea, calcularTareasPorMes, calcularEstado, getMesFromFecha } from "@/lib/helpers"
import { AREAS, ESTADOS, MESES, type Area, type EstadoTarea } from "@/lib/types"
import { EstadoChart } from "@/components/charts/estado-chart"
import { AreaChart } from "@/components/charts/area-chart"
import { MesesChart } from "@/components/charts/meses-chart"
import { VencimientoChart } from "@/components/charts/vencimiento-chart"
import { TiempoPromedioChart } from "@/components/charts/tiempo-promedio-chart"

export function Dashboard() {
  const { tareas, setNuevaTareaSheetOpen } = useTaskContext()
  const [mesFilter, setMesFilter] = useState<string>("todos")
  const [areaFilter, setAreaFilter] = useState<string>("todas")
  const [estadoFilter, setEstadoFilter] = useState<string>("todos")

  const tareasFiltradas = useMemo(() => {
    return tareas.filter((tarea) => {
      const mes = getMesFromFecha(tarea.fechaInicio)
      const estado = calcularEstado(tarea)
      
      if (mesFilter !== "todos" && mes !== parseInt(mesFilter)) return false
      if (areaFilter !== "todas" && !tarea.areas.includes(areaFilter as Area)) return false
      if (estadoFilter !== "todos" && estado !== estadoFilter) return false
      
      return true
    })
  }, [tareas, mesFilter, areaFilter, estadoFilter])

  const kpis = useMemo(() => calcularKPIs(tareasFiltradas), [tareasFiltradas])
  const cumplimientoPorArea = useMemo(
    () => calcularCumplimientoPorArea(tareasFiltradas, AREAS),
    [tareasFiltradas]
  )
  const tareasPorMes = useMemo(() => calcularTareasPorMes(tareasFiltradas), [tareasFiltradas])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Vision general del sistema de gestion operacional
          </p>
        </div>
        <Badge variant="outline" className="w-fit">
          Ultimo actualizado: {new Date().toLocaleDateString("es-CL")}
        </Badge>
      </div>

      {/* Filters */}
      <div className="relative bg-white rounded-xl overflow-hidden shadow-sm mb-6">
        <div className="h-2 w-full" style={{ background: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)' }} />
        <div className="px-6 pt-5 pb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="h-4 w-4" />
              Filtros:
            </div>
            <Select value={mesFilter} onValueChange={setMesFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Mes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los meses</SelectItem>
                {MESES.map((mes, i) => (
                  <SelectItem key={mes} value={i.toString()}>
                    {mes}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={areaFilter} onValueChange={setAreaFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Area" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las areas</SelectItem>
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

      {/* KPIs */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4 mb-8">
        {/* Card 1: Total Tareas - Azul */}
        <div className="relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 min-h-[160px]">
          {/* Franja azul */}
          <div className="h-2 w-full" style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)' }} />
          
          {/* Contenido */}
          <div className="px-6 pt-5 pb-6">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-[15px] font-semibold text-[#374151] leading-tight m-0">
                Total Tareas
              </h3>
              <div className="w-11 h-11 rounded-full bg-[#DBEAFE] flex items-center justify-center shrink-0">
                <ClipboardList className="w-[22px] h-[22px] text-[#2563EB]" />
              </div>
            </div>
            
            {/* Métrica */}
            <div className="text-[36px] font-bold text-[#111827] leading-tight mb-2 tracking-tight">
              {kpis.total}
            </div>
            
            {/* Descripción */}
            <p className="text-[13px] font-normal text-[#6B7280] leading-normal m-0">
              {kpis.porEstado.Finalizado} finalizadas
            </p>
          </div>
        </div>

        {/* Card 2: Pendientes - Verde */}
        <div className="relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 min-h-[160px]">
          {/* Franja verde */}
          <div className="h-2 w-full" style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }} />
          
          {/* Contenido */}
          <div className="px-6 pt-5 pb-6">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-[15px] font-semibold text-[#374151] leading-tight m-0">
                Pendientes
              </h3>
              <div className="w-11 h-11 rounded-full bg-[#D1FAE5] flex items-center justify-center shrink-0">
                <AlertCircle className="w-[22px] h-[22px] text-[#059669]" />
              </div>
            </div>
            
            {/* Métrica */}
            <div className="text-[36px] font-bold text-[#111827] leading-tight mb-2 tracking-tight">
              {kpis.pendientes}
            </div>
            
            {/* Descripción */}
            <p className="text-[13px] font-normal text-[#6B7280] leading-normal m-0">
              {kpis.porEstado.Atrasado} atrasadas
            </p>
          </div>
        </div>

        {/* Card 3: Avance General - Púrpura */}
        <div className="relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 min-h-[160px]">
          {/* Franja púrpura */}
          <div className="h-2 w-full" style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)' }} />
          
          {/* Contenido */}
          <div className="px-6 pt-5 pb-6">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-[15px] font-semibold text-[#374151] leading-tight m-0">
                Avance General
              </h3>
              <div className="w-11 h-11 rounded-full bg-[#EDE9FE] flex items-center justify-center shrink-0">
                <TrendingUp className="w-[22px] h-[22px] text-[#7C3AED]" />
              </div>
            </div>
            
            {/* Métrica */}
            <div className="text-[36px] font-bold text-[#111827] leading-tight mb-2 tracking-tight">
              {kpis.avanceGeneral}%
            </div>
            
            {/* Descripción */}
            <p className="text-[13px] font-normal text-[#6B7280] leading-normal m-0">
              Progreso general del sistema
            </p>
          </div>
        </div>

        {/* Card 4: Días Prom. Ejecución - Naranja */}
        <div className="relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 min-h-[160px]">
          {/* Franja naranja */}
          <div className="h-2 w-full" style={{ background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)' }} />
          
          {/* Contenido */}
          <div className="px-6 pt-5 pb-6">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-[15px] font-semibold text-[#374151] leading-tight m-0">
                Días Prom. Ejecución
              </h3>
              <div className="w-11 h-11 rounded-full bg-[#FFEDD5] flex items-center justify-center shrink-0">
                <Clock className="w-[22px] h-[22px] text-[#EA580C]" />
              </div>
            </div>
            
            {/* Métrica */}
            <div className="text-[36px] font-bold text-[#111827] leading-tight mb-2 tracking-tight">
              {kpis.diasPromedio}
            </div>
            
            {/* Descripción */}
            <p className="text-[13px] font-normal text-[#6B7280] leading-normal m-0">
              días promedio
            </p>
          </div>
        </div>
      </div>

      {/* Botón Nueva Tarea */}
      <div className="flex justify-end mb-6">
        <Button
          onClick={() => setNuevaTareaSheetOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Nueva Tarea
        </Button>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <EstadoChart data={kpis.porEstado} />
        <AreaChart data={cumplimientoPorArea} />
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <MesesChart data={tareasPorMes} />
        <VencimientoChart tareas={tareasFiltradas} />
      </div>

      {/* Charts Row 3 */}
      <TiempoPromedioChart tareas={tareasFiltradas} />
    </div>
  )
}
