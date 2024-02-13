import { createContext, useContext } from "kaioken"
import {
  ClickedItem,
  ItemDragTarget,
  GlobalState,
  List,
  ClickedList,
  ListDragTarget,
  Board,
} from "../types"
import { addBoard as addBoardDb } from "../idb"

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
    if (!clickedList.mouseOffset) throw new Error("no mouseoffset")
    const elements = Array.from(
      document.querySelectorAll("#board .inner .list")
    ).filter((el) => Number(el.getAttribute("data-id")) !== clickedList.id)
    let index = elements.length
    const draggedItemLeft = e.clientX - (clickedList.mouseOffset.x ?? 0)

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

  const addBoard = async () => {
    const newBoard = await addBoardDb()
    dispatch({ type: "ADD_BOARD", payload: newBoard })
  }

  function handleItemDrag(
    e: MouseEvent,
    dropArea: HTMLElement,
    clickedItem: ClickedItem,
    targetList: List
  ) {
    if (!clickedItem.mouseOffset) throw new Error("no mouseoffset")
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

  function setBoardEditorOpen(value: boolean) {
    dispatch({ type: "SET_BOARD_EDITOR_OPEN", payload: value })
  }

  return {
    ...useContext(GlobalCtx),
    addBoard,
    setRootElement: (payload: HTMLDivElement) =>
      dispatch({ type: "SET_ROOT_EL", payload }),
    setBoardEditorOpen,
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
  | { type: "SET_BOARD_EDITOR_OPEN"; payload: boolean }
  | { type: "SET_DRAGGING"; payload: { dragging: boolean } }
  | { type: "SET_CLICKED_ITEM"; payload: ClickedItem | null }
  | { type: "SET_ITEM_DRAG_TARGET"; payload: ItemDragTarget | null }
  | { type: "SET_CLICKED_LIST"; payload: ClickedList | null }
  | { type: "SET_LIST_DRAG_TARGET"; payload: ListDragTarget | null }
  | { type: "SET_BOARDS"; payload: Board[] }
  | { type: "SET_ROOT_EL"; payload: HTMLDivElement }
  | { type: "ADD_BOARD"; payload: Board }

export function globalStateReducer(
  state: GlobalState,
  action: GlobalDispatchAction
): GlobalState {
  switch (action.type) {
    case "SET_ROOT_EL": {
      return { ...state, rootElement: action.payload }
    }
    case "SET_BOARD_EDITOR_OPEN": {
      return { ...state, boardEditorOpen: action.payload }
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
        boardsLoaded: true,
      }
    }
    case "ADD_BOARD": {
      return {
        ...state,
        boards: [...state.boards, action.payload],
      }
    }
    default: {
      return state
    }
  }
}

export const defaultGlobalState: GlobalState = {
  boardEditorOpen: false,
  rootElement: null,
  dragging: false,
  clickedItem: null,
  itemDragTarget: null,
  clickedList: null,
  listDragTarget: null,
  boards: [],
  boardsLoaded: false,
}
