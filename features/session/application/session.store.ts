import { create } from 'zustand'

import type { Area, RolUsuario } from '@/features/tasks/domain/task.types'

interface SessionStoreState {
  areaUsuario: Area
  rol: RolUsuario
  setAreaUsuario: (area: Area) => void
  setRol: (rol: RolUsuario) => void
}

export const useSessionStore = create<SessionStoreState>((set) => ({
  areaUsuario: 'Seguridad',
  rol: 'Administrador',
  setAreaUsuario: (areaUsuario) => set({ areaUsuario }),
  setRol: (rol) => set({ rol }),
}))
