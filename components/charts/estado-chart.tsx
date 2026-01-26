"use client"

import { LabelList, Pie, PieChart } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown } from "lucide-react"
import type { EstadoTarea } from "@/lib/types"

// Rojo -> Atrasado | Azul -> Finalizado (Listo) | Amarillo -> En curso (Proceso)
const ESTADO_COLORS: Record<string, { color: string; label: string }> = {
  Atrasado: { color: "#EF4444", label: "Atrasado" },
  Finalizado: { color: "#3B82F6", label: "Listo" },
  "En curso": { color: "#EAB308", label: "Proceso" },
  Planificado: { color: "#94A3B8", label: "Planificado" },
}

const chartConfig = {
  tareas: { label: "Tareas" },
  ...Object.fromEntries(
    Object.entries(ESTADO_COLORS).map(([k, v]) => [k, { label: v.label, color: v.color }])
  ),
} satisfies ChartConfig

interface EstadoChartProps {
  data: Record<EstadoTarea, number>
}

export function EstadoChart({ data }: EstadoChartProps) {
  const chartData = Object.entries(data)
    .map(([name, value]) => ({
      estado: name,
      tareas: value,
      fill: ESTADO_COLORS[name]?.color ?? "#94A3B8",
    }))
    .filter((item) => item.tareas > 0)

  const total = Object.values(data).reduce((a, b) => a + b, 0)
  const finalizados = data.Finalizado || 0
  const porcentajeCompletado = total > 0 ? Math.round((finalizados / total) * 100) : 0
  const tendenciaPositiva = porcentajeCompletado >= 50

  if (total === 0) {
    return (
      <div className="relative bg-white rounded-xl overflow-hidden shadow-sm flex flex-col">
        <div className="h-2 w-full" style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)' }} />
        <div className="px-6 pt-5 pb-0 flex flex-col">
          <div className="items-center pb-0">
            <h3 className="text-base text-foreground font-semibold">Distribución por Estado</h3>
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
      <div className="h-2 w-full" style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)' }} />
      <div className="px-6 pt-5 pb-0 flex flex-col">
        <div className="items-center pb-0">
          <h3 className="text-base font-semibold">
            Distribución por Estado
            <Badge
              variant="outline"
              className={`${tendenciaPositiva ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'} border-none ml-2`}
            >
              {tendenciaPositiva ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              <span>{porcentajeCompletado}% completado</span>
            </Badge>
          </h3>
          <p className="text-sm text-muted-foreground mt-1">Total: {total} tareas</p>
        </div>
      </div>
      <div className="px-6 pb-6 flex-1">
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
        {/* Leyenda */}
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          {chartData.map((item) => (
            <div
              key={item.estado}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground"
            >
              <span
                className="inline-block w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: item.fill }}
              />
              <span>{ESTADO_COLORS[item.estado]?.label ?? item.estado}</span>
              <span className="font-medium text-foreground">({item.tareas})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
