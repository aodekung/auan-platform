import { create } from "zustand"

interface UIState {
  /** Whether a bottom sheet is open */
  isSheetOpen: boolean
  setSheetOpen: (open: boolean) => void

  /** Global loading overlay */
  isLoading: boolean
  setLoading: (loading: boolean) => void
}

export const useUIStore = create<UIState>()((set) => ({
  isSheetOpen: false,
  setSheetOpen: (open) => set({ isSheetOpen: open }),
  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),
}))
