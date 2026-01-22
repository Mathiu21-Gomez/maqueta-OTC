"use client"

import { LabelList, Pie, PieChart } from "recharts"
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
      <div className="relative bg-white rounded-xl overflow-hidden shadow-sm flex flex-col">
        <div className="h-2 w-full" style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }} />
        <div className="px-6 pt-5 pb-0 flex flex-col">
          <div className="items-center pb-0">
            <h3 className="text-base text-foreground font-semibold">Cumplimiento por Área</h3>
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
      <div className="h-2 w-full" style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }} />
      <div className="px-6 pt-5 pb-0 flex flex-col">
        <div className="items-center pb-0">
          <h3 className="text-base font-semibold">
            Cumplimiento por Área
            <Badge
              variant="outline"
              className={`${promedioAvance >= 70 ? 'text-green-500 bg-green-500/10' : 'text-amber-500 bg-amber-500/10'} border-none ml-2`}
            >
              <TrendingUp className="h-4 w-4" />
              <span>{promedioAvance}% promedio</span>
            </Badge>
          </h3>
          <p className="text-sm text-muted-foreground mt-1">{sortedData.length} áreas analizadas</p>
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
      </div>
    </div>
  )
}
