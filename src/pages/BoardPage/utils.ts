import { Item, db } from "$/db"
import { boardElementsMap } from "./state"

export async function deleteItemAndReorder(items: Item[], item: Item) {
  return db.transaction(async (ctx) => {
    items.splice(item.order, 1)
    if (items.some((item, idx) => item.order !== idx)) {
      const newItems = items.map((item, idx) => ({ ...item, order: idx }))
      console.log({ newItems })
      await ctx.items.upsert(...newItems)
    }

    await ctx.items.delete(item.id)
    boardElementsMap[item.listId].items.splice(item.order, 1)
  })
}

export async function createItemAndReorder(items: Item[], item: Item) {
  return db.transaction(async (ctx) => {
    await ctx.items.create(item)
    items.splice(item.order, 0, item)
    if (items.some((item, idx) => item.order !== idx)) {
      const newItems = items.map((item, idx) => ({ ...item, order: idx }))
      await ctx.items.upsert(...newItems.filter((i) => i.id !== item.id))
    }
  })
}
