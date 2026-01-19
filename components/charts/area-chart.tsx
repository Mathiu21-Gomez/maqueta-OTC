"use client"

import { LabelList, Pie, PieChart } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Badge } from "@/components/ui/badge"
import { TrendingUp } from "lucide-react"
import type { Area } from "@/lib/types"

interface AreaChartProps {
  data: Array<{ area: Area; avance: number; cantidad: number }>
}

function getBarColor(avance: number): string {
  if (avance >= 90) return "#10B981"
  if (avance >= 70) return "#F59E0B"
  return "#EF4444"
}

export function AreaChart({ data }: AreaChartProps) {
  const sortedData = [...data]
    .sort((a, b) => b.avance - a.avance)
    .map((item) => ({
      ...item,
      fill: getBarColor(item.avance),
    }))

  // Generar config dinámico para las áreas
  const dynamicConfig = sortedData.reduce((acc, item) => {
    acc[item.area] = {
      label: item.area,
      color: item.fill,
    }
    return acc
  }, { avance: { label: "Avance %" } } as ChartConfig)

  const promedioAvance = sortedData.length > 0
    ? Math.round(sortedData.reduce((acc, item) => acc + item.avance, 0) / sortedData.length)
    : 0

  if (sortedData.length === 0) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle className="text-base text-foreground">Cumplimiento por Área</CardTitle>
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
          Cumplimiento por Área
          <Badge
            variant="outline"
            className={`${promedioAvance >= 70 ? 'text-green-500 bg-green-500/10' : 'text-amber-500 bg-amber-500/10'} border-none ml-2`}
          >
            <TrendingUp className="h-4 w-4" />
            <span>{promedioAvance}% promedio</span>
          </Badge>
        </CardTitle>
        <CardDescription>{sortedData.length} áreas analizadas</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-4">
        <ChartContainer
          config={dynamicConfig}
          className="[&_.recharts-text]:fill-background mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent nameKey="area" hideLabel />}
            />
            <Pie
              data={sortedData}
              innerRadius={30}
              dataKey="avance"
              nameKey="area"
              cornerRadius={8}
              paddingAngle={4}
            >
              <LabelList
                dataKey="avance"
                stroke="none"
                fontSize={12}
                fontWeight={500}
                fill="currentColor"
                formatter={(value: number) => `${value}%`}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
