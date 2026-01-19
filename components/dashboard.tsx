"use client"

import { useState, useMemo } from "react"
import {
  ClipboardList,
  Clock,
  TrendingUp,
  AlertCircle,
  Filter,
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
import { calcularKPIs, calcularCumplimientoPorArea, calcularTareasPorMes, calcularEstado, getMesFromFecha } from "@/lib/helpers"
import { AREAS, ESTADOS, MESES, type Area, type EstadoTarea } from "@/lib/types"
import { EstadoChart } from "@/components/charts/estado-chart"
import { AreaChart } from "@/components/charts/area-chart"
import { MesesChart } from "@/components/charts/meses-chart"
import { VencimientoChart } from "@/components/charts/vencimiento-chart"
import { TiempoPromedioChart } from "@/components/charts/tiempo-promedio-chart"

export function Dashboard() {
  const { tareas } = useTaskContext()
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
      <Card>
        <CardContent className="p-4">
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
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Tareas
            </CardTitle>
            <ClipboardList className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{kpis.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {kpis.porEstado.Finalizado} finalizadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pendientes
            </CardTitle>
            <AlertCircle className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{kpis.pendientes}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {kpis.porEstado.Atrasado} atrasadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avance General
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{kpis.avanceGeneral}%</div>
            <div className="mt-2 h-2 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full bg-accent transition-all duration-500"
                style={{ width: `${kpis.avanceGeneral}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Dias Prom. Ejecucion
            </CardTitle>
            <Clock className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{kpis.diasPromedio}</div>
            <p className="text-xs text-muted-foreground mt-1">dias promedio</p>
          </CardContent>
        </Card>
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
