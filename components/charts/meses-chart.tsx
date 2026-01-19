"use client"

import { LabelList, Pie, PieChart } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle className="text-base text-foreground">Tareas por Mes</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground">No hay datos disponibles</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-base">
          Tareas por Mes
          <Badge
            variant="outline"
            className="text-green-500 bg-green-500/10 border-none ml-2"
          >
            <TrendingUp className="h-4 w-4" />
            <span>{total} total</span>
          </Badge>
        </CardTitle>
        <CardDescription>Mes destacado: {mesConMasTareas.mes} ({mesConMasTareas.tareas} tareas)</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-4">
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
      </CardContent>
    </Card>
  )
}
