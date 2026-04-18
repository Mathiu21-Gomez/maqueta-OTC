import { create } from 'zustand'

interface ShellStoreState {
  nuevaTareaSheetOpen: boolean
  setNuevaTareaSheetOpen: (open: boolean) => void
}

export const useShellStore = create<ShellStoreState>((set) => ({
  nuevaTareaSheetOpen: false,
  setNuevaTareaSheetOpen: (open) => set({ nuevaTareaSheetOpen: open }),
}))
