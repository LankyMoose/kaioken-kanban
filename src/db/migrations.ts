import { OnDBUpgradeCallbackContext } from "async-idb-orm"
import { Board, List, Item, Tag, ItemTag } from "./types"
import type * as schema from "./schema"

export type V3Board = {
  id: number
  title: string
  order: number
  uuid: string
  created: Date
  archived: boolean
}
export type V3List = {
  id: number
  boardId: number
  title: string
  created: Date
  archived: boolean
  order: number
}
export type V3Item = {
  id: number
  listId: number
  title: string
  content: string
  created: Date
  archived: boolean
  referenceItems: number[]
  order: number
}
export type V3Tag = {
  id: number
  boardId: number
  title: string
  color: string
}

export type V3ItemTag = {
  boardId: number
  id: number
  itemId: number
  tagId: number
}

export const transform_3_4 = (
  data: [V3Board[], V3List[], V3Item[], V3Tag[], V3ItemTag[]]
) => {
  const [boards, lists, items, tags, itemTags] = data

  const newBoards: Board[] = []
  const newLists: List[] = []
  const newItems: Item[] = []
  const newTags: Tag[] = []
  const newItemTags: ItemTag[] = []

  const oldItemIdsToNew = new Map<number, string>()

  for (const board of boards) {
    const { uuid, id: boardId, ...rest } = board
    const newBoard: Board = {
      ...rest,
      id: uuid,
    }
    newBoards.push(newBoard)

    for (const list of lists.filter((l) => l.boardId === boardId)) {
      const { id: listId, ...rest } = list
      const newList: List = {
        ...rest,
        id: crypto.randomUUID(),
        boardId: newBoard.id,
      }
      newLists.push(newList)

      for (const item of items.filter((i) => i.listId === listId)) {
        const { id: itemId, ...rest } = item
        const newItem: Item = {
          ...rest,
          id: crypto.randomUUID(),
          listId: newList.id,
          refereceItems: [],
        }
        oldItemIdsToNew.set(itemId, newItem.id)
        newItems.push(newItem)
      }
    }

    for (const tag of tags.filter((t) => t.boardId === boardId)) {
      const { id: tagId, ...rest } = tag
      const newTag: Tag = {
        ...rest,
        id: crypto.randomUUID(),
        boardId: newBoard.id,
      }
      newTags.push(newTag)

      for (const itemTag of itemTags.filter(
        (it) => it.boardId === boardId && it.tagId === tagId
      )) {
        const { id: itemTagId, ...rest } = itemTag
        const newItemTag: ItemTag = {
          ...rest,
          id: crypto.randomUUID(),
          boardId: newBoard.id,
          tagId: newTag.id,
          itemId: oldItemIdsToNew.get(itemTag.itemId)!,
        }
        newItemTags.push(newItemTag)
      }
    }
  }
  return [newBoards, newLists, newItems, newTags, newItemTags] as const
}

export const migrate_3_4 = async (
  ctx: OnDBUpgradeCallbackContext<typeof schema>
) => {
  console.debug("beginning migration 3 -> 4...")
  const [boards, lists, items, tags, itemTags] = (await Promise.all([
    ctx.collections.boards.all(),
    ctx.collections.lists.all(),
    ctx.collections.items.all(),
    ctx.collections.tags.all(),
    ctx.collections.itemTags.all(),
  ])) as any as [V3Board[], V3List[], V3Item[], V3Tag[], V3ItemTag[]]

  console.debug("old data loaded, beginning transformation...", {
    boards,
    lists,
    items,
    tags,
    itemTags,
  })

  const [newBoards, newLists, newItems, newTags, newItemTags] = transform_3_4([
    boards,
    lists,
    items,
    tags,
    itemTags,
  ])

  console.debug("old data transformed, replacing...", {
    newBoards,
    newLists,
    newItems,
    newTags,
    newItemTags,
  })

  await ctx.collections.boards.clear()
  await ctx.collections.lists.clear()
  await ctx.collections.items.clear()
  await ctx.collections.tags.clear()
  await ctx.collections.itemTags.clear()

  await ctx.collections.boards.upsert(...newBoards)
  await ctx.collections.lists.upsert(...newLists)
  await ctx.collections.items.upsert(...newItems)
  await ctx.collections.tags.upsert(...newTags)
  await ctx.collections.itemTags.upsert(...newItemTags)

  console.debug("migration 3 -> 4 complete!")
}
