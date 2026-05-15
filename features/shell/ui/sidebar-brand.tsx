'use client'

import Image from 'next/image'
import Link from 'next/link'

/**
 * Presentacional puro: marca del workspace (logo + wordmark).
 * Sin estado, sin props. El wordmark se oculta solo en modo colapsado
 * vía la utilidad nativa de shadcn `group-data-[collapsible=icon]`.
 */
export function SidebarBrand() {
  return (
    <Link
      href="/"
      aria-label="Ir al dashboard de OTC Boardroom"
      className="group/brand flex items-center gap-2.5 rounded-lg border border-sidebar-border/60 bg-surface-translucent px-2 py-2 shadow-[var(--shadow-sidebar)] transition-colors hover:bg-surface-translucent-hover group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
    >
      <div className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-white/80 dark:bg-white/90 ring-1 ring-sidebar-border/50">
        <Image
          src="/logo-mark.svg"
          alt=""
          width={28}
          height={28}
          className="size-6 object-contain"
          priority
        />
      </div>

      <span className="truncate text-[1.05rem] leading-none font-semibold tracking-[-0.02em] text-sidebar-foreground group-data-[collapsible=icon]:hidden">
        IngSimple
      </span>
    </Link>
  )
}
