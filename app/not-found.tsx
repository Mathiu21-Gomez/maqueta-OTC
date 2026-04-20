import Link from 'next/link'
import { Compass } from 'lucide-react'

import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-svh max-w-xl flex-col items-center justify-center gap-5 px-6 text-center">
      <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <Compass className="size-7" aria-hidden="true" />
      </span>
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-foreground">Página no encontrada</h1>
        <p className="text-sm text-muted-foreground">
          La ruta que buscás no existe o fue movida. Volvé al dashboard para continuar.
        </p>
      </div>
      <Button asChild>
        <Link href="/">Ir al dashboard</Link>
      </Button>
    </div>
  )
}
