'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowRight, CircleDot, Search } from 'lucide-react'

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command'
import { selectTasks } from '@/features/tasks/application/task.selectors'
import { useTaskStore } from '@/features/tasks/application/task.store'
import { navigationGroups, navigationItems } from '@/features/shell/ui/shell-navigation'

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter()
  const tasks = useTaskStore(selectTasks)

  const recentTasks = useMemo(() => tasks.slice(0, 8), [tasks])

  const run = useCallback(
    (fn: () => void) => {
      onOpenChange(false)
      fn()
    },
    [onOpenChange],
  )

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Búsqueda global"
      description="Saltá entre tareas y secciones del workspace."
    >
      <CommandInput placeholder="Buscar tareas o sección…" />
      <CommandList>
        <CommandEmpty>Sin resultados.</CommandEmpty>

        {navigationGroups.map((group) => {
          const items = navigationItems.filter((item) => item.group === group)
          if (items.length === 0) return null
          return (
            <CommandGroup key={group} heading={group}>
              {items.map((item) => (
                <CommandItem
                  key={item.url}
                  value={`${item.title} ${item.summary}`}
                  onSelect={() => run(() => router.push(item.url))}
                >
                  <item.icon />
                  <span>{item.title}</span>
                  <CommandShortcut>{item.shortcut}</CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
          )
        })}

        {recentTasks.length > 0 ? (
          <>
            <CommandSeparator />
            <CommandGroup heading="Tareas recientes">
              {recentTasks.map((task) => (
                <CommandItem
                  key={task.id}
                  value={`${task.nombre} ${task.areas.join(' ')} ${task.estado}`}
                  onSelect={() => run(() => router.push('/tareas'))}
                >
                  <CircleDot />
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate">{task.nombre}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {task.areas.join(', ')} · {task.estado}
                    </span>
                  </div>
                  <ArrowRight data-icon="inline-end" className="ml-auto opacity-50" />
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        ) : null}
      </CommandList>
    </CommandDialog>
  )
}

export function CommandPaletteTrigger() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.key === 'k' || event.key === 'K') && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir búsqueda"
        className="otc-shell-badge hidden items-center gap-2 rounded-xl border-border/70 bg-surface-translucent-strong px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-surface-translucent-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:inline-flex"
      >
        <Search className="size-3.5" aria-hidden="true" />
        <span>Buscar</span>
        <kbd className="ml-2 inline-flex items-center gap-0.5 rounded border border-border/60 bg-background/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground tabular-nums">
          ⌘K
        </kbd>
      </button>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir búsqueda"
        className="otc-shell-badge inline-flex size-9 items-center justify-center rounded-xl border-border/70 bg-surface-translucent-strong text-muted-foreground transition-colors hover:bg-surface-translucent-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:hidden"
      >
        <Search className="size-4" aria-hidden="true" />
      </button>
      <CommandPalette open={open} onOpenChange={setOpen} />
    </>
  )
}
