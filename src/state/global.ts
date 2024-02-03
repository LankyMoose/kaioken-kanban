import { createContext, useContext } from "kaioken"
import {
  ClickedItem,
  ItemDragTarget,
  Vector2,
  GlobalState,
  List,
  ClickedList,
  ListDragTarget,
  Board,
} from "../types"

export const GlobalCtx = createContext<GlobalState>(null)
export const GlobalDispatchCtx =
  createContext<(action: GlobalDispatchAction) => void>(null)

export function useGlobal() {
  const dispatch = useContext(GlobalDispatchCtx)

  const setItemDragTarget = (payload: ItemDragTarget | null) =>
    dispatch({ type: "SET_ITEM_DRAG_TARGET", payload })

  const setListDragTarget = (payload: ListDragTarget | null) =>
    dispatch({ type: "SET_LIST_DRAG_TARGET", payload })

  function handleListDrag(e: MouseEvent, clickedList: ClickedList) {
    const elements = Array.from(
      document.querySelectorAll("#board .inner .list")
    ).filter((el) => Number(el.getAttribute("data-id")) !== clickedList.id)
    let index = elements.length
    const draggedItemLeft = e.clientX - clickedList.mouseOffset.x

    for (let i = 0; i < elements.length; i++) {
      const rect = elements[i].getBoundingClientRect()
      const left = rect.left
      if (draggedItemLeft < left) {
        index = i
        break
      }
    }
    if (clickedList.index <= index) {
      index++
    }

    setListDragTarget({ index })
  }

  function handleItemDrag(
    e: MouseEvent,
    dropArea: HTMLElement,
    clickedItem: ClickedItem,
    targetList: List
  ) {
    const elements = Array.from(dropArea.querySelectorAll(".list-item")).filter(
      (el) => Number(el.getAttribute("data-id")) !== clickedItem.id
    )
    const isOriginList = clickedItem?.listId === targetList.id
    let index = elements.length

    const draggedItemTop = e.clientY - clickedItem.mouseOffset.y

    for (let i = 0; i < elements.length; i++) {
      const rect = elements[i].getBoundingClientRect()
      const top = rect.top
      if (draggedItemTop < top) {
        index = i
        break
      }
    }

    if (isOriginList && clickedItem.index <= index) {
      index++
    }

    setItemDragTarget({
      index,
      listId: targetList.id,
    })
  }

  function setMainDrawerOpen(value: boolean) {
    dispatch({ type: "SET_MAIN_DRAWER_OPEN", payload: value })
  }

  return {
    ...useContext(GlobalCtx),
    setRootElement: (payload: HTMLDivElement) =>
      dispatch({ type: "SET_ROOT_EL", payload }),
    setMainDrawerOpen,
    updateMousePos: (payload: Vector2) =>
      dispatch({ type: "UPDATE_MOUSE_POS", payload }),
    setDragging: (dragging: boolean) =>
      dispatch({ type: "SET_DRAGGING", payload: { dragging } }),
    setClickedItem: (payload: ClickedItem | null) =>
      dispatch({ type: "SET_CLICKED_ITEM", payload }),
    setItemDragTarget,
    handleItemDrag,
    setClickedList: (payload: ClickedList | null) =>
      dispatch({ type: "SET_CLICKED_LIST", payload }),
    setListDragTarget,
    handleListDrag,
    updateBoards: (payload: Board[]) =>
      dispatch({ type: "SET_BOARDS", payload }),
  }
}

type GlobalDispatchAction =
  | { type: "SET_MAIN_DRAWER_OPEN"; payload: boolean }
  | { type: "UPDATE_MOUSE_POS"; payload: Vector2 }
  | { type: "SET_DRAGGING"; payload: { dragging: boolean } }
  | { type: "SET_CLICKED_ITEM"; payload: ClickedItem | null }
  | { type: "SET_ITEM_DRAG_TARGET"; payload: ItemDragTarget | null }
  | { type: "SET_CLICKED_LIST"; payload: ClickedList | null }
  | { type: "SET_LIST_DRAG_TARGET"; payload: ListDragTarget | null }
  | { type: "SET_BOARDS"; payload: Board[] }
  | { type: "SET_ROOT_EL"; payload: HTMLDivElement }

export function globalStateReducer(
  state: GlobalState,
  action: GlobalDispatchAction
): GlobalState {
  switch (action.type) {
    case "SET_ROOT_EL": {
      return { ...state, rootElement: action.payload }
    }
    case "SET_MAIN_DRAWER_OPEN": {
      return { ...state, mainDrawerOpen: action.payload }
    }
    case "UPDATE_MOUSE_POS": {
      const { x, y } = action.payload
      return {
        ...state,
        mousePos: {
          x,
          y,
        },
      }
    }
    case "SET_DRAGGING": {
      const { dragging } = action.payload
      return {
        ...state,
        dragging,
      }
    }
    case "SET_CLICKED_ITEM": {
      return {
        ...state,
        clickedItem: action.payload,
      }
    }
    case "SET_ITEM_DRAG_TARGET": {
      return {
        ...state,
        itemDragTarget: action.payload,
      }
    }
    case "SET_CLICKED_LIST": {
      return {
        ...state,
        clickedList: action.payload,
      }
    }
    case "SET_LIST_DRAG_TARGET": {
      return {
        ...state,
        listDragTarget: action.payload,
      }
    }
    case "SET_BOARDS": {
      return {
        ...state,
        boards: action.payload,
      }
    }
    default: {
      return state
    }
  }
}

export const defaultGlobalState: GlobalState = {
  mainDrawerOpen: false,
  rootElement: null,
  mousePos: {
    x: 0,
    y: 0,
  },
  dragging: false,
  clickedItem: null,
  itemDragTarget: null,
  clickedList: null,
  listDragTarget: null,
  boards: [],
}
