import { createStore } from "kaioken"
import type { List, ClickedList, ListDragTarget } from "../types"
import { useBoardStore } from "./board"
import { useGlobal } from "./global"
import { getListItems } from "./items"
import * as db from "../idb"
import { useBoardTagsStore } from "./boardTags"

export { useListsStore }

const useListsStore = createStore({ lists: [] as List[] }, function (set, get) {
  const getBoardOrDie = () => {
    const { board } = useBoardStore.getState()
    if (!board) throw "no board selected"
    return board
  }
  const handleListRemoved = async (id: number) => {
    const newLists = await Promise.all(
      get()
        .lists.filter((l) => l.id !== id)
        .map(async (list, i) => {
          if (list.order !== i) {
            list.order = i
            await db.updateList(list)
          }
          return list
        })
    )
    set({ lists: newLists })
  }
  const getMaxListOrder = () => Math.max(...get().lists.map((l) => l.order), -1)
  const getList = (listId: number) =>
    get().lists.find((list) => list.id === listId)

  const addList = async () => {
    const { setClickedList } = useGlobal()
    const maxListOrder = getMaxListOrder()
    const newList = await db.addList(getBoardOrDie().id, maxListOrder + 1)
    set(({ lists }) => ({ lists: [...lists, { ...newList, items: [] }] }))

    setClickedList({
      list: newList,
      dialogOpen: true,
      dragging: false,
      id: newList.id,
      index: newList.order,
    })
  }
  const archiveList = async (id: number) => {
    const list = getList(id)
    if (!list) throw new Error("dafooq, no list")
    await db.archiveList(list)
    await handleListRemoved(id)
  }
  const deleteList = async (id: number) => {
    const confirmDeletion = confirm(
      "Are you sure you want to delete this list and all of its data? It can't be undone!"
    )
    if (!confirmDeletion) return
    const list = getList(id)
    if (!list) throw new Error("no list, wah wah")
    const { itemTags } = useBoardTagsStore.getState()
    const listItems = getListItems(list.id)
    await Promise.all([
      ...listItems.map(db.deleteItem),
      ...itemTags
        .filter((it) => listItems.some((li) => it.itemId === li.id))
        .map(db.deleteItemTag),
      db.deleteList(list),
      handleListRemoved(id),
    ])
  }
  const updateList = async (payload: List) => {
    const list = await db.updateList(payload)
    set(({ lists }) => ({
      lists: lists.map((l) => (l.id === list.id ? list : l)),
    }))
  }
  const restoreList = async (list: List) => {
    const maxListOrder = getMaxListOrder()
    const newList: List = {
      ...list,
      archived: false,
      order: maxListOrder + 1,
    }
    await db.updateList(newList)
    const items = await db.loadItems(list.id)
    set(({ lists }) => ({ lists: [...lists, { ...newList, items }] }))
  }
  const handleListDrop = async (
    clickedList: ClickedList,
    listDragTarget: ListDragTarget
  ) => {
    const lists = get().lists
    let targetIdx =
      listDragTarget.index >= clickedList.index
        ? listDragTarget.index - 1
        : listDragTarget.index

    if (targetIdx > lists.length - 1) targetIdx--

    if (clickedList.index !== targetIdx) {
      const sortedLists = lists.sort((a, b) => a.order - b.order)
      const [list] = sortedLists.splice(clickedList.index, 1)

      sortedLists.splice(targetIdx, 0, list)

      const newLists = await Promise.all(
        sortedLists.map(async (list, i) => {
          if (list.order === i) return list
          list.order = i
          await db.updateList(list)
          return list
        })
      )
      set({ lists: newLists })
    }
  }

  const setState = (payload: List[]) => {
    set({ lists: payload })
  }

  return {
    addList,
    archiveList,
    deleteList,
    updateList,
    restoreList,
    handleListDrop,
    getList,
    setState,
  }
})
