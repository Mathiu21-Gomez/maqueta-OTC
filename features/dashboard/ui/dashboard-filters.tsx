'use client'

import { Filter } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AREAS, ESTADOS, MESES } from '@/features/tasks/domain/task.constants'

import type { DashboardFilters } from '@/features/dashboard/application/dashboard.selectors'

interface DashboardFiltersProps {
  filters: DashboardFilters
  onFiltersChange: (filters: DashboardFilters) => void
  onReset: () => void
}

export function DashboardFiltersPanel({ filters, onFiltersChange, onReset }: DashboardFiltersProps) {
  const updateFilter = <K extends keyof DashboardFilters>(key: K, value: DashboardFilters[K]) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    })
  }

  return (
    <Card className="otc-panel border-border/70 [--otc-panel-accent:linear-gradient(135deg,var(--chart-2),var(--chart-1))]">
      <CardHeader className="gap-3 pb-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <Filter className="size-4" aria-hidden="true" />
              Filtros del tablero
            </CardTitle>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              Ajusta la lectura ejecutiva sin perder foco: primero fecha, despues area y finalmente estado operativo.
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" className="w-full lg:w-auto" onClick={onReset}>
            Restablecer filtros
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 pt-0 lg:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="dashboard-filter-month">Mes de inicio</Label>
          <Select value={filters.mes} onValueChange={(value) => updateFilter('mes', value)}>
            <SelectTrigger id="dashboard-filter-month" className="w-full">
              <SelectValue placeholder="Mes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los meses</SelectItem>
              {MESES.map((mes, index) => (
                <SelectItem key={mes} value={index.toString()}>
                  {mes}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dashboard-filter-area">Area responsable</Label>
          <Select value={filters.area} onValueChange={(value) => updateFilter('area', value)}>
            <SelectTrigger id="dashboard-filter-area" className="w-full">
              <SelectValue placeholder="Area" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas las areas</SelectItem>
              {AREAS.map((area) => (
                <SelectItem key={area} value={area}>
                  {area}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dashboard-filter-status">Estado operativo</Label>
          <Select value={filters.estado} onValueChange={(value) => updateFilter('estado', value)}>
            <SelectTrigger id="dashboard-filter-status" className="w-full">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {ESTADOS.map((estado) => (
                <SelectItem key={estado} value={estado}>
                  {estado}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
