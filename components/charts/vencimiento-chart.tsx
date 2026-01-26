"use client"

import React, { useMemo } from "react"
import { TrendingUp, AlertTriangle } from "lucide-react"
import { Bar, BarChart, Cell, XAxis, ReferenceLine } from "recharts"
import { AnimatePresence } from "motion/react"
import { useSpring, useMotionValueEvent } from "motion/react"
import { ChartConfig, ChartContainer } from "@/components/ui/chart"
import { Badge } from "@/components/ui/badge"
import type { Tarea, Area } from "@/lib/types"
import { AREAS } from "@/lib/types"
import { calcularEstado } from "@/lib/helpers"

const CHART_MARGIN = 35

interface VencimientoChartProps {
  tareas: Tarea[]
}

// Colores únicos por área
const AREA_COLORS: Record<Area, string> = {
  Seguridad: "#EF4444", // Rojo
  Comunidades: "#3B82F6", // Azul
  Legal: "#10B981", // Verde
  Mantenimiento: "#F59E0B", // Amarillo/Naranja
  "Medio Ambiente": "#8B5CF6", // Púrpura
  Operaciones: "#EC4899", // Rosa
  Calidad: "#06B6D4", // Cian
  Compras: "#84CC16", // Lima
}

interface CustomReferenceLabelProps {
  viewBox?: {
    x?: number
    y?: number
  }
  value: number
}

const CustomReferenceLabel: React.FC<CustomReferenceLabelProps> = (props) => {
  const { viewBox, value } = props
  const x = viewBox?.x ?? 0
  const y = viewBox?.y ?? 0

  const width = React.useMemo(() => {
    const characterWidth = 8
    const padding = 10
    return value.toString().length * characterWidth + padding
  }, [value])

  return (
    <>
      <rect
        x={x - CHART_MARGIN}
        y={y - 9}
        width={width}
        height={18}
        fill="var(--color-secondary-foreground)"
        rx={4}
      />
      <text
        fontWeight={600}
        x={x - CHART_MARGIN + 6}
        y={y + 4}
        fill="var(--color-primary-foreground)"
        fontSize={12}
      >
        {value}
      </text>
    </>
  )
}

export function VencimientoChart({ tareas }: VencimientoChartProps) {
  const [activeIndex, setActiveIndex] = React.useState<number | undefined>(undefined)

  // Calcular tareas por vencer agrupadas por área
  const chartData = useMemo(() => {
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)

    // Inicializar contador por área
    const tareasPorArea: Record<Area, number> = {
      Seguridad: 0,
      Comunidades: 0,
      Legal: 0,
      Mantenimiento: 0,
      "Medio Ambiente": 0,
      Operaciones: 0,
      Calidad: 0,
      Compras: 0,
    }

    tareas.forEach((t) => {
      const estado = calcularEstado(t)
      if (estado === "Finalizado") return

      const fechaFin = new Date(t.fechaFin)
      fechaFin.setHours(0, 0, 0, 0)

      // Solo contar tareas que aún no han vencido
      if (fechaFin >= hoy) {
        // Una tarea puede tener múltiples áreas, contar en cada una
        t.areas.forEach((area) => {
          if (tareasPorArea[area] !== undefined) {
            tareasPorArea[area]++
          }
        })
      }
    })

    // Convertir a array y filtrar áreas con tareas
    return AREAS.map((area) => ({
      area,
      cantidad: tareasPorArea[area],
      color: AREA_COLORS[area],
    })).filter((item) => item.cantidad > 0)
  }, [tareas])

  const total = useMemo(
    () => chartData.reduce((acc, item) => acc + item.cantidad, 0),
    [chartData]
  )

  const urgentes = useMemo(() => {
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    const finSemana = new Date(hoy)
    finSemana.setDate(finSemana.getDate() + 7)

    return tareas.filter((t) => {
      const estado = calcularEstado(t)
      if (estado === "Finalizado") return false
      const fechaFin = new Date(t.fechaFin)
      fechaFin.setHours(0, 0, 0, 0)
      return fechaFin >= hoy && fechaFin <= finSemana
    }).length
  }, [tareas])

  const maxValueIndex = useMemo(() => {
    if (activeIndex !== undefined && chartData[activeIndex]) {
      return { index: activeIndex, value: chartData[activeIndex].cantidad }
    }
    return chartData.reduce(
      (max, data, index) => {
        return data.cantidad > max.value ? { index, value: data.cantidad } : max
      },
      { index: 0, value: 0 }
    )
  }, [activeIndex, chartData])

  const maxValueIndexSpring = useSpring(maxValueIndex.value, {
    stiffness: 100,
    damping: 20,
  })

  const [springyValue, setSpringyValue] = React.useState(maxValueIndex.value)

  useMotionValueEvent(maxValueIndexSpring, "change", (latest) => {
    setSpringyValue(Number(latest.toFixed(0)))
  })

  React.useEffect(() => {
    maxValueIndexSpring.set(maxValueIndex.value)
  }, [maxValueIndex.value, maxValueIndexSpring])

  const promedio = useMemo(() => {
    return Math.round(total / chartData.length) || 0
  }, [total, chartData.length])

  // Crear chartConfig dinámico para cada área
  const chartConfig = useMemo(() => {
    const config: ChartConfig = {}
    chartData.forEach((item) => {
      config[item.area] = {
        label: item.area,
        color: item.color,
      }
    })
    return config
  }, [chartData])

  if (chartData.length === 0) {
    return (
      <div className="relative bg-white rounded-xl overflow-hidden shadow-sm flex flex-col">
        <div
          className="h-2 w-full"
          style={{ background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)" }}
        />
        <div className="px-6 pt-5 pb-0 flex flex-col">
          <div className="items-center pb-0">
            <h3 className="text-base text-foreground font-semibold">Tareas por Vencer</h3>
          </div>
        </div>
        <div className="px-6 pb-6 flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground">No hay tareas pendientes de vencer</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative bg-white rounded-xl overflow-hidden shadow-sm flex flex-col">
      <div
        className="h-2 w-full"
        style={{ background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)" }}
      />
      <div className="px-6 pt-5 pb-0 flex flex-col">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-base font-semibold text-[#111827] mb-1">
                Tareas por Vencer
                {urgentes > 0 && (
                  <Badge
                    variant="outline"
                    className="text-red-500 bg-red-500/10 border-none ml-2"
                  >
                    <AlertTriangle className="h-3 w-3" />
                    <span className="ml-1">{urgentes} urgentes</span>
                  </Badge>
                )}
              </h3>
              <p className="text-sm text-[#6B7280]">Distribución por área</p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold tracking-tight text-[#111827]">
                {maxValueIndex.value}
              </span>
              <Badge variant="secondary" className="gap-1 text-xs px-1.5 py-0.5">
                <TrendingUp className="h-2.5 w-2.5" />
                <span>{promedio}</span>
              </Badge>
            </div>
          </div>
        </div>
      </div>
      <div className="px-6 pb-4 flex-1 min-h-[200px]">
        <AnimatePresence mode="wait">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <BarChart
              accessibilityLayer
              data={chartData}
              onMouseLeave={() => setActiveIndex(undefined)}
              margin={{
                left: CHART_MARGIN,
                top: 30,
                right: 10,
                bottom: 10,
              }}
            >
              <XAxis
                dataKey="area"
                tickLine={false}
                tickMargin={8}
                axisLine={false}
                tick={{ fill: "#6B7280", fontSize: 11 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <Bar dataKey="cantidad" radius={[4, 4, 0, 0]}>
                {chartData.map((item, index) => (
                  <Cell
                    key={item.area}
                    fill={item.color}
                    className="duration-200"
                    opacity={index === maxValueIndex.index ? 1 : 0.2}
                    onMouseEnter={() => setActiveIndex(index)}
                  />
                ))}
              </Bar>
              <ReferenceLine
                opacity={0.4}
                y={springyValue}
                stroke="var(--color-secondary-foreground)"
                strokeWidth={1}
                strokeDasharray="3 3"
                label={<CustomReferenceLabel value={maxValueIndex.value} />}
              />
            </BarChart>
          </ChartContainer>
        </AnimatePresence>
      </div>
    </div>
  )
}
