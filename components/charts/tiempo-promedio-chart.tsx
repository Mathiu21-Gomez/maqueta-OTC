"use client"

import { useMemo } from "react"
import { LabelList, Pie, PieChart } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Badge } from "@/components/ui/badge"
import { Clock } from "lucide-react"
import type { Tarea } from "@/lib/types"
import { AREAS } from "@/lib/types"

const COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#84CC16",
]

interface TiempoPromedioChartProps {
  tareas: Tarea[]
}

export function TiempoPromedioChart({ tareas }: TiempoPromedioChartProps) {
  const chartData = useMemo(() => {
    return AREAS.map((area, index) => {
      const tareasArea = tareas.filter((t) => t.areas.includes(area))
      const diasPromedio =
        tareasArea.length > 0
          ? Math.round(
            tareasArea.reduce((acc, t) => acc + t.diasEjecutar, 0) / tareasArea.length
          )
          : 0
      return {
        area,
        diasPromedio,
        cantidad: tareasArea.length,
        fill: COLORS[index % COLORS.length]
      }
    })
      .filter((item) => item.cantidad > 0)
      .sort((a, b) => b.diasPromedio - a.diasPromedio)
  }, [tareas])

  // Generar config dinámico para las áreas
  const dynamicConfig = chartData.reduce((acc, item) => {
    acc[item.area] = {
      label: item.area,
      color: item.fill,
    }
    return acc
  }, { diasPromedio: { label: "Días Promedio" } } as ChartConfig)

  const promedioGeneral = chartData.length > 0
    ? Math.round(chartData.reduce((acc, item) => acc + item.diasPromedio, 0) / chartData.length)
    : 0

  if (chartData.length === 0) {
    return (
      <div className="relative bg-white rounded-xl overflow-hidden shadow-sm flex flex-col">
        <div className="h-2 w-full" style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)' }} />
        <div className="px-6 pt-5 pb-0 flex flex-col">
          <div className="items-center pb-0">
            <h3 className="text-base text-foreground font-semibold">
              Tiempo Promedio de Ejecución por Área
            </h3>
          </div>
        </div>
        <div className="px-6 pb-6 flex items-center justify-center h-[250px]">
          <p className="text-muted-foreground">No hay datos disponibles</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative bg-white rounded-xl overflow-hidden shadow-sm flex flex-col">
      <div className="h-2 w-full" style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)' }} />
      <div className="px-6 pt-5 pb-0 flex flex-col">
        <div className="items-center pb-0">
          <h3 className="text-base font-semibold">
            Tiempo Promedio por Área
            <Badge
              variant="outline"
              className="text-blue-500 bg-blue-500/10 border-none ml-2"
            >
              <Clock className="h-4 w-4" />
              <span>{promedioGeneral}d promedio</span>
            </Badge>
          </h3>
          <p className="text-sm text-muted-foreground mt-1">{chartData.length} áreas con actividad</p>
        </div>
      </div>
      <div className="px-6 pb-6 flex-1">
        <ChartContainer
          config={dynamicConfig}
          className="[&_.recharts-text]:fill-background mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent nameKey="area" hideLabel />}
            />
            <Pie
              data={chartData}
              innerRadius={30}
              dataKey="diasPromedio"
              nameKey="area"
              cornerRadius={8}
              paddingAngle={4}
            >
              <LabelList
                dataKey="diasPromedio"
                stroke="none"
                fontSize={12}
                fontWeight={500}
                fill="currentColor"
                formatter={(value: number) => `${value}d`}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </div>
    </div>
  )
}
