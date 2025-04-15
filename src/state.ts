import { Item, List } from "$/db"
import { signal } from "kaioken"

type ItemDragState = {
  item: Item
  element: HTMLElement
  dragging: boolean
  offset: { x: number; y: number }
  mousePos: { x: number; y: number }
  target: {
    listId: string
    index: number
  }
}

export const itemDragState = signal<ItemDragState | null>(null)

type ListDragState = {
  list: List
  element: HTMLElement
  dragging: boolean
  offset: { x: number; y: number }
  mousePos: { x: number; y: number }
  target: {
    index: number
  }
}

export const listDragState = signal<ListDragState | null>(null)

export const selectedItem = signal<Item | null>(null)
export const selectedList = signal<List | null>(null)

const prefersDark = window.matchMedia("(prefers-color-scheme: dark)")
export const preferredTheme = signal<"dark" | "light">(
  prefersDark.matches ? "dark" : "light"
)

prefersDark.addEventListener(
  "change",
  () => (preferredTheme.value = prefersDark.matches ? "dark" : "light")
)
