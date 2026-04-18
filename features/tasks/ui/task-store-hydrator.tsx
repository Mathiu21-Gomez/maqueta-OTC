'use client'

import { useEffect } from 'react'

import { hydrateTaskStore } from '@/features/tasks/application/task.commands'

export function TaskStoreHydrator() {
  useEffect(() => {
    void hydrateTaskStore()
  }, [])

  return null
}
