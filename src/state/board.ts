import { createContext, useContext } from "kaioken"
import {
  Board,
  ClickedItem,
  ClickedList,
  ItemDragTarget,
  List,
  ListDragTarget,
  ListItem,
  SelectedBoard,
  SelectedBoardList,
} from "../types"
import * as db from "../idb"
import { useGlobal } from "./global"

export const BoardContext = createContext<SelectedBoard | null>(null)
export const BoardDispatchContext =
  createContext<(action: BoardDispatchAction) => void>(null)

export function useBoard() {
  const { boards, updateBoards } = useGlobal()
  const dispatch = useContext(BoardDispatchContext)
  const selectedBoard = useContext(BoardContext)

  const getBoardOrDie = () => {
    if (!selectedBoard) throw "no board selected"
    return selectedBoard
  }

  const selectBoard = async (board: Board) => {
    const lists = await db.loadLists(board.id)

    const selectedBoard = {
      ...board,
      lists: await Promise.all(
        lists.map(async (list) => {
          const items = await db.loadItems(list.id)
          return {
            ...list,
            items,
          } as SelectedBoardList
        })
      ),
    }

    localStorage.setItem("kaioban-board-id", board.id.toString())
    dispatch({ type: "SET_BOARD", payload: selectedBoard })
  }
  const updateSelectedBoard = async (payload: Partial<Board>) => {
    const { lists, ...rest } = getBoardOrDie()
    const newBoard = { ...rest, ...payload }
    const res = await db.updateBoard(newBoard)
    dispatch({ type: "SET_BOARD", payload: { ...res, lists } })
    updateBoards(boards.map((b) => (b.id === res.id ? newBoard : b)))
  }

  const addList = async () => {
    const board = getBoardOrDie()
    const maxListOrder = Math.max(...board.lists.map((l) => l.order), -1)
    const newList = await db.addList(board.id, maxListOrder + 1)
    dispatch({
      type: "ADD_LIST",
      payload: {
        ...newList,
        items: [],
      },
    })
  }
  const archiveList = async (id: number) => {
    const board = getBoardOrDie()
    const list = board.lists.find((list) => list.id === id)
    if (!list) throw new Error("dafooq, no list")
    const { items, ...rest } = list
    await db.archiveList(rest)

    const newLists = await Promise.all(
      board.lists
        .filter((l) => l.id !== id)
        .map(async (list, i) => {
          if (list.order !== i) {
            list.order = i
            const { items, ...rest } = list
            await db.updateList(rest)
          }
          return list
        })
    )

    dispatch({
      type: "UPDATE_LISTS",
      payload: newLists,
    })
  }
  const removeList = async (id: number) => {
    const board = getBoardOrDie()
    const list = board?.lists.find((l) => l.id === id)
    if (!list) throw new Error("no list, wah wah")
    const { items, ...rest } = list
    await db.deleteList(rest)
    dispatch({ type: "REMOVE_LIST", payload: { id } })
  }
  const updateList = async (payload: SelectedBoardList) => {
    const { items, ...rest } = payload
    await db.updateList(rest)
    dispatch({ type: "UPDATE_LIST", payload })
  }
  const restoreList = async (list: List) => {
    const board = getBoardOrDie()
    const maxListOrder = Math.max(...board.lists.map((l) => l.order), -1)
    const newList: List = {
      ...list,
      archived: false,
      order: maxListOrder + 1,
    }
    await db.updateList(newList)
    dispatch({
      type: "ADD_LIST",
      payload: {
        ...newList,
        items: [],
      },
    })
  }

  const handleListDrop = async (
    clickedList: ClickedList,
    listDragTarget: ListDragTarget
  ) => {
    const board = getBoardOrDie()

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
          await db.updateList(rest)
          return list
        })
      )
      dispatch({ type: "UPDATE_LISTS", payload: lists })
    }
  }
  const handleItemDrop = async (
    clickedItem: ClickedItem,
    itemDragTarget: ItemDragTarget
  ) => {
    const board = getBoardOrDie()
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
      return db.updateItem(item)
    }

    if (isOriginList) {
      itemList.items.splice(targetIdx, 0, item)
      await Promise.all(itemList.items.map(applyItemOrder))
      dispatch({ type: "UPDATE_LIST", payload: itemList })
    } else {
      targetList.items.splice(targetIdx, 0, item)
      await Promise.all(itemList.items.map(applyItemOrder))

      await Promise.all(
        targetList.items.map((item, i) => {
          if (item.id === clickedItem.id) {
            item.order = i
            item.listId = targetList.id
            return db.updateItem(item)
          }
          return applyItemOrder(item, i)
        })
      )
      dispatch({
        type: "UPDATE_LISTS",
        payload: board.lists.map((l) => {
          if (l.id === itemList.id) return itemList
          if (l.id === targetList.id) return targetList
          return l
        }),
      })
    }
  }
  const addItem = async (listId: number) => {
    const board = getBoardOrDie()
    const list = board?.lists.find((l) => l.id === listId)
    if (!list) throw new Error("no list")
    const listMax = list.items.reduce((max, item) => {
      if (item.order > max) return item.order
      return max
    }, -1)
    const item = await db.addItem(listId, listMax + 1)
    dispatch({
      type: "UPDATE_LIST",
      payload: {
        ...list,
        items: [...list.items, item],
      },
    })
  }
  const updateItem = async (payload: ListItem) => {
    await db.updateItem(payload)
    dispatch({ type: "UPDATE_ITEM", payload })
  }
  const restoreItem = async (payload: ListItem) => {
    const board = getBoardOrDie()
    const list = board.lists.find((l) => l.id === payload.listId)
    if (!list) throw new Error("no list, dafooooq")
    const maxListOrder = list.items.reduce(
      (acc, item) => (item.order > acc ? item.order : acc),
      -1
    )
    const item = await db.updateItem({
      ...payload,
      archived: false,
      order: maxListOrder + 1,
    })
    dispatch({
      type: "UPDATE_LIST",
      payload: {
        ...list,
        items: [...list.items, item],
      },
    })
  }

  const removeItemAndReorderList = async (payload: ListItem) => {
    const board = getBoardOrDie()
    const list = board?.lists.find((l) => l.id === payload.listId)
    if (!list) throw new Error("no list")
    const items = await Promise.all(
      list.items
        .filter((i) => i.id !== payload.id)
        .map(async (item, i) => {
          if (item.order === i) return item
          item.order = i
          return await db.updateItem(item)
        })
    )
    return { ...list, items }
  }

  const removeItem = async (payload: ListItem) => {
    await db.deleteItem(payload)
    const newList = await removeItemAndReorderList(payload)
    dispatch({ type: "UPDATE_LIST", payload: newList })
  }
  const archiveItem = async (payload: ListItem) => {
    await db.archiveItem(payload)
    const newList = await removeItemAndReorderList(payload)
    dispatch({ type: "UPDATE_LIST", payload: newList })
  }

  return {
    board: selectedBoard,
    updateSelectedBoard,
    selectBoard,

    addList,
    removeList,
    archiveList,
    updateList,
    restoreList,

    addItem,
    removeItem,
    archiveItem,
    updateItem,
    restoreItem,

    handleItemDrop,
    handleListDrop,
  }
}

type BoardDispatchAction =
  | { type: "SET_BOARD"; payload: SelectedBoard | null }
  | { type: "ADD_LIST"; payload: SelectedBoardList }
  | {
      type: "UPDATE_LIST"
      payload: Partial<SelectedBoardList> & { id: number }
    }
  | { type: "UPDATE_LISTS"; payload: SelectedBoardList[] }
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
        { ...action.payload, items: [] } as SelectedBoardList,
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
    case "UPDATE_LISTS": {
      return {
        ...state,
        lists: action.payload,
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
