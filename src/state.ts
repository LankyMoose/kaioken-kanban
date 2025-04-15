import { Item, List } from "$/db"
import { signal } from "kaioken"
import { PrevStateSignal } from "./prevStateSignal"

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

export const itemDragState = new PrevStateSignal<ItemDragState | null>(null)

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

export const listDragState = new PrevStateSignal<ListDragState | null>(null)

export const selectedItem = signal<Item | null>(null)
export const selectedList = signal<List | null>(null)

const prefersDark = window.matchMedia("(prefers-color-scheme: dark)")
export const preferredTheme = new PrevStateSignal<"dark" | "light">(
  prefersDark.matches ? "dark" : "light"
)

prefersDark.addEventListener(
  "change",
  () => (preferredTheme.value = prefersDark.matches ? "dark" : "light")
)

preferredTheme.subscribe((theme) => {
  console.log("theme changed", theme, preferredTheme.prev)
})
