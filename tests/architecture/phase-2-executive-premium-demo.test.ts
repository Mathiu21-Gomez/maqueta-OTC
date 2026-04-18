import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')

describe('phase 2 executive premium demo architecture', () => {
  it('mantiene el shell premium como composition root accesible', () => {
    const source = readProjectFile('features/shell/ui/workspace-shell.tsx')

    expect(source).toContain("href=\"#main-content\"")
    expect(source).toContain('id="main-content"')
    expect(source).toContain('<AppSidebar />')
    expect(source).toContain('<Topbar />')
    expect(source).toContain('<TaskStoreHydrator />')
    expect(source).toContain('<NewTaskSheet open={nuevaTareaSheetOpen} onOpenChange={setNuevaTareaSheetOpen} />')
    expect(source).not.toMatch(/@\/features\/tasks\/(application|domain)\//)
  })

  it('protege la tabla con accion explicita de detalle en lugar de fila clickeable', () => {
    const listPage = readProjectFile('features/tasks/ui/task-list-page.tsx')
    const table = readProjectFile('features/tasks/ui/task-table.tsx')

    expect(listPage).toContain('const [selectedTask, setSelectedTask] = useState<Tarea | null>(null)')
    expect(listPage).toContain('const openTask = (task: Tarea) => startTransition(() => setSelectedTask(task))')
    expect(listPage).toContain('onOpenTask={openTask}')

    expect(table).toContain('Abrir detalle')
    expect(table).toContain('onClick={() => onOpenTask(task)}')
    expect(table).not.toMatch(/<TableRow[^>]*onClick=/)
  })

  it('reutiliza el contrato compartido de validacion entre ruta y sheet premium', () => {
    const routeSource = readProjectFile('features/tasks/ui/new-task-route.tsx')
    const sheetSource = readProjectFile('features/tasks/ui/new-task-sheet.tsx')

    expect(routeSource).toContain("from '@/features/tasks/ui/new-task-form.shared'")
    expect(sheetSource).toContain("from '@/features/tasks/ui/new-task-form.shared'")

    expect(routeSource).toContain('role="alert" aria-live="polite"')
    expect(sheetSource).toContain('role="alert" aria-live="polite"')
    expect(routeSource).toContain('otc-sticky-action-bar')
    expect(sheetSource).toContain('otc-sticky-action-bar')
  })

  it('mantiene una identidad premium coherente sobre tokens compartidos', () => {
    const tokens = readProjectFile('shared/styles/tokens.css')
    const layout = readProjectFile('app/layout.tsx')
    const dashboard = readProjectFile('features/dashboard/ui/dashboard-page.tsx')
    const pageHeader = readProjectFile('features/tasks/ui/task-page-header.tsx')

    expect(tokens).toContain('--font-display-family')
    expect(tokens).toContain('--font-ui-family')
    expect(tokens).toContain('--font-data-family')
    expect(tokens).toContain('--surface-panel')
    expect(tokens).toContain('--border-subtle')
    expect(tokens).toContain('--motion-base')

    expect(layout).toContain('Cormorant_Garamond')
    expect(layout).toContain('Manrope')
    expect(layout).toContain('Geist_Mono')

    expect(dashboard).toContain('otc-executive-hero')
    expect(dashboard).toContain('otc-sheet-rail')
    expect(dashboard).toContain('otc-data-text')

    expect(pageHeader).toContain('otc-executive-hero')
    expect(pageHeader).toContain('otc-sheet-rail')
    expect(pageHeader).toContain('otc-page-title')
  })

  it('usa chips semanticos y una estrategia de motion explicita sin View Transitions runtime', () => {
    const routeSource = readProjectFile('features/tasks/ui/new-task-route.tsx')
    const sheetSource = readProjectFile('features/tasks/ui/new-task-sheet.tsx')
    const shellSource = readProjectFile('features/shell/ui/workspace-shell.tsx')
    const detailSource = readProjectFile('features/tasks/ui/task-detail-sheet.tsx')
    const globals = readProjectFile('app/globals.css')

    expect(routeSource).toContain('aria-pressed={selected}')
    expect(routeSource).toContain('data-testid={`new-task-area-${area}`}')
    expect(routeSource).toContain('data-testid={`new-task-support-area-${area}`}')
    expect(sheetSource).toContain('aria-pressed={selected}')

    expect(shellSource).toContain("from 'motion/react'")
    expect(sheetSource).toContain("from 'motion/react'")
    expect(detailSource).toContain("from 'motion/react'")
    expect(globals).toContain('@media (prefers-reduced-motion: reduce)')
    expect(globals).not.toContain('::view-transition')
    expect(shellSource).not.toContain('ViewTransition')
    expect(sheetSource).not.toContain('ViewTransition')
    expect(detailSource).not.toContain('ViewTransition')
  })
})

function readProjectFile(relativePath: string) {
  return readFileSync(path.join(projectRoot, relativePath), 'utf8')
}
