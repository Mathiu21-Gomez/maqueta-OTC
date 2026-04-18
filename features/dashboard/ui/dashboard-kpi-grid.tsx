'use client'

import type { LucideIcon } from 'lucide-react'
import { AlertCircle, ClipboardList, Clock3, TrendingUp } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface DashboardKpiGridProps {
  avanceGeneral: number
  diasPromedio: number
  pendientes: number
  total: number
  totalFinalizadas: number
  totalAtrasadas: number
}

interface KpiItem {
  accent: string
  detail: string
  description: string
  icon: LucideIcon
  title: string
  value: string
}

export function DashboardKpiGrid({
  avanceGeneral,
  diasPromedio,
  pendientes,
  total,
  totalAtrasadas,
  totalFinalizadas,
}: DashboardKpiGridProps) {
  const items: KpiItem[] = [
    {
      accent: 'linear-gradient(135deg,var(--chart-2),#4c81ad)',
      description: `${totalFinalizadas} finalizadas`,
      detail: 'Volumen consolidado sobre el pipeline operativo activo.',
      icon: ClipboardList,
      title: 'Total tareas',
      value: total.toString(),
    },
    {
      accent: 'linear-gradient(135deg,var(--chart-5),#3f8d70)',
      description: `${totalAtrasadas} atrasadas`,
      detail: 'Pendientes con necesidad de seguimiento inmediato del equipo.',
      icon: AlertCircle,
      title: 'Pendientes',
      value: pendientes.toString(),
    },
    {
      accent: 'linear-gradient(135deg,var(--chart-1),#9f6037)',
      description: 'Promedio de avance actual',
      detail: 'Lectura ejecutiva del ritmo total comprometido por el tablero.',
      icon: TrendingUp,
      title: 'Avance general',
      value: `${avanceGeneral}%`,
    },
    {
      accent: 'linear-gradient(135deg,var(--chart-3),#9f6037)',
      description: 'Dias calendario por tarea',
      detail: 'Sirve para detectar friccion y capacidad antes del detalle por area.',
      icon: Clock3,
      title: 'Dias promedio',
      value: diasPromedio.toString(),
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon

        return (
          <Card
            key={item.title}
            className="otc-panel border-border/70"
            style={{ ['--otc-panel-accent' as string]: item.accent }}
          >
            <CardHeader className="gap-4 pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <span className="otc-section-kicker">Resumen</span>
                  <CardTitle className="text-base font-semibold text-foreground">{item.title}</CardTitle>
                </div>
                <div className="otc-kpi-icon flex size-11 items-center justify-center rounded-full text-primary">
                  <Icon className="size-5" aria-hidden="true" />
                </div>
              </div>
              <CardDescription className="max-w-sm text-sm leading-6">{item.detail}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="otc-metric-lockup">
                <p className="otc-metric-value otc-data-text">{item.value}</p>
                <p className="text-sm font-medium text-muted-foreground">{item.description}</p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
