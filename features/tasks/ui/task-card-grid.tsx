'use client'

import { AlertCircle, CheckCircle, Clock3, User } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { calcularEstado, diasRestantes, formatearFecha } from '@/features/tasks/domain/task.rules'
import type { Tarea } from '@/features/tasks/domain/task.types'
import { getEstadoColor, getPrioridadColor } from '@/features/tasks/ui/task-presentation'

interface TaskCardGridProps {
  emptyMessage: string
  onSelectTask: (task: Tarea) => void
  showPrimaryArea?: boolean
  tasks: Tarea[]
}

export function TaskCardGrid({ emptyMessage, onSelectTask, showPrimaryArea = false, tasks }: TaskCardGridProps) {
  if (tasks.length === 0) {
    return (
      <Card className="otc-panel border-border/70 [--otc-panel-accent:linear-gradient(135deg,var(--chart-5),var(--chart-1))]">
        <CardContent className="flex min-h-[220px] items-center justify-center pt-6 text-center text-muted-foreground">
          {emptyMessage}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tasks.map((task) => (
        <TaskCard key={task.id} onSelectTask={onSelectTask} showPrimaryArea={showPrimaryArea} task={task} />
      ))}
    </div>
  )
}

interface TaskCardProps {
  onSelectTask: (task: Tarea) => void
  showPrimaryArea: boolean
  task: Tarea
}

function TaskCard({ onSelectTask, showPrimaryArea, task }: TaskCardProps) {
  const estado = calcularEstado(task)
  const dias = diasRestantes(task.fechaFin)

  return (
    <Card className="otc-panel border-border/70 transition-transform hover:-translate-y-0.5" style={{ ['--otc-panel-accent' as string]: getTaskAccent(estado, task.prioridad) }}>
      <CardContent className="flex cursor-pointer flex-col gap-4 pt-6" onClick={() => onSelectTask(task)}>
        <div className="flex items-start gap-3">
          <div className="otc-kpi-icon flex size-10 items-center justify-center rounded-full text-primary">
            {getStatusIcon(estado, dias)}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h3 className="line-clamp-1 font-medium text-foreground">{task.nombre}</h3>
            <p className="line-clamp-2 text-sm text-muted-foreground">{task.descripcion}</p>
          </div>
        </div>

        {showPrimaryArea ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <User className="size-3.5" />
            Principal: <span className="font-medium text-foreground">{task.areas.join(', ')}</span>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Badge className={getEstadoColor(estado)} variant="secondary">
            {estado}
          </Badge>
          <Badge className={getPrioridadColor(task.prioridad)} variant="secondary">
            {task.prioridad}
          </Badge>
          <span className={getRemainingTone(estado, dias)}>
            {estado === 'Finalizado' ? 'Completada' : dias < 0 ? `${Math.abs(dias)}d atrasado` : `${dias}d restantes`}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
            <div className="h-full bg-primary transition-all" style={{ width: `${task.avanceTotal}%` }} />
          </div>
          <span className="text-xs font-medium text-foreground">{task.avanceTotal}%</span>
        </div>

        <div className="text-xs text-muted-foreground">
          {formatearFecha(task.fechaInicio)} - {formatearFecha(task.fechaFin)}
        </div>
      </CardContent>
    </Card>
  )
}

function getRemainingTone(estado: string, dias: number) {
  if (estado === 'Finalizado') return 'text-xs font-medium text-success'
  if (dias < 0) return 'text-xs font-medium text-danger'
  if (dias <= 5) return 'text-xs font-medium text-warning'
  return 'text-xs font-medium text-muted-foreground'
}

function getStatusIcon(estado: Tarea['estado'], dias: number) {
  if (estado === 'Atrasado') return <AlertCircle className="size-5 text-danger" />
  if (estado === 'Finalizado') return <CheckCircle className="size-5 text-success" />
  if (dias <= 5) return <AlertCircle className="size-5 text-warning" />
  return <Clock3 className="size-5 text-info" />
}

function getTaskAccent(estado: Tarea['estado'], prioridad: Tarea['prioridad']) {
  if (estado === 'Atrasado') return 'linear-gradient(135deg,#d35f55,var(--chart-4))'
  if (estado === 'Finalizado') return 'linear-gradient(135deg,#499470,var(--chart-5))'
  if (prioridad === 'Alta') return 'linear-gradient(135deg,var(--chart-1),var(--chart-3))'
  return 'linear-gradient(135deg,var(--chart-2),var(--chart-1))'
}
