import { createStore } from "kaioken"
import type { ListItem } from "../types"

type ContextMenuState = {
  open: boolean
  rightClickHandled: boolean
  click: { x: number; y: number }
  item?: ListItem
}

const defaultState: ContextMenuState = {
  open: false,
  click: { x: 0, y: 0 },
  rightClickHandled: false,
  item: undefined,
}

export const useContextMenu = createStore({ ...defaultState }, (set) => ({
  setOpen: (open: boolean) => set((prev) => ({ ...prev, open })),
  reset: () => set({ ...defaultState }),
}))
