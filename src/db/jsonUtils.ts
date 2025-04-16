import { VERSION } from "./constants"
import { Board, db, ItemTag, Item, List, Tag } from "./index"
import {
  transform_3_4,
  V3Board,
  V3Item,
  V3ItemTag,
  V3List,
  V3Tag,
} from "./migrations"

export async function exportToJSON(): Promise<string> {
  const [boards, lists, items, tags, itemTags] = await Promise.all([
    db.collections.boards.all(),
    db.collections.lists.all(),
    db.collections.items.all(),
    db.collections.tags.all(),
    db.collections.itemTags.all(),
  ])
  return JSON.stringify({
    boards,
    lists,
    items,
    tags,
    itemTags,
    $db_version: VERSION,
  })
}

const bulkInsert = async <T extends keyof typeof db.collections>(
  tx: IDBTransaction,
  collectionName: T,
  items: any
) => {
  await Promise.all(
    items.map((item: any) => {
      return new Promise<void>((resolve, reject) => {
        const req = tx.objectStore(collectionName).put(item)
        req.onerror = () => {
          reject(req.error)
        }
        req.onsuccess = () => {
          resolve()
        }
      })
    })
  )
}

export async function importFromJSON(data: string) {
  try {
    const parsed = JSON.parse(data)
    for (const key in db.collections) {
      if (!(key in parsed))
        throw new Error(`store '${key}' not found in import data`)
    }
    const { boards, lists, items, tags, itemTags, $db_version } = parsed as {
      boards: Board[]
      lists: List[]
      items: Item[]
      tags: Tag[]
      itemTags: ItemTag[]
      $db_version?: number
    }

    let v = $db_version || 0
    if (isNaN(v)) v = 0

    let transformed = [boards, lists, items, tags, itemTags] as const
    while (v < 4) {
      switch (v) {
        case 3:
          transformed = transform_3_4([
            boards as any as V3Board[],
            lists as any as V3List[],
            items as any as V3Item[],
            tags as any as V3Tag[],
            itemTags as any as V3ItemTag[],
          ])
          break
      }
      v++
    }

    await db.transaction(async (ctx, tx) => {
      await ctx.boards.clear()
      await ctx.lists.clear()
      await ctx.items.clear()
      await ctx.tags.clear()
      await ctx.itemTags.clear()

      const [boards, lists, items, tags, itemTags] = transformed

      await bulkInsert(tx, "boards", boards)
      await bulkInsert(tx, "lists", lists)
      await bulkInsert(tx, "items", items)
      await bulkInsert(tx, "tags", tags)
      await bulkInsert(tx, "itemTags", itemTags)
    })
  } catch (error) {
    alert("an error occured while importing your data: " + error)
  }
}
