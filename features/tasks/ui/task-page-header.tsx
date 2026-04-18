import type { ReactNode } from 'react'

import { Badge } from '@/components/ui/badge'

interface TaskPageHeaderProps {
  actions?: ReactNode
  description: string
  eyebrow?: string
  meta?: Array<{ label: string; value: string }>
  narrative?: string
  title: string
}

export function TaskPageHeader({ actions, description, eyebrow, meta, narrative, title }: TaskPageHeaderProps) {
  return (
    <div className="otc-executive-hero rounded-[calc(var(--radius)+0.5rem)] px-5 py-5 sm:px-6 sm:py-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.9fr)]">
        <div className="space-y-5">
          <div className="space-y-3">
            {eyebrow ? (
              <Badge variant="outline" className="otc-glass-badge w-fit rounded-full border-border/70 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                {eyebrow}
              </Badge>
            ) : null}
            <div className="space-y-3">
              <h1 className="otc-page-title text-4xl font-semibold text-foreground sm:text-5xl">{title}</h1>
              <p className="max-w-3xl text-sm leading-7 text-muted-foreground sm:text-[0.95rem]">{description}</p>
            </div>
          </div>

          {meta && meta.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-3">
              {meta.map((item) => (
                <div key={item.label} className="otc-sheet-rail rounded-[calc(var(--radius)+0.125rem)] px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{item.label}</p>
                  <p className="mt-2 text-lg font-semibold text-foreground otc-data-text">{item.value}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="otc-sheet-rail flex flex-col justify-between gap-4 rounded-[calc(var(--radius)+0.125rem)] p-4 sm:p-5">
          <div className="space-y-2">
            <p className="otc-section-kicker">Lectura sugerida</p>
            <p className="text-sm leading-6 text-muted-foreground">{narrative ?? 'Abri primero el frente con mayor desvio y despues baja al detalle solo si hace falta intervenir.'}</p>
          </div>
          {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
        </div>
      </div>
    </div>
  )
}
