'use client'

import type { ReactNode } from 'react'
import { Filter, Search } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AREAS, ESTADOS, MESES, PRIORIDADES } from '@/features/tasks/domain/task.constants'

interface TaskFiltersProps {
  area?: {
    onChange: (value: string) => void
    value: string
  }
  children?: ReactNode
  estado?: {
    onChange: (value: string) => void
    value: string
  }
  mes?: {
    onChange: (value: string) => void
    value: string
  }
  prioridad?: {
    onChange: (value: string) => void
    value: string
  }
  search?: {
    onChange: (value: string) => void
    placeholder?: string
    value: string
  }
  title?: string
}

export function TaskFilters({
  area,
  children,
  estado,
  mes,
  prioridad,
  search,
  title = 'Filtros operativos',
}: TaskFiltersProps) {
  return (
    <Card className="otc-panel border-border/70 [--otc-panel-accent:linear-gradient(135deg,var(--chart-2),var(--chart-1))]">
      <CardHeader className="gap-3 pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <Filter className="size-4" aria-hidden="true" />
          {title}
        </CardTitle>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          Ordena primero el frente que necesita lectura ejecutiva. Los filtros compactan el contexto sin ocultar el camino al detalle.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 pt-0">
        {search ? (
          <div className="space-y-2">
            <Label htmlFor="task-filter-search">Buscar tarea</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                id="task-filter-search"
                className="pl-9"
                placeholder={search.placeholder ?? 'Buscar tarea…'}
                value={search.value}
                onChange={(event) => search.onChange(event.target.value)}
              />
            </div>
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {mes ? (
            <div className="space-y-2">
              <Label htmlFor="task-filter-month">Mes</Label>
              <Select value={mes.value} onValueChange={mes.onChange}>
                <SelectTrigger id="task-filter-month" className="w-full">
                  <SelectValue placeholder="Mes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los meses</SelectItem>
                  {MESES.map((item, index) => (
                    <SelectItem key={item} value={index.toString()}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          {area ? (
            <div className="space-y-2">
              <Label htmlFor="task-filter-area">Area</Label>
              <Select value={area.value} onValueChange={area.onChange}>
                <SelectTrigger id="task-filter-area" className="w-full">
                  <SelectValue placeholder="Area" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas las areas</SelectItem>
                  {AREAS.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          {estado ? (
            <div className="space-y-2">
              <Label htmlFor="task-filter-status">Estado</Label>
              <Select value={estado.value} onValueChange={estado.onChange}>
                <SelectTrigger id="task-filter-status" className="w-full">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {ESTADOS.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          {prioridad ? (
            <div className="space-y-2">
              <Label htmlFor="task-filter-priority">Prioridad</Label>
              <Select value={prioridad.value} onValueChange={prioridad.onChange}>
                <SelectTrigger id="task-filter-priority" className="w-full">
                  <SelectValue placeholder="Prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  {PRIORIDADES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          {children ? <div className="flex items-end">{children}</div> : null}
        </div>
      </CardContent>
    </Card>
  )
}
