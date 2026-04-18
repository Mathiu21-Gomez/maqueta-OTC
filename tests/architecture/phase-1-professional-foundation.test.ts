import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')

const thinRoutes = [
  ['app/(workspace)/page.tsx', "@/features/dashboard/ui/dashboard-page"],
  ['app/(workspace)/tareas/page.tsx', "@/features/tasks/ui/task-list-page"],
  ['app/(workspace)/mis-tareas/page.tsx', "@/features/tasks/ui/my-tasks-page"],
  ['app/(workspace)/colaborativas/page.tsx', "@/features/tasks/ui/collaborative-tasks-page"],
  ['app/(workspace)/nueva-tarea/page.tsx', "@/features/tasks/ui/new-task-route"],
] as const

describe('phase 1 professional foundation architecture', () => {
  it('mantiene routes thin y server-safe en el workspace', () => {
    for (const [relativePath, featureImport] of thinRoutes) {
      const source = readProjectFile(relativePath)
      const importLines = source.match(/^import .*$/gm) ?? []

      expect(source).not.toContain("'use client'")
      expect(source).not.toMatch(/use(State|Effect|Memo|Callback|Router|Pathname|SearchParams)/)
      expect(importLines).toHaveLength(1)
      expect(source).toContain(featureImport)
      expect(source).toMatch(/export default function .*\(\) \{[\s\S]*return <[A-Z][A-Za-z]+ \/>[\s\S]*\}/)
    }
  })

  it('deja layouts server-safe y providers globales sin features concretos', () => {
    const rootLayout = readProjectFile('app/layout.tsx')
    const workspaceLayout = readProjectFile('app/(workspace)/layout.tsx')
    const providers = readProjectFile('app/providers.tsx')

    expect(rootLayout).not.toContain("'use client'")
    expect(workspaceLayout).not.toContain("'use client'")
    expect(providers).toContain("'use client'")
    expect(providers).not.toContain("@/features/")
  })

  it('respeta el boundary shared -> no app/features imports', () => {
    const sharedFiles = collectFiles(path.join(projectRoot, 'shared'))
      .filter((filePath) => /\.(ts|tsx)$/.test(filePath))

    expect(sharedFiles.length).toBeGreaterThan(0)

    for (const filePath of sharedFiles) {
      const source = readFileSync(filePath, 'utf8')

      expect(source, path.relative(projectRoot, filePath)).not.toMatch(/from ['"]@\/(app|features)\//)
    }
  })
})

function readProjectFile(relativePath: string) {
  return readFileSync(path.join(projectRoot, relativePath), 'utf8')
}

function collectFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name)
    return entry.isDirectory() ? collectFiles(entryPath) : [entryPath]
  })
}
