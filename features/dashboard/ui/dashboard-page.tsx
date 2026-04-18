'use client'

import { startTransition, useMemo, useState } from 'react'
import { ArrowRight, PlusCircle } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AreaChart } from '@/components/charts/area-chart'
import { EstadoChart } from '@/components/charts/estado-chart'
import { MesesChart } from '@/components/charts/meses-chart'
import { TiempoPromedioChart } from '@/components/charts/tiempo-promedio-chart'
import { VencimientoChart } from '@/components/charts/vencimiento-chart'
import {
  buildDashboardViewModel,
  DEFAULT_DASHBOARD_FILTERS,
  filterDashboardTasks,
} from '@/features/dashboard/application/dashboard.selectors'
import { DashboardFiltersPanel } from '@/features/dashboard/ui/dashboard-filters'
import { DashboardKpiGrid } from '@/features/dashboard/ui/dashboard-kpi-grid'
import { useShellStore } from '@/features/shell/application/shell.store'
import { selectTasks } from '@/features/tasks/application/task.selectors'
import { useTaskStore } from '@/features/tasks/application/task.store'

export function DashboardPage() {
  const tasks = useTaskStore(selectTasks)
  const setNuevaTareaSheetOpen = useShellStore((state) => state.setNuevaTareaSheetOpen)
  const [filters, setFilters] = useState(DEFAULT_DASHBOARD_FILTERS)

  const filteredTasks = useMemo(() => filterDashboardTasks(tasks, filters), [tasks, filters])
  const viewModel = useMemo(() => buildDashboardViewModel(filteredTasks), [filteredTasks])
  const updatedAt = useMemo(
    () => new Intl.DateTimeFormat('es-CL', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date()),
    [],
  )
  const operationalFocus = useMemo(() => {
    if (viewModel.kpis.porEstado.Atrasado > 0) return 'Recuperar tareas atrasadas antes del siguiente corte.'
    if (viewModel.kpis.porEstado['En curso'] > 0) return 'Consolidar avance de las tareas activas para sostener el ritmo.'
    return 'La cartera mantiene estabilidad; el foco puede pasar a cierre y evidencia.'
  }, [viewModel.kpis.porEstado])
  const heroStats = useMemo(
    () => [
      { label: 'Pipeline visible', value: `${viewModel.kpis.total} iniciativas` },
      { label: 'Avance consolidado', value: `${viewModel.kpis.avanceGeneral}%` },
      { label: 'Riesgo inmediato', value: `${viewModel.kpis.porEstado.Atrasado} atrasadas` },
    ],
    [viewModel.kpis.avanceGeneral, viewModel.kpis.porEstado.Atrasado, viewModel.kpis.total],
  )

  return (
    <div className="otc-grid-shell flex flex-col gap-6 rounded-[calc(var(--radius)+0.5rem)] p-1">
      <section className="otc-executive-hero rounded-[calc(var(--radius)+0.5rem)] px-5 py-5 sm:px-6 sm:py-6">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.9fr)]">
          <div className="space-y-5">
            <div className="space-y-3">
              <span className="otc-section-kicker">Resumen ejecutivo</span>
              <div className="space-y-3">
                <h1 className="otc-section-title text-4xl font-semibold text-foreground sm:text-5xl">Dashboard de cartera OTC</h1>
                <p className="max-w-3xl text-sm leading-7 text-muted-foreground sm:text-[0.95rem]">
                  La primera lectura concentra salud del portafolio, desviaciones prioritarias y el siguiente frente operativo sin obligarte a bajar al detalle.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {heroStats.map((item) => (
                <div key={item.label} className="otc-sheet-rail rounded-[calc(var(--radius)+0.125rem)] px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{item.label}</p>
                  <p className="mt-2 text-lg font-semibold text-foreground otc-data-text">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="otc-sheet-rail rounded-[calc(var(--radius)+0.125rem)] p-4 sm:p-5">
            <div className="flex h-full flex-col justify-between gap-5">
              <div className="space-y-3">
                <Badge variant="outline" className="otc-glass-badge w-fit rounded-full border-border/70 px-3 py-1 text-xs text-muted-foreground">
                  Actualizado {updatedAt}
                </Badge>
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Siguiente foco</p>
                  <p className="text-base font-semibold leading-6 text-foreground">{operationalFocus}</p>
                </div>
              </div>

              <Button onClick={() => startTransition(() => setNuevaTareaSheetOpen(true))}>
                <PlusCircle data-icon="inline-start" />
                Nueva tarea
              </Button>
            </div>
          </div>
        </div>
      </section>

      <DashboardKpiGrid
        avanceGeneral={viewModel.kpis.avanceGeneral}
        diasPromedio={viewModel.kpis.diasPromedio}
        pendientes={viewModel.kpis.pendientes}
        total={viewModel.kpis.total}
        totalAtrasadas={viewModel.kpis.porEstado.Atrasado}
        totalFinalizadas={viewModel.kpis.porEstado.Finalizado}
      />

      <DashboardFiltersPanel filters={filters} onFiltersChange={setFilters} onReset={() => setFilters(DEFAULT_DASHBOARD_FILTERS)} />

      <div className="grid gap-6 lg:grid-cols-2">
        <EstadoChart data={viewModel.kpis.porEstado} />
        <AreaChart data={viewModel.cumplimientoPorArea} />
      </div>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
        <div className="otc-soft-panel rounded-[calc(var(--radius)+0.125rem)] px-5 py-4">
          <p className="otc-section-kicker">Lectura de tendencia</p>
          <h2 className="mt-2 text-2xl font-semibold text-foreground">Donde mirar despues del headline</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            El segundo nivel baja al ritmo por mes y a la presion de vencimientos. Si el headline cambia, aca deberia verse el por que antes de abrir una tarea puntual.
          </p>
        </div>
        <div className="otc-soft-panel flex items-center justify-between gap-4 rounded-[calc(var(--radius)+0.125rem)] px-5 py-4">
          <div>
            <p className="otc-section-kicker">Detalle operativo</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">La capa siguiente ya entra a carga y cumplimiento por periodo.</p>
          </div>
          <ArrowRight className="size-5 text-muted-foreground" aria-hidden="true" />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <MesesChart data={viewModel.tareasPorMes} />
        <VencimientoChart tareas={viewModel.tareasVigentes} />
      </div>

      <TiempoPromedioChart tareas={viewModel.tareasVigentes} />
    </div>
  )
}
