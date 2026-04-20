'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { AlertTriangle, Bell, CheckCircle2, Clock } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
  selectNotifications,
  selectUnreadNotificationCount,
} from '@/features/tasks/application/task.selectors'
import { useTaskStore } from '@/features/tasks/application/task.store'
import type { Notificacion } from '@/features/tasks/domain/task.types'

const TYPE_CONFIG: Record<
  Notificacion['tipo'],
  { label: string; icon: typeof Bell; tone: string; iconClass: string }
> = {
  atrasada: {
    label: 'Atrasada',
    icon: AlertTriangle,
    tone: 'bg-danger/10 text-danger-emphasis ring-1 ring-danger/25',
    iconClass: 'text-danger',
  },
  porVencer: {
    label: 'Por vencer',
    icon: Clock,
    tone: 'bg-warning/10 text-warning-emphasis ring-1 ring-warning/25',
    iconClass: 'text-warning',
  },
  completada: {
    label: 'Completada',
    icon: CheckCircle2,
    tone: 'bg-success/10 text-success-emphasis ring-1 ring-success/25',
    iconClass: 'text-success',
  },
}

const PRIORITY_ORDER: Record<Notificacion['prioridad'], number> = {
  alta: 0,
  media: 1,
  baja: 2,
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const notifications = useTaskStore(selectNotifications)
  const unreadCount = useTaskStore(selectUnreadNotificationCount)
  const markNotificationRead = useTaskStore((state) => state.markNotificationRead)
  const markAllNotificationsRead = useTaskStore((state) => state.markAllNotificationsRead)

  const sorted = useMemo(() => {
    return [...notifications].sort((a, b) => {
      if (a.leida !== b.leida) return a.leida ? 1 : -1
      return PRIORITY_ORDER[a.prioridad] - PRIORITY_ORDER[b.prioridad]
    })
  }, [notifications])

  const hasNotifications = sorted.length > 0
  const hasUnread = unreadCount > 0

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={
            hasUnread
              ? `Notificaciones, ${unreadCount} sin leer`
              : 'Notificaciones'
          }
          className="otc-shell-badge relative inline-flex size-9 items-center justify-center rounded-xl border-border/70 bg-surface-translucent-strong text-muted-foreground transition-colors hover:bg-surface-translucent-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Bell className="size-4" aria-hidden="true" />
          {hasUnread ? (
            <span
              className="absolute -right-1 -top-1 inline-flex min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold leading-none text-danger-foreground tabular-nums ring-2 ring-background"
              aria-hidden="true"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          ) : null}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="w-96 p-0">
        <header className="flex items-center justify-between gap-2 px-4 py-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">Notificaciones</h3>
            {hasUnread ? (
              <Badge
                variant="secondary"
                className="h-5 rounded-full px-2 text-[10px] font-semibold uppercase tracking-wide"
              >
                {unreadCount} sin leer
              </Badge>
            ) : null}
          </div>
          {hasUnread ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
              onClick={markAllNotificationsRead}
            >
              Marcar todas
            </Button>
          ) : null}
        </header>
        <Separator />
        {hasNotifications ? (
          <ul className="max-h-[22rem] divide-y divide-border/60 overflow-y-auto">
            {sorted.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkRead={markNotificationRead}
                onFollowLink={() => setOpen(false)}
              />
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
            <div className="flex size-10 items-center justify-center rounded-xl bg-muted">
              <Bell className="size-5 text-muted-foreground" aria-hidden="true" />
            </div>
            <p className="text-sm text-muted-foreground">
              Sin novedades. Volvemos a avisarte cuando haya algo que mirar.
            </p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

interface NotificationItemProps {
  notification: Notificacion
  onMarkRead: (id: string) => void
  onFollowLink: () => void
}

function NotificationItem({ notification, onMarkRead, onFollowLink }: NotificationItemProps) {
  const config = TYPE_CONFIG[notification.tipo]
  const Icon = config.icon
  const isUnread = !notification.leida

  return (
    <li>
      <Link
        href="/tareas"
        onClick={() => {
          if (isUnread) onMarkRead(notification.id)
          onFollowLink()
        }}
        className={cn(
          'group relative flex items-start gap-3 px-4 py-3 transition-colors hover:bg-accent/50 focus-visible:bg-accent/60 focus-visible:outline-none',
          isUnread && 'bg-primary/[0.03]',
        )}
      >
        {isUnread ? (
          <span
            aria-hidden="true"
            className="absolute left-1.5 top-4 size-1.5 rounded-full bg-primary"
          />
        ) : null}
        <span
          className={cn(
            'mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg',
            config.tone,
          )}
        >
          <Icon className={cn('size-4', config.iconClass)} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {config.label}
            </span>
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground/70">
              · {notification.prioridad}
            </span>
          </div>
          <p
            className={cn(
              'mt-1 text-sm leading-5',
              isUnread ? 'text-foreground' : 'text-muted-foreground',
            )}
          >
            {notification.mensaje}
          </p>
        </div>
      </Link>
    </li>
  )
}
