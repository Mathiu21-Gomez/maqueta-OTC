import type { LucideIcon } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface SummaryItem {
  accent: string
  description: string
  icon: LucideIcon
  title: string
  value: string
}

interface TaskSummaryCardsProps {
  items: SummaryItem[]
}

export function TaskSummaryCards({ items }: TaskSummaryCardsProps) {
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
                  <span className="otc-section-kicker">Indicador</span>
                  <CardTitle className="text-base font-semibold text-foreground">{item.title}</CardTitle>
                </div>
                <div className="otc-kpi-icon flex size-11 items-center justify-center rounded-full text-primary">
                  <Icon className="size-5" aria-hidden="true" />
                </div>
              </div>
              <CardDescription className="max-w-sm text-sm leading-6">{item.description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="otc-metric-value otc-data-text">{item.value}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
