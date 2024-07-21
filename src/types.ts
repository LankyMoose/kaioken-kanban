import { Board, List, ListItem } from "./idb"

export type Vector2 = {
  x: number
  y: number
}

export interface GlobalState {
  boardEditorOpen: boolean
  rootElement: HTMLElement | null
  clickedItem: ClickedItem | null
  itemDragTarget: ItemDragTarget | null
  clickedList: ClickedList | null
  listDragTarget: ListDragTarget | null
  dragging: boolean
  boards: Board[]
  boardsLoaded: boolean
}

export interface ItemDragTarget {
  index: number
  listId: number
}

export interface ListDragTarget {
  index: number
}

export interface ClickedItem {
  sender?: Event
  item: ListItem
  id: number
  index: number
  dragging: boolean
  dialogOpen: boolean
  listId: number
  element?: HTMLElement
  domRect?: DOMRect
  mouseOffset?: {
    x: number
    y: number
  }
}

export interface ClickedList {
  sender?: Event
  list: List
  id: number
  index: number
  dragging: boolean
  dialogOpen: boolean
  element?: HTMLElement
  domRect?: DOMRect
  mouseOffset?: {
    x: number
    y: number
  }
}
