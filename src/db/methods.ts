import { Board, db, ItemTag, Item, List, Tag } from "./index"

export const JsonUtils = {
  export: async () => {
    const [boards, lists, items, tags, itemTags] = await Promise.all([
      db.boards.all(),
      db.lists.all(),
      db.items.all(),
      db.tags.all(),
      db.itemTags.all(),
    ])
    return JSON.stringify({
      boards,
      lists,
      items,
      tags,
      itemTags,
    })
  },
  import: async (data: string) => {
    try {
      const parsed = JSON.parse(data)
      ;["boards", "lists", "items", "tags", "itemTags"].forEach((store) => {
        if (!(store in parsed))
          throw new Error(`store '${store}' not found in import data`)
      })

      await Promise.all([
        db.boards.clear(),
        db.lists.clear(),
        db.items.clear(),
        db.tags.clear(),
        db.itemTags.clear(),
      ])

      const { boards, lists, items, tags, itemTags } = parsed as {
        boards: Board[]
        lists: List[]
        items: Item[]
        tags: Tag[]
        itemTags: ItemTag[]
      }
      await Promise.all([
        ...boards.map((b) => db.boards.create(b)),
        ...lists.map((l) => db.lists.create(l)),
        ...items.map((i) => db.items.create(i)),
        ...tags.map((t) => db.tags.create(t)),
        ...itemTags.map((it) => db.itemTags.create(it)),
      ])
    } catch (error) {
      alert("an error occured while importing your data: " + error)
    }
  },
}

export const dbMethods = {
  boards: {
    all: () => db.boards.all(),
    update: (board: Board) => db.boards.update(board),
    add: async () => {
      const board = await db.boards.create({})
      await dbMethods.lists.add(board.id)
      return board
    },
    delete: (board: Board) => db.boards.delete(board.id),
    archive: async (board: Board) =>
      db.boards.update({ ...board, archived: true }),
  },
  lists: {
    loadByBoardId: (boardId: string, archived = false) => {
      return db.lists.findMany(
        (l) => l.boardId === boardId && l.archived === archived
      )
    },
    update: (list: List) => db.lists.update(list),
    add: (boardId: string, order = 0) => db.lists.create({ boardId, order }),
    delete: (list: List) => db.lists.delete(list.id),
    archive: (list: List) => db.lists.update({ ...list, archived: true }),
  },
  items: {
    loadByListId: (listId: string, archived = false) => {
      return db.items.findMany(
        (i) => i.listId === listId && i.archived === archived
      )
    },
    update: (item: Item) => db.items.update(item),
    add: (listId: string, order = 0) => db.items.create({ listId, order }),
    delete: (item: Item) => db.items.delete(item.id),
    archive: (item: Item) => db.items.update({ ...item, archived: true }),
  },
  tags: {
    loadByBoardId: (boardId: string) =>
      db.tags.findMany((t) => t.boardId === boardId),
    update: (tag: Tag) => db.tags.update(tag),
    add: (boardId: string) => db.tags.create({ boardId }) as Promise<Tag>,
    delete: (tag: Tag) => db.tags.delete(tag.id),
    deleteWithRelations: async (tag: Tag) => {
      await db.tags.delete(tag.id)
      const itemTags = await db.itemTags.findMany((it) => it.tagId === tag.id)
      await Promise.all(
        itemTags.map((itemTag) => db.itemTags.delete(itemTag.id))
      )
    },
  },
  itemTags: {
    add: (boardId: string, itemId: string, tagId: string) =>
      db.itemTags.create({
        boardId,
        itemId,
        tagId,
      }),
    delete: (itemTag: ItemTag) => db.itemTags.delete(itemTag.id),
  },
}
