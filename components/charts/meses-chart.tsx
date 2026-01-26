"use client"

import React, { useMemo } from "react"
import { TrendingUp } from "lucide-react"
import { Bar, BarChart, Cell, XAxis, ReferenceLine } from "recharts"
import { AnimatePresence } from "motion/react"
import { useSpring, useMotionValueEvent } from "motion/react"
import { ChartConfig, ChartContainer } from "@/components/ui/chart"
import { Badge } from "@/components/ui/badge"
import { MESES } from "@/lib/types"

const CHART_MARGIN = 35

interface MesesChartProps {
  data: Array<{
    mes: number
    Planificado: number
    "En curso": number
    Finalizado: number
    Atrasado: number
  }>
}

const chartConfig = {
  total: {
    label: "Total Tareas",
    color: "var(--color-chart-2)",
  },
} satisfies ChartConfig

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

export function MesesChart({ data }: MesesChartProps) {
  const [activeIndex, setActiveIndex] = React.useState<number | undefined>(undefined)

  // Transformar datos para mostrar total de tareas por mes
  const chartData = useMemo(() => {
    return data
      .map((item) => {
        const total = item.Planificado + item["En curso"] + item.Finalizado + item.Atrasado
        return {
          mes: MESES[item.mes]?.substring(0, 3) || "",
          total,
        }
      })
      .filter((item) => item.total > 0)
  }, [data])

  const total = useMemo(
    () => chartData.reduce((acc, item) => acc + item.total, 0),
    [chartData]
  )

  const maxValueIndex = useMemo(() => {
    if (activeIndex !== undefined && chartData[activeIndex]) {
      return { index: activeIndex, value: chartData[activeIndex].total }
    }
    return chartData.reduce(
      (max, data, index) => {
        return data.total > max.value ? { index, value: data.total } : max
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

  if (chartData.length === 0) {
    return (
      <div className="relative bg-white rounded-xl overflow-hidden shadow-sm flex flex-col">
        <div
          className="h-2 w-full"
          style={{ background: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)" }}
        />
        <div className="px-6 pt-5 pb-0 flex flex-col">
          <div className="items-center pb-0">
            <h3 className="text-base text-foreground font-semibold">Tareas por Mes</h3>
          </div>
        </div>
        <div className="px-6 pb-6 flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground">No hay datos disponibles</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative bg-white rounded-xl overflow-hidden shadow-sm flex flex-col">
      <div
        className="h-2 w-full"
        style={{ background: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)" }}
      />
      <div className="px-6 pt-5 pb-0 flex flex-col">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-base font-semibold text-[#111827] mb-1">
                Tareas por Mes
              </h3>
              <p className="text-sm text-[#6B7280]">Distribución de tareas por mes</p>
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
                dataKey="mes"
                tickLine={false}
                tickMargin={8}
                axisLine={false}
                tick={{ fill: "#6B7280", fontSize: 11 }}
              />
              <Bar dataKey="total" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]}>
                {chartData.map((_, index) => (
                  <Cell
                    className="duration-200"
                    opacity={index === maxValueIndex.index ? 1 : 0.2}
                    key={index}
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
      {/* Leyenda */}
      <div className="px-6 pb-6">
        <div className="flex flex-wrap justify-center gap-4">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <span
              className="inline-block w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: "#3B82F6" }}
            />
            <span>Total de tareas</span>
          </div>
        </div>
      </div>
    </div>
  )
}
