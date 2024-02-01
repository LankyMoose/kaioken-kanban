import { createContext, useContext } from "kaioken"
import {
  ClickedItem,
  ClickedList,
  ItemDragTarget,
  List,
  ListDragTarget,
  ListItem,
  SelectedBoard,
  SelectedBoardList,
} from "../types"
import {
  addList as addDbList,
  updateList as updateDbList,
  archiveList as archiveDbList,
  deleteList as deleteDbList,
  addItem as addDbItem,
  updateItem as updateDbItem,
  archiveItem as archiveDbItem,
  deleteItem as deleteDbItem,
} from "../idb"

export const BoardContext = createContext<SelectedBoard | null>(null)
export const BoardDispatchContext =
  createContext<(action: BoardDispatchAction) => void>(null)

export function useBoard() {
  const dispatch = useContext(BoardDispatchContext)
  const board = useContext(BoardContext)

  const addList = async () => {
    if (!board) throw new Error("No board")
    const maxListOrder = Math.max(...board.lists.map((l) => l.order), -1)
    const newList = await addDbList(board.id, maxListOrder + 1)
    dispatch({
      type: "ADD_LIST",
      payload: {
        ...newList,
        items: [],
      },
    })
  }
  const updateList = (payload: SelectedBoardList) => {
    const { items, ...rest } = payload
    updateDbList(rest)
    dispatch({ type: "UPDATE_LIST", payload })
  }
  const archiveList = async (id: number) => {
    if (!board) return
    const list = board.lists.find((list) => list.id === id)
    if (!list) throw new Error("dafooq, no list")
    const { items, ...rest } = list
    await archiveDbList(rest)

    const archivedLists = [...board.archivedLists, rest]

    const newLists = await Promise.all(
      board.lists
        .filter((l) => l.id !== id)
        .map(async (list, i) => {
          if (list.order !== i) {
            list.order = i
            const { items, ...rest } = list
            await updateDbList(rest)
          }
          return list
        })
    )

    dispatch({
      type: "UPDATE_LISTS",
      payload: { lists: newLists, archivedLists },
    })
  }
  const removeList = async (id: number) => {
    const list = board?.lists.find((l) => l.id === id)
    if (!list) throw new Error("no list, wah wah")
    const { items, ...rest } = list
    await deleteDbList(rest)
    dispatch({ type: "REMOVE_LIST", payload: { id } })
  }
  const updateLists = (payload: {
    lists: SelectedBoardList[]
    archivedLists: List[]
  }) => dispatch({ type: "UPDATE_LISTS", payload })

  async function handleListDrop(
    clickedList: ClickedList,
    listDragTarget: ListDragTarget
  ) {
    if (!board) return

    let targetIdx =
      listDragTarget.index >= clickedList.index
        ? listDragTarget.index - 1
        : listDragTarget.index

    if (targetIdx > board.lists.length - 1) targetIdx--

    if (clickedList.index !== targetIdx) {
      const newLists = [...board.lists].sort((a, b) => a.order - b.order)
      const [list] = newLists.splice(clickedList.index, 1)

      newLists.splice(targetIdx, 0, list)

      const lists = await Promise.all(
        newLists.map(async (list, i) => {
          if (list.order === i) return list
          list.order = i
          const { items, ...rest } = list
          await updateDbList(rest)
          return list
        })
      )
      updateLists({
        lists,
        archivedLists: board.archivedLists,
      })
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
    if (!moved) return

    itemList.items.sort((a, b) => a.order - b.order)
    itemList.items.splice(clickedItem.index, 1)

    const applyItemOrder = (item: ListItem, idx: number) => {
      if (item.order === idx) return
      item.order = idx
      updateDbItem(item)
    }

    if (isOriginList) {
      itemList.items.splice(targetIdx, 0, item)
      itemList.items.forEach(applyItemOrder)
      updateList(itemList)
    } else {
      targetList.items.splice(targetIdx, 0, item)
      itemList.items.forEach(applyItemOrder)

      targetList.items.forEach((item, i) => {
        if (item.id === clickedItem.id) {
          item.order = i
          item.listId = targetList.id
          updateDbItem(item)
          return
        }
        applyItemOrder(item, i)
      })
      updateList(itemList)
      updateList(targetList)
    }
  }
  const addItem = async (listId: number) => {
    const list = board?.lists.find((l) => l.id === listId)
    if (!list) throw new Error("no list")
    const listMax = list.items.reduce((max, item) => {
      if (item.order > max) return item.order
      return max
    }, -1)
    const item = await addDbItem(listId, listMax + 1)
    dispatch({
      type: "UPDATE_LIST",
      payload: {
        ...list,
        items: [...list.items, item],
      },
    })
  }
  const updateItem = async (payload: ListItem) => {
    await updateDbItem(payload)
    dispatch({ type: "UPDATE_ITEM", payload })
  }

  const removeItemAndReorderList = async (payload: ListItem) => {
    const list = board?.lists.find((l) => l.id === payload.listId)
    if (!list) throw new Error("no list")
    const items = await Promise.all(
      list.items
        .filter((i) => i.id !== payload.id)
        .map(async (item, i) => {
          if (item.order === i) return item
          item.order = i
          return await updateDbItem(item)
        })
    )
    return { ...list, items }
  }

  const removeItem = async (payload: ListItem) => {
    await deleteDbItem(payload)
    const newList = await removeItemAndReorderList(payload)
    dispatch({ type: "UPDATE_LIST", payload: newList })
  }
  const archiveItem = async (payload: ListItem) => {
    await archiveDbItem(payload)
    const newList = await removeItemAndReorderList(payload)
    dispatch({ type: "UPDATE_LIST", payload: newList })
  }

  return {
    ...(board ?? {}),
    addList,
    removeList,
    archiveList,
    updateList,

    addItem,
    removeItem,
    archiveItem,
    updateItem,

    handleItemDrop,
    handleListDrop,
    setBoard: (payload: SelectedBoard | null) =>
      dispatch({ type: "SET_BOARD", payload }),
  }
}

type BoardDispatchAction =
  | { type: "SET_BOARD"; payload: SelectedBoard | null }
  | { type: "ADD_LIST"; payload: SelectedBoardList }
  | {
      type: "UPDATE_LIST"
      payload: Partial<SelectedBoardList> & { id: number }
    }
  | {
      type: "UPDATE_LISTS"
      payload: {
        lists: SelectedBoardList[]
        archivedLists: List[]
      }
    }
  | { type: "REMOVE_LIST"; payload: { id: number } }
  | { type: "UPDATE_ITEM"; payload: ListItem }
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
    // case "UPDATE_LIST": {
    //   return {
    //     ...state,
    //     lists: state.lists.map((list) =>
    //       list.id === action.payload.id
    //         ? {
    //             ...list,
    //             ...action.payload,
    //           }
    //         : list
    //     ),
    //   }
    // }
    case "UPDATE_LISTS": {
      const {
        payload: { lists, archivedLists },
      } = action
      return {
        ...state,
        lists,
        archivedLists,
      }
    }
    case "REMOVE_LIST": {
      const { id } = action.payload
      return {
        ...state,
        lists: state.lists.filter((l) => l.id !== id),
      }
    }
    case "UPDATE_ITEM": {
      const { id, ...rest } = action.payload
      const list = state.lists.find((list) => list.id === rest.listId)
      if (!list) throw new Error("No list")

      const item = list.items.find((item) => item.id === id)
      if (!item) return state
      const lists = state.lists.map((l) => ({
        ...l,
        items:
          l.id !== list.id
            ? l.items
            : [
                ...l.items.filter((item) => item.id !== id),
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

    case "SET_BOARD": {
      return action.payload ? { ...action.payload } : null
    }
    default: {
      throw new Error(`Unhandled action: ${action}`)
    }
  }
}
