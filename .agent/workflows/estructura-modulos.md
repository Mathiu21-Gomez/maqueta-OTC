---
description: Guía de buenas prácticas y estructura de módulos del proyecto OTC
---

# Guía de Buenas Prácticas y Estructura del Proyecto

## Phase 1 Foundation

La base profesional actual del proyecto sigue esta direccion de importacion:

```text
app -> features -> shared
```

- `app/` solo compone rutas, metadata, layouts y providers.
- `features/` concentra UI, estado y contratos del negocio por modulo.
- `shared/` expone primitivas reutilizables, testing utilities y estilos comunes.
- `shared/` nunca importa desde `features/` ni desde `app/`.
- `app/providers.tsx` monta providers globales; las paginas no deben repetir wrappers.
- `app/(workspace)/layout.tsx` monta el shell comun usando `features/shell/ui/workspace-shell.tsx`.
- Mientras dure la migracion, `components/` y `lib/` pueden seguir existiendo como legacy adapters, pero las nuevas extracciones deben caer en `features/` o `shared/`.

## 📁 Estructura de Carpetas por Módulo

Cada módulo sigue una estructura **feature-based**:

```
src/project/<nombre-modulo>/
├── columns/              # Definiciones de columnas para tablas
│   └── <nombre>-columns.tsx
├── components/
│   ├── data/            # Componentes de visualización (tablas, stats, sheets)
│   │   ├── <nombre>-table.tsx
│   │   ├── <nombre>-stats.tsx
│   │   └── <nombre>-detail-sheet.tsx
│   └── forms/           # Formularios de creación/edición
│       └── create-<nombre>-form.tsx
├── hooks/               # React Query hooks
│   └── use-<nombre>.ts
├── schemas/             # Validaciones Zod
│   └── <nombre>.schema.ts
├── services/            # Servicios/API calls
│   └── <nombre>.service.ts
├── store/               # Zustand stores
│   └── <nombre>.store.ts
└── types/               # Tipos TypeScript
    └── <nombre>.types.ts
```

---

## 🔧 Patrones de Código

### 1. Tipos (`types/`)

```typescript
// tipos con union types para estados
export type Status = "pending" | "in_progress" | "completed"

// interfaces con propiedades bien definidas
export interface Entity {
    id: string
    name: string
    status: Status
    createdAt: string
    // campos opcionales con ?
    description?: string
}
```

### 2. Servicios (`services/`)

```typescript
const delay = (ms: number) => new Promise(r => setTimeout(r, ms))

// Datos mock para desarrollo
const mockData: Entity[] = [...]

export const entityService = {
    getAll: async (params): Promise<{ data: Entity[], total: number }> => {
        await delay(300)
        // lógica de filtrado, paginación
        return { data, total }
    },
    
    getById: async (id: string): Promise<Entity | null> => {
        await delay(200)
        return mockData.find(e => e.id === id) || null
    },
    
    create: async (data): Promise<Entity> => {
        await delay(500)
        // crear y retornar
    }
}
```

### 3. Hooks con React Query (`hooks/`)

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

// Query para listar
export const useEntityList = (params) => {
    return useQuery({
        queryKey: ["entities", params],
        queryFn: () => entityService.getAll(params),
    })
}

// Query para detalle
export const useEntityDetail = (id: string) => {
    return useQuery({
        queryKey: ["entity", id],
        queryFn: () => entityService.getById(id),
        enabled: !!id,
    })
}

// Mutation para crear
export const useCreateEntity = (onSuccess?: () => void) => {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: entityService.create,
        onSuccess: () => {
            toast.success("Creado exitosamente")
            queryClient.invalidateQueries({ queryKey: ["entities"] })
            onSuccess?.()
        },
        onError: () => {
            toast.error("Error al crear")
        },
    })
}
```

### 4. Schemas Zod (`schemas/`)

```typescript
import { z } from "zod"

export const createEntitySchema = z.object({
    name: z.string().min(1, "El nombre es requerido"),
    // Para enums usar message (no errorMap en Zod v4)
    status: z.enum(["pending", "active"], {
        message: "Selecciona un estado"
    }),
    quantity: z.number().min(0, "Debe ser mayor o igual a 0"),
    description: z.string().optional(),
})

export type CreateEntitySchema = z.infer<typeof createEntitySchema>
```

### 5. Store Zustand (`store/`)

```typescript
import { create } from "zustand"

interface EntityStore {
    selectedId: string | null
    filters: { search: string; status: string }
    setSelectedId: (id: string | null) => void
    setFilters: (filters: Partial<EntityStore["filters"]>) => void
}

export const useEntityStore = create<EntityStore>((set) => ({
    selectedId: null,
    filters: { search: "", status: "all" },
    setSelectedId: (id) => set({ selectedId: id }),
    setFilters: (filters) => set((state) => ({ 
        filters: { ...state.filters, ...filters } 
    })),
}))
```

---

## 🎨 Componentes UI

### Stats Cards (usando componente compartido)

```tsx
import StatsCard from "@/shared/components/dashboard/stats-cards"

const cards = [
    {
        value: 10,
        title: "Pendientes",
        subtitle: "Por procesar",
        icon: <IconClock className="h-16 w-16 stroke-1" />,
        className: "bg-amber-50 dark:bg-amber-950",
    },
]

<div className="grid gap-4 md:grid-cols-4">
    {cards.map((card, i) => (
        <StatsCard key={i} {...card} isLoadingStats={isLoading} />
    ))}
</div>
```

### Tablas con DataGrid

```tsx
import { DataGrid } from "@/shared/components/ui/data-grid"
import { columns } from "../columns/entity-columns"

<DataGrid
    columns={columns}
    data={data}
    rowCount={total}
    pagination={pagination}
    onPaginationChange={setPagination}
/>
```

### Formularios con TanStack Form + Zod

```tsx
import { useAppForm } from "@/shared/components/ui/tanstack-form"
import { revalidateLogic } from "@tanstack/react-form"

const form = useAppForm({
    defaultValues: { name: "", status: "pending" },
    validationLogic: revalidateLogic(),
    validators: {
        onDynamic: createEntitySchema,
        onDynamicAsyncDebounceMs: 500,
    },
    onSubmit: async ({ value }) => {
        mutate(value)
    },
})

<form onSubmit={(e) => { e.preventDefault(); form.handleSubmit() }}>
    <form.AppForm>
        <form.AppField name="name">
            {(field) => (
                <field.FieldSet>
                    <field.Field>
                        <field.FieldLabel>Nombre *</field.FieldLabel>
                        <Input
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                        />
                    </field.Field>
                    <field.FieldError />
                </field.FieldSet>
            )}
        </form.AppField>
        
        <form.SubmitButton label="Guardar" icon={<IconSave />} />
    </form.AppForm>
</form>
```

---

## ⚠️ Errores Comunes y Soluciones

| Error | Causa | Solución |
|-------|-------|----------|
| div dentro de p | `<Skeleton>` dentro de `<SheetDescription>` | Usar `<span>` con clases inline |
| DialogTitle required | Título condicional | Siempre renderizar `<DialogTitle>` |
| undefined en array index | array[i] puede ser undefined | Usar `array[i]!` o verificar antes |
| string no asignable a enum | Select pasa string genérico | Cast: `(v) => field.handleChange(v as typeof field.state.value)` |

---

## 📂 Sidebar Navigation

```typescript
// sidebar-data.ts
{
    title: "Módulo",
    icon: IconBox,
    subItems: [
        { title: "Dashboard", icon: IconChart, url: "/dashboard/modulo" },
        { title: "Lista", icon: IconList, url: "/dashboard/modulo/lista" },
    ],
}
```

---

## ✅ Checklist para Nuevo Módulo

- [ ] Crear carpeta `src/project/<nombre>/`
- [ ] Definir tipos en `types/<nombre>.types.ts`
- [ ] Crear service mock en `services/<nombre>.service.ts`
- [ ] Crear hooks en `hooks/use-<nombre>.ts`
- [ ] Crear schema en `schemas/<nombre>.schema.ts`
- [ ] Crear columnas en `columns/<nombre>-columns.tsx`
- [ ] Crear componentes data (table, stats)
- [ ] Crear formularios
- [ ] Crear página en `app/dashboard/<ruta>/page.tsx`
- [ ] Agregar al sidebar
