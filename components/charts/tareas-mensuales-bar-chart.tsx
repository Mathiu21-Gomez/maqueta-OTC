"use client"

import React, { useMemo } from "react"
import { TrendingUp } from "lucide-react"
import { Bar, BarChart, Cell, XAxis, ReferenceLine } from "recharts"
import { AnimatePresence } from "motion/react"
import { Badge } from "@/components/ui/badge"
import { ChartConfig, ChartContainer } from "@/components/ui/chart"
import { useSpring, useMotionValueEvent } from "motion/react"
import { MESES } from "@/lib/types"

const CHART_MARGIN = 35

interface TareasMensualesBarChartProps {
  data: Array<{
    mes: number
    Planificado: number
    "En curso": number
    Finalizado: number
    Atrasado: number
  }>
}

const chartConfigTotal = {
  total: {
    label: "Total Tareas",
    color: "var(--color-chart-2)",
  },
} satisfies ChartConfig

const chartConfigEnCurso = {
  enCurso: {
    label: "En Curso",
    color: "var(--color-chart-2)",
  },
} satisfies ChartConfig

const chartConfigPlanificado = {
  planificado: {
    label: "Planificado",
    color: "var(--color-chart-3)",
  },
} satisfies ChartConfig

function SingleBarChart({
  chartData,
  dataKey,
  title,
  subtitle,
  chartConfig,
  color,
}: {
  chartData: Array<{ mes: string; [key: string]: number | string }>
  dataKey: string
  title: string
  subtitle: string
  chartConfig: ChartConfig
  color: string
}) {
  const [activeIndex, setActiveIndex] = React.useState<number | undefined>(undefined)

  const maxValueIndex = useMemo(() => {
    if (activeIndex !== undefined && chartData[activeIndex]) {
      return { index: activeIndex, value: chartData[activeIndex][dataKey] as number }
    }
    return chartData.reduce(
      (max, data, index) => {
        const value = data[dataKey] as number
        return value > max.value ? { index, value } : max
      },
      { index: 0, value: 0 }
    )
  }, [activeIndex, chartData, dataKey])

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
    const total = chartData.reduce((acc, item) => acc + (item[dataKey] as number), 0)
    return Math.round(total / chartData.length) || 0
  }, [chartData, dataKey])

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="text-sm font-semibold text-[#111827]">{title}</h4>
          <p className="text-xs text-[#6B7280]">{subtitle}</p>
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
      <div className="flex-1 min-h-[200px]">
        <AnimatePresence mode="wait">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <BarChart
              accessibilityLayer
              data={chartData}
              onMouseLeave={() => setActiveIndex(undefined)}
              margin={{
                left: CHART_MARGIN,
                top: 10,
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
              <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]}>
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
    </div>
  )
}

export function TareasMensualesBarChart({ data }: TareasMensualesBarChartProps) {
  // Transformar datos para los 3 gráficos
  const chartDataTotal = useMemo(() => {
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

  const chartDataEnCurso = useMemo(() => {
    return data
      .map((item) => ({
        mes: MESES[item.mes]?.substring(0, 3) || "",
        enCurso: item["En curso"],
      }))
      .filter((item) => item.enCurso > 0)
  }, [data])

  const chartDataPlanificado = useMemo(() => {
    return data
      .map((item) => ({
        mes: MESES[item.mes]?.substring(0, 3) || "",
        planificado: item.Planificado,
      }))
      .filter((item) => item.planificado > 0)
  }, [data])

  const hasData = chartDataTotal.length > 0 || chartDataEnCurso.length > 0 || chartDataPlanificado.length > 0

  if (!hasData) {
    return (
      <div className="relative bg-white rounded-xl overflow-hidden shadow-sm flex flex-col">
        <div className="h-2 w-full" style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)' }} />
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
      <div className="h-2 w-full" style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)' }} />
      <div className="px-6 pt-5 pb-0 flex flex-col">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-[#111827] mb-1">
            Tareas por Mes
          </h3>
          <p className="text-sm text-[#6B7280]">Distribución de tareas por mes</p>
        </div>
      </div>
      <div className="px-6 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Gráfico Total */}
          {chartDataTotal.length > 0 && (
            <SingleBarChart
              chartData={chartDataTotal}
              dataKey="total"
              title="Total"
              subtitle="Todas las tareas"
              chartConfig={chartConfigTotal}
              color="var(--color-chart-2)"
            />
          )}

          {/* Gráfico En Curso */}
          {chartDataEnCurso.length > 0 && (
            <SingleBarChart
              chartData={chartDataEnCurso}
              dataKey="enCurso"
              title="En Curso"
              subtitle="Tareas activas"
              chartConfig={chartConfigEnCurso}
              color="var(--color-chart-2)"
            />
          )}

          {/* Gráfico Planificado */}
          {chartDataPlanificado.length > 0 && (
            <SingleBarChart
              chartData={chartDataPlanificado}
              dataKey="planificado"
              title="Planificado"
              subtitle="Tareas programadas"
              chartConfig={chartConfigPlanificado}
              color="var(--color-chart-3)"
            />
          )}
        </div>
      </div>
    </div>
  )
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
