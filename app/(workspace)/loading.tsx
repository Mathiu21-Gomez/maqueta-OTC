import { Skeleton } from '@/components/ui/skeleton'

export default function WorkspaceLoading() {
  return (
    <div
      aria-busy="true"
      aria-label="Cargando vista del workspace"
      className="flex flex-col gap-6"
    >
      <div className="flex flex-col gap-3">
        <Skeleton className="h-5 w-32 rounded-full" />
        <Skeleton className="h-10 w-2/3 max-w-xl" />
        <Skeleton className="h-4 w-full max-w-2xl" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-24 rounded-[calc(var(--radius)+0.125rem)]" />
        ))}
      </div>

      <Skeleton className="h-[360px] rounded-[calc(var(--radius)+0.5rem)]" />
    </div>
  )
}
