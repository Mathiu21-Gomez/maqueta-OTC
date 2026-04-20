'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface WorkspaceErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function WorkspaceError({ error, reset }: WorkspaceErrorProps) {
  useEffect(() => {
    // Intentionally minimal — swap for your telemetry client when backend lands.
    console.error('Workspace route error', error)
  }, [error])

  return (
    <div
      role="alert"
      className="mx-auto flex max-w-xl flex-col items-center gap-5 py-16 text-center"
    >
      <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-danger/10 text-danger-emphasis">
        <AlertTriangle className="size-7" aria-hidden="true" />
      </span>
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">No pudimos cargar esta vista</h2>
        <p className="text-sm text-muted-foreground">
          Algo falló mientras preparábamos la sección. Volvé a intentarlo; si persiste, avisá al equipo de operaciones.
        </p>
        {error.digest ? (
          <p className="text-xs font-mono text-muted-foreground/80">Ref: {error.digest}</p>
        ) : null}
      </div>
      <Button onClick={reset} type="button">
        <RefreshCw data-icon="inline-start" />
        Reintentar
      </Button>
    </div>
  )
}
