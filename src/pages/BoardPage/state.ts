import { watch } from "kaioken"

import { db, Item, List } from "$/db"
import { signal } from "kaioken"

type ItemDragState = {
  item: Item
  element: HTMLElement
  offset: { x: number; y: number }
  mousePos: { x: number; y: number }
  target: {
    listId: string
    index: number
  }
  saving?: boolean
}

export const itemDragState = signal<ItemDragState | null>(null)

type ListDragState = {
  list: List
  element: HTMLElement
  dragging: boolean
  offset: { x: number; y: number }
  mousePos: { x: number; y: number }
  target: {
    index: number
  }
  saving?: boolean
}

export const listDragState = signal<ListDragState | null>(null)

export const selectedItem = signal<Item | null>(null)
export const selectedList = signal<List | null>(null)

export type BoardElementsMap = {
  [listId: string]: {
    container: Kaioken.RefObject<HTMLDivElement>
    dropTarget: Kaioken.RefObject<HTMLDivElement>
    items: {
      ref: Kaioken.RefObject<HTMLButtonElement>
      item: Item
    }[]
  }
}
export const boardElementsMap: BoardElementsMap = {}

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

export const handleItemDrop = async () => {
  const drag = itemDragState.value
  if (!drag) return
  const isOriginList = drag.item.listId === drag.target.listId

  const targetIdx =
    isOriginList && drag.item.order <= drag.target.index
      ? drag.target.index - 1
      : drag.target.index

  if (
    drag.item.order === targetIdx &&
    drag.item.listId === drag.target.listId
  ) {
    itemDragState.value = null
    return
  }

  await db.transaction(async (ctx) => {
    const srcListItems = await ctx.items.findMany(
      (i) => i.listId === drag.item.listId
    )
    srcListItems.sort((a, b) => a.order - b.order)
    srcListItems.splice(drag.item.order, 1)
    if (isOriginList) {
      srcListItems.splice(targetIdx, 0, drag.item)

      await ctx.items.upsert(
        ...srcListItems.map((item, idx) => ({
          ...item,
          order: idx,
        }))
      )
      return
    }

    const tgtListItems = await ctx.items.findMany(
      (i) => i.listId === drag.target.listId
    )
    tgtListItems.sort((a, b) => a.order - b.order)
    tgtListItems.splice(targetIdx, 0, {
      ...drag.item,
      listId: drag.target.listId,
    })
    await ctx.items.upsert(
      ...srcListItems.map((item, idx) => ({ ...item, order: idx }))
    )
    await ctx.items.upsert(
      ...tgtListItems.map((item, idx) => ({ ...item, order: idx }))
    )
    console.log("DROP - save complete", drag.target.listId, targetIdx)
  })
  itemDragState.value = null
}

watch(() => {
  const itemDrag = itemDragState.value
  if (!itemDrag) return

  const { mousePos, offset } = itemDrag
  const currentDragItemCoords = {
    x: mousePos.x - offset.x,
    y: mousePos.y - offset.y,
  }

  for (const listId in boardElementsMap) {
    const { container, items } = boardElementsMap[listId]
    const containerBounds = container.current!.getBoundingClientRect()
    if (
      mousePos.x < containerBounds.left ||
      mousePos.x > containerBounds.right ||
      mousePos.y < containerBounds.top ||
      mousePos.y > containerBounds.bottom
    ) {
      continue
    }

    let actualItems = items
      .filter(({ item }) => item.id !== itemDrag.item.id)
      .sort((a, b) => a.item.order - b.item.order)

    let index = actualItems.length

    // check item offsets
    for (let i = 0; i < actualItems.length; i++) {
      const item = actualItems[i]
      const itemBounds = item.ref.current!.getBoundingClientRect()
      if (currentDragItemCoords.y < itemBounds.top) {
        index = i
        break
      }
    }

    if (itemDrag.item.listId === listId && itemDrag.item.order <= index) {
      index++
    }

    if (itemDrag.target.index !== index || itemDrag.target.listId !== listId) {
      itemDragState.value = {
        ...itemDrag,
        target: {
          listId,
          index,
        },
      }
    }
  }
})
