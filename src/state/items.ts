import { createStore } from "kaioken"
import { ListItem, ClickedItem, ItemDragTarget } from "../types"
import { useGlobal } from "./global"
import * as db from "../idb"
import { useBoardTagsStore } from "./boardTags"

export { useItemsStore, getListItems }

const getListItems = (listId: number) =>
  useItemsStore.getState().items.filter((item) => item.listId === listId)

const useItemsStore = createStore(
  { items: [] as ListItem[] },
  function (set, get) {
    const getMaxListOrder = (listId: number) =>
      getListItems(listId).reduce(
        (acc, item) => (item.order > acc ? item.order : acc),
        -1
      )
    const removeItemAndReorderList = async (payload: ListItem) => {
      const updatedListitems = await Promise.all(
        getListItems(payload.listId)
          .filter((i) => i.id !== payload.id)
          .map(async (item, i) => {
            if (item.order === i) return item
            item.order = i
            return await db.updateItem(item)
          })
      )
      return get()
        .items.filter((item) => item.id !== payload.id)
        .map((item) => updatedListitems.find((i) => i.id === item.id) ?? item)
    }

    const handleItemDrop = async (
      clickedItem: ClickedItem,
      itemDragTarget: ItemDragTarget
    ) => {
      const isOriginList = clickedItem.listId === itemDragTarget.listId
      const item = get().items.find((item) => item.id === clickedItem.id)!
      const targetIdx =
        isOriginList && clickedItem.index <= itemDragTarget.index
          ? itemDragTarget.index - 1
          : itemDragTarget.index

      const moved =
        item.order !== targetIdx || item.listId !== itemDragTarget.listId
      if (!moved) return
      const itemList = getListItems(item.listId)

      itemList.sort((a, b) => a.order - b.order)
      itemList.splice(clickedItem.index, 1)

      const applyItemOrder = (item: ListItem, idx: number) => {
        if (item.order === idx) return item
        item.order = idx
        return db.updateItem(item)
      }

      if (isOriginList) {
        itemList.splice(targetIdx, 0, item)
        const newItems = await Promise.all(itemList.map(applyItemOrder))
        set(({ items }) => ({
          items: items.map((i) => newItems.find((ni) => ni.id === i.id) ?? i),
        }))
      } else {
        const targetList = getListItems(itemDragTarget.listId)
        targetList.splice(targetIdx, 0, item)
        const newOriginItems = await Promise.all(itemList.map(applyItemOrder))

        const newTargetListItems = await Promise.all(
          targetList.map((item, i) => {
            if (item.id === clickedItem.id) {
              item.order = i
              item.listId = itemDragTarget.listId
              return db.updateItem(item)
            }
            return applyItemOrder(item, i)
          })
        )
        set(({ items }) => ({
          items: items.map(
            (i) =>
              newOriginItems.find((no) => no.id === i.id) ??
              newTargetListItems.find((nt) => nt.id === i.id) ??
              i
          ),
        }))
      }
    }
    const addItem = async (listId: number) => {
      const { setClickedItem } = useGlobal()
      const maxListOrder = getMaxListOrder(listId)
      const item = await db.addItem(listId, maxListOrder + 1)
      set(({ items }) => ({ items: [...items, item] }))

      setClickedItem({
        item,
        id: item.id,
        dialogOpen: true,
        dragging: false,
        listId,
        index: item.order,
      })
    }
    const updateItem = async (payload: ListItem) => {
      const newItem = await db.updateItem(payload)
      set(({ items }) => ({
        items: items.map((item) => (item.id === newItem.id ? newItem : item)),
      }))
    }
    const restoreItem = async (payload: ListItem) => {
      const maxListOrder = getMaxListOrder(payload.listId)
      const newItem = await db.updateItem({
        ...payload,
        archived: false,
        order: maxListOrder + 1,
      })
      set(({ items }) => ({ items: [...items, newItem] }))
    }
    const deleteItem = async (payload: ListItem) => {
      const confirmDelete = confirm(
        "Are you sure you want to delete this item? It can't be undone!"
      )
      if (!confirmDelete) return
      const { itemTags } = useBoardTagsStore.getState()
      await Promise.all([
        ...itemTags
          .filter((it) => it.itemId === payload.id)
          .map((it) => db.deleteItemTag(it)),
        db.deleteItem(payload),
      ])

      const newItems = await removeItemAndReorderList(payload)
      set({ items: newItems })
    }
    const archiveItem = async (payload: ListItem) => {
      await db.archiveItem(payload)
      const newItems = await removeItemAndReorderList(payload)
      set({ items: newItems })
    }
    const setState = async (payload: ListItem[]) => {
      set({ items: payload })
    }
    const getListItems = (listId: number) => {
      return get().items.filter((item) => item.listId === listId)
    }
    return {
      addItem,
      archiveItem,
      deleteItem,
      updateItem,
      restoreItem,
      handleItemDrop,
      getListItems,
      setState,
    }
  }
)
