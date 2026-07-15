import { create } from "zustand"
import { persist } from "zustand/middleware"

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface CartItemLocal {
  productId: string
  productName: string
  imageUrl: string | null
  unitPrice: number
  quantity: number
  selectedOptions: SelectedOptionLocal[]
  note?: string
}

export interface SelectedOptionLocal {
  optionGroupId: string
  optionId: string
  optionName: string
  additionalPrice: number
}

interface CartState {
  /** Local cart items (persisted to localStorage) */
  items: CartItemLocal[]

  /** Add item or increment quantity if same product + options */
  addItem: (item: CartItemLocal) => void

  /** Update quantity of an existing item */
  updateQuantity: (productId: string, selectedOptionsHash: string, quantity: number) => void

  /** Remove an item */
  removeItem: (productId: string, selectedOptionsHash: string) => void

  /** Clear all items */
  clearCart: () => void

  /** Total item count */
  getItemCount: () => number

  /** Total price */
  getTotal: () => number
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function hashOptions(options: SelectedOptionLocal[]): string {
  const sorted = [...options].sort((a, b) =>
    a.optionGroupId.localeCompare(b.optionGroupId) || a.optionId.localeCompare(b.optionId),
  )
  return JSON.stringify(sorted)
}

function itemTotal(item: CartItemLocal): number {
  const optionsPrice = item.selectedOptions.reduce((sum, opt) => sum + opt.additionalPrice, 0)
  return (item.unitPrice + optionsPrice) * item.quantity
}

// ─────────────────────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────────────────────

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) => {
        const hash = hashOptions(newItem.selectedOptions)
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) => item.productId === newItem.productId && hashOptions(item.selectedOptions) === hash,
          )

          if (existingIndex >= 0) {
            // Increment quantity
            const updated = [...state.items]
            updated[existingIndex] = {
              ...updated[existingIndex],
              quantity: updated[existingIndex].quantity + newItem.quantity,
            }
            return { items: updated }
          }

          // Add new item
          return { items: [...state.items, { ...newItem }] }
        })
      },

      updateQuantity: (productId, selectedOptionsHash, quantity) => {
        if (quantity < 1) return
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId && hashOptions(item.selectedOptions) === selectedOptionsHash
              ? { ...item, quantity }
              : item,
          ),
        }))
      },

      removeItem: (productId, selectedOptionsHash) => {
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.productId === productId && hashOptions(item.selectedOptions) === selectedOptionsHash),
          ),
        }))
      },

      clearCart: () => set({ items: [] }),

      getItemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),

      getTotal: () => get().items.reduce((sum, item) => sum + itemTotal(item), 0),
    }),
    {
      name: "auan-cart",
    },
  ),
)
