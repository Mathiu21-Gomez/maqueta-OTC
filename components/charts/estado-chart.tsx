"use client"

import { LabelList, Pie, PieChart } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown } from "lucide-react"
import type { EstadoTarea } from "@/lib/types"

const chartConfig = {
  tareas: {
    label: "Tareas",
  },
  Finalizado: {
    label: "Finalizado",
    color: "#10B981",
  },
  "En curso": {
    label: "En curso",
    color: "#3B82F6",
  },
  Planificado: {
    label: "Planificado",
    color: "#F59E0B",
  },
  Atrasado: {
    label: "Atrasado",
    color: "#EF4444",
  },
} satisfies ChartConfig

interface EstadoChartProps {
  data: Record<EstadoTarea, number>
}

export function EstadoChart({ data }: EstadoChartProps) {
  const chartData = Object.entries(data)
    .map(([name, value]) => ({ 
      estado: name, 
      tareas: value, 
      fill: `var(--color-${name.replace(" ", "-")})` 
    }))
    .filter((item) => item.tareas > 0)

  const total = Object.values(data).reduce((a, b) => a + b, 0)
  const finalizados = data.Finalizado || 0
  const porcentajeCompletado = total > 0 ? Math.round((finalizados / total) * 100) : 0
  const tendenciaPositiva = porcentajeCompletado >= 50

  if (total === 0) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle className="text-base text-foreground">Distribución por Estado</CardTitle>
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
          Distribución por Estado
          <Badge
            variant="outline"
            className={`${tendenciaPositiva ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'} border-none ml-2`}
          >
            {tendenciaPositiva ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            <span>{porcentajeCompletado}% completado</span>
          </Badge>
        </CardTitle>
        <CardDescription>Total: {total} tareas</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-4">
        <ChartContainer
          config={chartConfig}
          className="[&_.recharts-text]:fill-background mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent nameKey="estado" hideLabel />}
            />
            <Pie
              data={chartData}
              innerRadius={30}
              dataKey="tareas"
              nameKey="estado"
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
