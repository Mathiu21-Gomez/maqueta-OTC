"use client"

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Badge } from "@/components/ui/badge"
import { TrendingUp } from "lucide-react"
import type { Area } from "@/lib/types"

interface AreaChartProps {
  data: Array<{ area: Area; avance: number; cantidad: number; realizadas: number }>
}

const chartConfig = {
  area: { label: "Área" },
  cantidad: {
    label: "Total tareas",
    color: "#3B82F6",
  },
  realizadas: {
    label: "Tareas realizadas",
    color: "#10B981",
  },
} satisfies ChartConfig

export function AreaChart({ data }: AreaChartProps) {
  const chartData = [...data].sort((a, b) => b.cantidad - a.cantidad)

  const promedioAvance =
    chartData.length > 0
      ? Math.round(chartData.reduce((acc, item) => acc + item.avance, 0) / chartData.length)
      : 0

  if (chartData.length === 0) {
    return (
      <div className="relative bg-white rounded-xl overflow-hidden shadow-sm flex flex-col">
        <div
          className="h-2 w-full"
          style={{ background: "linear-gradient(135deg, #10B981 0%, #059669 100%)" }}
        />
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
      <div
        className="h-2 w-full"
        style={{ background: "linear-gradient(135deg, #10B981 0%, #059669 100%)" }}
      />
      <div className="px-6 pt-5 pb-0 flex flex-col">
        <div className="items-center pb-0">
          <h3 className="text-base font-semibold">
            Cumplimiento por Área
            <Badge
              variant="outline"
              className={`${promedioAvance >= 70 ? "text-green-500 bg-green-500/10" : "text-amber-500 bg-amber-500/10"} border-none ml-2`}
            >
              <TrendingUp className="h-4 w-4" />
              <span>{promedioAvance}% promedio</span>
            </Badge>
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Total tareas vs realizadas por área
          </p>
        </div>
      </div>
      <div className="px-6 pb-6 flex-1">
        <ChartContainer
          config={chartConfig}
          className="[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground mx-auto h-[280px] w-full"
        >
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#E5E7EB"
              vertical={false}
            />
            <XAxis
              dataKey="area"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fill: "#6B7280", fontSize: 11 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#6B7280", fontSize: 11 }}
            />
            <ChartTooltip
              content={<ChartTooltipContent nameKey="area" />}
            />
            <Line
              type="monotone"
              dataKey="cantidad"
              stroke="var(--color-cantidad)"
              strokeWidth={2}
              dot={{ r: 4, fill: "var(--color-cantidad)" }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="realizadas"
              stroke="var(--color-realizadas)"
              strokeWidth={2}
              dot={{ r: 4, fill: "var(--color-realizadas)" }}
              activeDot={{ r: 6 }}
              strokeDasharray="5 5"
            />
          </LineChart>
        </ChartContainer>
        {/* Leyenda */}
        <div className="flex flex-wrap justify-center gap-6 mt-4">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <span className="inline-block w-4 h-1 shrink-0 rounded-full bg-[#3B82F6]" />
            <span>Total tareas</span>
          </div>
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <span
              className="inline-block w-4 shrink-0 rounded-sm border-b-2 border-dashed border-[#10B981]"
              style={{ height: 4 }}
            />
            <span>Tareas realizadas</span>
          </div>
        </div>
      </div>
    </div>
  )
}
