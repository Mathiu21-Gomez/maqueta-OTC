import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  selectComplianceByArea,
  selectTaskById,
  selectTaskDistributionByMonth,
  selectTaskKpis,
} from '@/features/tasks/application/task.selectors'
import { resetTaskStore, useTaskStore } from '@/features/tasks/application/task.store'
import { AREAS } from '@/features/tasks/domain/task.constants'
import { createTaskFixture } from '@/features/tasks/testing/task.fixtures'

describe('task.selectors', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-15T12:00:00Z'))
    resetTaskStore()
  })

  it('resuelve una tarea por id desde el store actual', () => {
    useTaskStore.getState().setTasks([
      createTaskFixture({ id: 'task-1', nombre: 'Primera tarea' }),
      createTaskFixture({ id: 'task-2', nombre: 'Segunda tarea' }),
    ])

    const selectedTask = selectTaskById('task-2')(useTaskStore.getState())

    expect(selectedTask?.nombre).toBe('Segunda tarea')
  })

  it('agrega kpis y distribucion por area usando el estado hidratado', () => {
    useTaskStore.getState().setTasks([
      createTaskFixture({ id: 'task-1', avanceTotal: 100, actividades: [{ id: 'a-1', nombre: 'Actividad', porcentaje: 100, completada: true }] }),
      createTaskFixture({ id: 'task-2', areas: ['Operaciones'], fechaInicio: '2026-02-15', fechaFin: '2026-02-26' }),
    ])

    const kpis = selectTaskKpis()
    const complianceByArea = selectComplianceByArea(AREAS)
    const tasksByMonth = selectTaskDistributionByMonth()

    expect(kpis.total).toBe(2)
    expect(kpis.avanceGeneral).toBeGreaterThan(0)
    expect(complianceByArea.some((entry) => entry.area === 'Seguridad')).toBe(true)
    expect(tasksByMonth[0]?.Finalizado).toBeGreaterThanOrEqual(1)
    expect(tasksByMonth[1]?.Planificado).toBeGreaterThanOrEqual(1)
  })
})
