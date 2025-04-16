import { watch } from "kaioken"

import { Item, List } from "$/db"
import { signal } from "kaioken"
import { PrevStateSignal } from "$/prevStateSignal"

type ItemDragState = {
  item: Item
  element: HTMLElement
  offset: { x: number; y: number }
  mousePos: { x: number; y: number }
  target: {
    listId: string
    index: number
  }
}

export const itemDragState = new PrevStateSignal<ItemDragState | null>(null)

type ListDragState = {
  list: List
  element: HTMLElement
  dragging: boolean
  offset: { x: number; y: number }
  mousePos: { x: number; y: number }
  target: {
    index: number
  }
}

export const listDragState = new PrevStateSignal<ListDragState | null>(null)

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

watch(() => {
  const prevItemDrag = itemDragState.prev
  const itemDrag = itemDragState.value

  if (!itemDrag && prevItemDrag) {
    // handle item drop
    console.log("DROP", prevItemDrag)
    itemDragState.value = null // erase 'prev' state
  } else if (itemDrag) {
    /**
     * handle item drag calcs:
     * - set auto scroll
     * - apply 'drop target' styles to drag targets
     */

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

      if (
        itemDrag.target.index !== index ||
        itemDrag.target.listId !== listId
      ) {
        itemDragState.value = {
          ...itemDrag,
          target: {
            listId,
            index,
          },
        }
      }
    }

    // if (
    //   clearTarget &&
    //   (itemDrag.target.listId !== itemDrag.item.listId ||
    //     itemDrag.target.index !== itemDrag.item.order + 1)
    // ) {
    //   console.log("DROP CLEAR")
    //   itemDragState.value = {
    //     ...itemDrag,
    //     target: {
    //       listId: itemDrag.item.listId,
    //       index: itemDrag.item.order + 1,
    //     },
    //   }
    // }
  }
})
