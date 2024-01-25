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
  boards: Board[]
}

export interface ListItem {
  id: number
  listId: number
  title: string
  content: string
  archived: boolean
  created: Date
  order: number
  refereceItems: number[]
}

export interface List {
  id: number
  boardId: number
  title: string
  archived: boolean
  created: Date
  order: number
}

export interface ItemDragTarget {
  index: number
  listId: number
}

export interface ListDragTarget {
  index: number
}

export interface ClickedItem {
  id: number
  index: number
  dragging: boolean
  listId: number
  element: HTMLElement
  domRect: DOMRect
  mouseOffset: {
    x: number
    y: number
  }
}

export interface ClickedList {
  id: number
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
  id: number
  title: string
  created: Date
  archived: boolean
  order: number
}

export interface SelectedBoardList extends List {
  items: ListItem[]
  dropArea: HTMLElement | null
}

export interface SelectedBoard extends Board {
  lists: SelectedBoardList[]
  dropArea: HTMLElement | null
}
