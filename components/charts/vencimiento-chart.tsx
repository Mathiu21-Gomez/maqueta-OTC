"use client"

import { useMemo } from "react"
import { LabelList, Pie, PieChart } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle } from "lucide-react"
import type { Tarea } from "@/lib/types"
import { calcularEstado } from "@/lib/helpers"

interface VencimientoChartProps {
  tareas: Tarea[]
}

const chartConfig = {
  cantidad: {
    label: "Tareas",
  },
  "Esta semana": {
    label: "Esta semana",
    color: "#EF4444",
  },
  "Próxima semana": {
    label: "Próxima semana",
    color: "#F59E0B",
  },
  "Este mes": {
    label: "Este mes",
    color: "#3B82F6",
  },
  "Más adelante": {
    label: "Más adelante",
    color: "#10B981",
  },
} satisfies ChartConfig

export function VencimientoChart({ tareas }: VencimientoChartProps) {
  const chartData = useMemo(() => {
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)

    const finSemana = new Date(hoy)
    finSemana.setDate(finSemana.getDate() + 7)

    const finProximaSemana = new Date(hoy)
    finProximaSemana.setDate(finProximaSemana.getDate() + 14)

    const finMes = new Date(hoy)
    finMes.setDate(finMes.getDate() + 30)

    let estaSemana = 0
    let proximaSemana = 0
    let esteMes = 0
    let masAdelante = 0

    tareas.forEach((t) => {
      const estado = calcularEstado(t)
      if (estado === "Finalizado") return

      const fechaFin = new Date(t.fechaFin)
      fechaFin.setHours(0, 0, 0, 0)

      if (fechaFin < hoy) return // Ignorar vencidas

      if (fechaFin <= finSemana) {
        estaSemana++
      } else if (fechaFin <= finProximaSemana) {
        proximaSemana++
      } else if (fechaFin <= finMes) {
        esteMes++
      } else {
        masAdelante++
      }
    })

    return [
      { periodo: "Esta semana", cantidad: estaSemana, fill: "var(--color-Esta-semana)" },
      { periodo: "Próxima semana", cantidad: proximaSemana, fill: "var(--color-Próxima-semana)" },
      { periodo: "Este mes", cantidad: esteMes, fill: "var(--color-Este-mes)" },
      { periodo: "Más adelante", cantidad: masAdelante, fill: "var(--color-Más-adelante)" },
    ].filter((item) => item.cantidad > 0)
  }, [tareas])

  const total = chartData.reduce((acc, item) => acc + item.cantidad, 0)
  const urgentes = chartData.find(d => d.periodo === "Esta semana")?.cantidad || 0

  if (chartData.length === 0) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle className="text-base text-foreground">Tareas por Vencer</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground">No hay tareas pendientes de vencer</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-base">
          Tareas por Vencer
          {urgentes > 0 && (
            <Badge
              variant="outline"
              className="text-red-500 bg-red-500/10 border-none ml-2"
            >
              <AlertTriangle className="h-4 w-4" />
              <span>{urgentes} urgentes</span>
            </Badge>
          )}
        </CardTitle>
        <CardDescription>{total} tareas pendientes en total</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-4">
        <ChartContainer
          config={chartConfig}
          className="[&_.recharts-text]:fill-background mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent nameKey="periodo" hideLabel />}
            />
            <Pie
              data={chartData}
              innerRadius={30}
              dataKey="cantidad"
              nameKey="periodo"
              cornerRadius={8}
              paddingAngle={4}
            >
              <LabelList
                dataKey="cantidad"
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
