import { createStore } from "kaioken"
import type { ClickedList, ListDragTarget } from "../types"
import { useBoardStore } from "./board"
import { getListItems } from "./items"
import { useBoardTagsStore } from "./boardTags"
import { List, db } from "../idb"

export { useListsStore }

const useListsStore = createStore({ lists: [] as List[] }, function (set, get) {
  const getBoardOrDie = () => {
    const { board } = useBoardStore.getState()
    if (!board) throw "no board selected"
    return board
  }
  const updateListOrders = async (id: number) => {
    const newLists = await Promise.all(
      get()
        .lists.filter((l) => l.id !== id && !l.archived)
        .map(async (list, i) => {
          if (list.order !== i) {
            list.order = i
            return (await db.collections.lists.update(list))!
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
    const maxListOrder = getMaxListOrder()
    const newList = await db.collections.lists.create({
      boardId: getBoardOrDie().id,
      order: maxListOrder + 1,
    })
    set(({ lists }) => ({ lists: [...lists, { ...newList, items: [] }] }))
    return newList
  }
  const archiveList = async (id: number) => {
    const list = getList(id)
    if (!list) throw new Error("dafooq, no list")
    await db.collections.lists.update({ ...list, archived: true })
    await updateListOrders(id)

    return async () => {
      await db.collections.lists.update({ ...list, archived: false })
      const newState = get()
      newState.lists.splice(list.order, 0, list)
      set(newState)
      await updateListOrders(-1)
    }
  }
  const deleteList = async (id: number) => {
    const list = getList(id)
    if (!list) throw new Error("no list, wah wah")
    const { itemTags } = useBoardTagsStore.getState()
    const listItems = getListItems(list.id)
    await Promise.all([
      ...listItems.map((li) => db.collections.items.delete(li.id)),
      ...itemTags
        .filter((it) => listItems.some((li) => it.itemId === li.id))
        .map((it) => db.collections.itemTags.delete(it.id)),
      db.collections.lists.delete(list.id),
    ])
    await updateListOrders(id)

    return async () => {
      await Promise.all([
        ...listItems.map((li) => db.collections.items.create(li)),
        ...itemTags
          .filter((it) => listItems.some((li) => it.itemId === li.id))
          .map((it) => db.collections.itemTags.create(it)),
        db.collections.lists.create(list),
      ])
      const newState = get()
      newState.lists.splice(list.order, 0, list)
      set(newState)
      await updateListOrders(-1)
    }
  }
  const updateList = async (payload: List) => {
    const list = (await db.collections.lists.update(payload))!
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
    await db.collections.lists.update(newList)
    const items = await db.collections.items.findMany(
      (i) => i.listId === list.id && !i.archived
    )
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
          await db.collections.lists.update(list)
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
