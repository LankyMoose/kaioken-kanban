import { createStore } from "kaioken"
import { ClickedItem, ItemDragTarget } from "../types"
import { db } from "../idb"
import { useBoardTagsStore } from "./boardTags"
import { ListItem } from "../idb"

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

    const updateItemOrders = async (id: number) => {
      const newItems = await Promise.all(
        get()
          .items.filter((item) => item.listId === id)
          .map(async (item, i) => {
            if (item.order !== i) {
              item.order = i
              await db.collections.items.update(item)
            }
            return item
          })
      )
      set({
        items: get()
          .items.filter((item) => item.listId !== id)
          .concat(newItems),
      })
    }

    const insertItemAndReorderList = async (payload: ListItem) => {
      const items = getListItems(payload.listId).sort(
        (a, b) => a.order - b.order
      )
      items.splice(payload.order, 0, payload)
      return Promise.all(
        items
          .filter((item) => item.listId === payload.listId)
          .map(
            async (item, i) =>
              (await db.collections.items.update({ ...item, order: i }))!
          )
      )
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
      const itemList = getListItems(item.listId).sort(
        (a, b) => a.order - b.order
      )

      itemList.splice(clickedItem.index, 1)

      const applyItemOrder = async (item: ListItem, idx: number) => {
        if (item.order === idx) return item
        item.order = idx
        return (await db.collections.items.update(item))!
      }

      if (isOriginList) {
        itemList.splice(targetIdx, 0, item)
        const newItems = await Promise.all(itemList.map(applyItemOrder))
        set(({ items }) => ({
          items: items.map((i) => newItems.find((ni) => ni.id === i.id) ?? i),
        }))
      } else {
        const targetList = getListItems(itemDragTarget.listId).sort(
          (a, b) => a.order - b.order
        )
        targetList.splice(targetIdx, 0, item)
        const newOriginItems = await Promise.all(itemList.map(applyItemOrder))

        const newTargetListItems = await Promise.all(
          targetList.map(async (item, i) => {
            if (item.id === clickedItem.id) {
              item.order = i
              item.listId = itemDragTarget.listId
              return (await db.collections.items.update(item))!
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
      const maxListOrder = getMaxListOrder(listId)
      const item = await db.collections.items.create({
        listId,
        order: maxListOrder + 1,
      })
      set(({ items }) => ({ items: [...items, item] }))
      return item
    }
    const updateItem = async (payload: ListItem) => {
      const newItem = (await db.collections.items.update(payload))!
      set(({ items }) => ({
        items: items.map((item) => (item.id === newItem.id ? newItem : item)),
      }))
    }
    const restoreItem = async (payload: ListItem) => {
      const maxListOrder = getMaxListOrder(payload.listId)
      const newItem = await db.collections.items.create({
        ...payload,
        archived: false,
        order: maxListOrder + 1,
      })
      set(({ items }) => ({ items: [...items, newItem] }))
    }
    const deleteItem = async (payload: ListItem) => {
      const { itemTags } = useBoardTagsStore.getState()
      const tags = itemTags.filter((it) => it.itemId === payload.id)
      await Promise.all([
        ...tags.map((it) => db.collections.itemTags.delete(it.id)),
        db.collections.items.delete(payload.id),
      ])
      set((prev) => ({
        items: prev.items.filter((i) => i.id !== payload.id),
      }))
      await updateItemOrders(payload.listId)

      return async () => {
        const items = await insertItemAndReorderList(payload)
        await Promise.all(tags.map((it) => db.collections.itemTags.create(it)))
        set((prev) => ({
          items: prev.items
            .filter((i) => i.listId !== payload.listId)
            .concat(items),
        }))
        updateItemOrders(payload.listId)
      }
    }
    const archiveItem = async (payload: ListItem) => {
      await db.collections.items.update({ ...payload, archived: true })
      set((prev) => ({
        items: prev.items.filter((i) => i.id !== payload.id),
      }))
      await updateItemOrders(payload.listId)

      set((prev) => ({
        items: prev.items.filter((i) => i.id !== payload.id),
      }))

      return async () => {
        const item = (await db.collections.items.update({
          ...payload,
          archived: false,
        }))!
        const newItems = await insertItemAndReorderList(item)
        set((prev) => ({
          items: [
            ...prev.items.filter((i) => i.listId !== payload.listId),
            ...newItems,
          ],
        }))
      }
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
