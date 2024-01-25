import { createContext, useContext } from "kaioken"
import {
  ClickedItem,
  ClickedList,
  ItemDragTarget,
  ListDragTarget,
  ListItem,
  SelectedBoard,
  SelectedBoardList,
} from "../types"
import { addList } from "../idb"

export const BoardContext = createContext<SelectedBoard | null>(null)
export const BoardDispatchContext =
  createContext<(action: BoardDispatchAction) => void>(null)

export function useBoard() {
  const dispatch = useContext(BoardDispatchContext)
  const board = useContext(BoardContext)
  const updateList = (payload: Partial<SelectedBoardList> & { id: number }) =>
    dispatch({ type: "UPDATE_LIST", payload })
  const updateLists = (payload: SelectedBoardList[]) =>
    dispatch({ type: "UPDATE_LISTS", payload })

  function handleListDrop(
    clickedList: ClickedList,
    listDragTarget: ListDragTarget
  ) {
    if (!board) return
    const targetIdx =
      listDragTarget.index >= clickedList.index
        ? listDragTarget.index - 1
        : listDragTarget.index
    const moved = clickedList.index !== targetIdx
    if (moved) {
      const list = board.lists.find((list) => list.id === clickedList.id)!
      board.lists.splice(clickedList.index, 1)
      board.lists.splice(targetIdx, 0, list)
      board.lists.forEach((list, i) => {
        list.order = i
      })
      updateLists(board.lists)
    }
  }

  function handleItemDrop(
    clickedItem: ClickedItem,
    itemDragTarget: ItemDragTarget
  ) {
    if (!board) return
    const itemList = board.lists.find((list) => list.id === clickedItem.listId)!
    const targetList = board.lists.find(
      (list) => list.id === itemDragTarget.listId
    )!
    const isOriginList = clickedItem.listId === itemDragTarget.listId
    const item = itemList.items.find((item) => item.id === clickedItem.id)!
    const targetIdx =
      isOriginList && clickedItem.index <= itemDragTarget.index
        ? itemDragTarget.index - 1
        : itemDragTarget.index

    const moved = item.order !== targetIdx || itemList !== targetList
    if (moved) {
      itemList.items.splice(clickedItem.index, 1)

      if (isOriginList) {
        itemList.items.splice(targetIdx, 0, item)
        itemList.items.forEach((item, i) => {
          item.order = i
        })
        updateList(itemList)
      } else {
        targetList.items.splice(targetIdx, 0, item)
        itemList.items.forEach((item, i) => {
          item.order = i
        })
        targetList.items.forEach((item, i) => {
          item.order = i
        })
        updateList(itemList)
        updateList(targetList)
      }
    }
  }
  return {
    ...(board ?? {}),
    setDropArea: (element: HTMLElement | null) =>
      dispatch({ type: "SET_DROP_AREA", payload: { element } }),
    addList: async () => {
      if (!board) throw new Error("No board")
      const maxListOrder = Math.max(...board.lists.map((l) => l.order), -1)
      const newList = await addList(board.id, maxListOrder + 1)
      dispatch({
        type: "ADD_LIST",
        payload: {
          ...newList,
          items: [],
          dropArea: null,
        },
      })
    },
    removeList: (id: number) =>
      dispatch({ type: "REMOVE_LIST", payload: { id } }),
    updateItem: (payload: Partial<ListItem> & { id: number }) =>
      dispatch({ type: "UPDATE_ITEM", payload }),
    updateList,
    handleItemDrop,
    handleListDrop,
    setBoard: (payload: SelectedBoard | null) =>
      dispatch({ type: "SET_BOARD", payload }),
  }
}

type BoardDispatchAction =
  | { type: "SET_BOARD"; payload: SelectedBoard | null }
  | { type: "ADD_LIST"; payload: SelectedBoardList }
  | { type: "REMOVE_LIST"; payload: { id: number } }
  | {
      type: "UPDATE_LIST"
      payload: Partial<SelectedBoardList> & { id: number }
    }
  | { type: "UPDATE_LISTS"; payload: SelectedBoardList[] }
  | { type: "UPDATE_ITEM"; payload: Partial<ListItem> & { id: number } }
  | { type: "SET_DROP_AREA"; payload: { element: HTMLElement | null } }

export function boardStateReducer(
  state: SelectedBoard | null,
  action: BoardDispatchAction
): SelectedBoard | null {
  if (!state) {
    if (action.type === "SET_BOARD") {
      return action.payload
    }
    return null
  }
  switch (action.type) {
    case "ADD_LIST": {
      const lists = [
        ...state.lists,
        { ...action.payload, items: [], dropArea: null } as SelectedBoardList,
      ]
      return {
        ...state,
        lists,
      }
    }
    case "REMOVE_LIST": {
      const { id } = action.payload
      const lists = state.lists.filter((list) => list.id !== id)
      return {
        ...state,
        lists,
      }
    }
    case "UPDATE_LIST": {
      const { id, ...rest } = action.payload
      const list = state.lists.find((list) => list.id === id)
      if (!list) return state
      const lists = [
        ...state.lists.filter((list) => list.id !== id),
        {
          ...list,
          ...rest,
        },
      ]
      return {
        ...state,
        lists,
      }
    }
    case "UPDATE_LISTS": {
      const { payload } = action
      return {
        ...state,
        lists: payload,
      }
    }
    case "UPDATE_ITEM": {
      const { id, ...rest } = action.payload
      const item = state.lists
        .map((list) => list.items)
        .flat()
        .find((item) => item.id === id)
      if (!item) return state
      const lists = state.lists.map((list) => ({
        ...list,
        items: [
          ...list.items.filter((item) => item.id !== id),
          {
            ...item,
            ...rest,
          },
        ],
      }))
      return {
        ...state,
        lists,
      }
    }
    case "SET_DROP_AREA": {
      const { element } = action.payload
      return {
        ...state,
        dropArea: element,
      }
    }
    case "SET_BOARD": {
      return action.payload ? { ...action.payload } : null
    }
    default: {
      throw new Error(`Unhandled action: ${action}`)
    }
  }
}
