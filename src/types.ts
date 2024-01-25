export type Vector2 = {
  x: number
  y: number
}

export interface GlobalState {
  drag: {
    start: Vector2
    current: Vector2
  }
  rootElement: HTMLElement
  mousePos: Vector2
  clickedItem: ClickedItem | null
  itemDragTarget: ItemDragTarget | null
  clickedList: ClickedList | null
  listDragTarget: ListDragTarget | null
  dragging: boolean
}

export interface ListItem {
  id: string
  title: string
  description: string
  archived: boolean
  created: Date
  order: number
}

export interface List {
  id: string
  title: string
  items: ListItem[]
  archived: boolean
  created: Date
  order: number
  dropArea: HTMLElement | null
}

export interface ItemDragTarget {
  index: number
  listId: string
}

export interface ListDragTarget {
  index: number
}

export interface ClickedItem {
  id: string
  index: number
  dragging: boolean
  listId: string
  element: HTMLElement
  domRect: DOMRect
  mouseOffset: {
    x: number
    y: number
  }
}

export interface ClickedList {
  id: string
  index: number
  dragging: boolean
  element: HTMLElement
  domRect: DOMRect
  mouseOffset: {
    x: number
    y: number
  }
}

export interface Board {
  id: string
  title: string
  lists: List[]
  dropArea: HTMLElement | null
}
