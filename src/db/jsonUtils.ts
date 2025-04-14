import { Board, db, ItemTag, Item, List, Tag } from "./index"

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
  })
}

export async function importFromJSON(data: string) {
  try {
    const parsed = JSON.parse(data)
    for (const key in db.collections) {
      if (!(key in parsed))
        throw new Error(`store '${key}' not found in import data`)
    }
    const { boards, lists, items, tags, itemTags } = parsed as {
      boards: Board[]
      lists: List[]
      items: Item[]
      tags: Tag[]
      itemTags: ItemTag[]
    }

    await db.transaction(async (ctx) => {
      await ctx.boards.clear()
      await ctx.boards.upsert(...boards)
      await ctx.lists.upsert(...lists)
      await ctx.items.upsert(...items)
      await ctx.tags.upsert(...tags)
      await ctx.itemTags.upsert(...itemTags)
    })
  } catch (error) {
    alert("an error occured while importing your data: " + error)
  }
}
