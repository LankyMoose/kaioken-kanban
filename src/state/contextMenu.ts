import { createStore } from "kaioken"

type ContextMenuState = {
  open: boolean
  rightClickHandled: boolean
  click: { x: number; y: number }
}

export const useContextMenu = createStore(
  {
    open: false,
    click: { x: 0, y: 0 },
    rightClickHandled: false,
  } as ContextMenuState,
  (set) => ({
    setOpen: (open: boolean) => set((prev) => ({ ...prev, open })),
  })
)
