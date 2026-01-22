"use client"

import { LabelList, Pie, PieChart } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Badge } from "@/components/ui/badge"
import { TrendingUp } from "lucide-react"
import { MESES } from "@/lib/types"

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
  tareas: {
    label: "Tareas",
  },
} satisfies ChartConfig

export function MesesChart({ data }: MesesChartProps) {
  // Transformar datos para mostrar total de tareas por mes
  const chartData = data
    .map((item, index) => {
      const total = item.Planificado + item["En curso"] + item.Finalizado + item.Atrasado
      return {
        mes: MESES[item.mes].substring(0, 3),
        tareas: total,
        fill: `hsl(${(index * 60) % 360}, 70%, 50%)`,
      }
    })
    .filter((item) => item.tareas > 0)

  const total = chartData.reduce((acc, item) => acc + item.tareas, 0)
  const mesConMasTareas = chartData.reduce((max, item) =>
    item.tareas > max.tareas ? item : max, chartData[0] || { mes: '', tareas: 0 }
  )

  // Generar config dinámico para los meses
  const dynamicConfig = chartData.reduce((acc, item, index) => {
    acc[item.mes] = {
      label: item.mes,
      color: `hsl(${(index * 60) % 360}, 70%, 50%)`,
    }
    return acc
  }, { tareas: { label: "Tareas" } } as ChartConfig)

  if (chartData.length === 0) {
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
        <div className="items-center pb-0">
          <h3 className="text-base font-semibold">
            Tareas por Mes
            <Badge
              variant="outline"
              className="text-green-500 bg-green-500/10 border-none ml-2"
            >
              <TrendingUp className="h-4 w-4" />
              <span>{total} total</span>
            </Badge>
          </h3>
          <p className="text-sm text-muted-foreground mt-1">Mes destacado: {mesConMasTareas.mes} ({mesConMasTareas.tareas} tareas)</p>
        </div>
      </div>
      <div className="px-6 pb-6 flex-1">
        <ChartContainer
          config={dynamicConfig}
          className="[&_.recharts-text]:fill-background mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent nameKey="mes" hideLabel />}
            />
            <Pie
              data={chartData}
              innerRadius={30}
              dataKey="tareas"
              nameKey="mes"
              cornerRadius={8}
              paddingAngle={4}
            >
              <LabelList
                dataKey="tareas"
                stroke="none"
                fontSize={12}
                fontWeight={500}
                fill="currentColor"
                formatter={(value: number) => value.toString()}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </div>
    </div>
  )
}
