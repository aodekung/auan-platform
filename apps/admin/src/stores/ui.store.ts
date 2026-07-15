import { create } from "zustand"

interface UIState {
  isSidebarOpen: boolean
  isSidebarCollapsed: boolean
  setSidebarOpen: (open: boolean) => void
  toggleSidebarCollapsed: () => void
}

export const useUIStore = create<UIState>()((set) => ({
  isSidebarOpen: false,
  isSidebarCollapsed: false,
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  toggleSidebarCollapsed: () =>
    set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
}))
