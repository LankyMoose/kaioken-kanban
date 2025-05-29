import { idb, Collection } from "async-idb-orm"

export { addBoard, loadTags, deleteTagAndRelations, JsonUtils, db }

export type Board = {
  id: number
  uuid: string
  title: string
  created: Date
  archived: boolean
  order: number
}

export type BoardDTO = {
  id?: number
  uuid?: string
  title?: string
  created?: Date
  archived?: boolean
  order?: number
}

const boards = Collection.create<Board, BoardDTO>()
  .withKeyPath("id", { autoIncrement: true })
  .withTransformers({
    create: (dto: BoardDTO) => ({
      ...dto,
      uuid: dto.uuid ?? crypto.randomUUID(),
      created: dto.created ?? new Date(),
      archived: dto.archived ?? false,
      order: dto.order ?? 0,
      title: dto.title ?? "",
    }),
  })

export type List = {
  id: number
  boardId: number
  title: string
  created: Date
  archived: boolean
  order: number
}

export type ListDTO = {
  id?: number
  boardId: number
  title?: string
  created?: Date
  archived?: boolean
  order?: number
}

const lists = Collection.create<List, ListDTO>()
  .withKeyPath("id", { autoIncrement: true })
  .withTransformers({
    create: (dto: ListDTO) => ({
      ...dto,
      created: dto.created ?? new Date(),
      archived: dto.archived ?? false,
      order: dto.order ?? 0,
      title: dto.title ?? "",
    }),
  })

export type ListItem = {
  id: number
  listId: number
  title: string
  content: string
  created: Date
  archived: boolean
  refereceItems: number[]
  order: number
}

export type ListItemDTO = {
  id?: number
  listId: number
  title?: string
  content?: string
  created?: Date
  archived?: boolean
  refereceItems?: number[]
  order?: number
}

const items = Collection.create<ListItem, ListItemDTO>()
  .withKeyPath("id", { autoIncrement: true })
  .withTransformers({
    create: (dto: ListItemDTO) => ({
      ...dto,
      created: dto.created ?? new Date(),
      archived: dto.archived ?? false,
      order: dto.order ?? 0,
      title: dto.title ?? "",
      content: dto.content ?? "",
      refereceItems: dto.refereceItems ?? [],
    }),
  })

export type Tag = {
  id: number
  boardId: number
  title: string
  color: string
}

export type TagDTO = {
  id?: number
  boardId: number
  title?: string
  color?: string
}

const tags = Collection.create<Tag, TagDTO>()
  .withKeyPath("id", { autoIncrement: true })
  .withTransformers({
    create: (dto: TagDTO) => ({
      ...dto,
      title: dto.title ?? "",
      color: dto.color ?? "#402579",
    }),
  })

export type ItemTag = {
  id: number
  boardId: number
  itemId: number
  tagId: number
}

export type ItemTagDTO = {
  id?: number
  boardId: number
  itemId: number
  tagId: number
}

const itemTags = Collection.create<ItemTag, ItemTagDTO>().withKeyPath("id", {
  autoIncrement: true,
})

const db = idb("kanban", {
  schema: { boards, lists, items, tags, itemTags },
  version: 3,
})

const JsonUtils = {
  export: async () => {
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
  },
  import: async (data: string) => {
    try {
      const parsed = JSON.parse(data)
      ;["boards", "lists", "items", "tags", "itemTags"].forEach((store) => {
        if (!(store in parsed))
          throw new Error(`store '${store}' not found in import data`)
      })

      await Promise.all([
        db.collections.boards.clear(),
        db.collections.lists.clear(),
        db.collections.items.clear(),
        db.collections.tags.clear(),
        db.collections.itemTags.clear(),
      ])

      const { boards, lists, items, tags, itemTags } = parsed as {
        boards: Board[]
        lists: List[]
        items: ListItem[]
        tags: Tag[]
        itemTags: ItemTag[]
      }
      await Promise.all([
        ...boards.map((b) => db.collections.boards.create(b)),
        ...lists.map((l) => db.collections.lists.create(l)),
        ...items.map((i) => db.collections.items.create(i)),
        ...tags.map((t) => db.collections.tags.create(t)),
        ...itemTags.map((it) => db.collections.itemTags.create(it)),
      ])
    } catch (error) {
      alert("an error occured while importing your data: " + error)
    }
  },
}

const addBoard = async () => {
  const board = await db.collections.boards.create({})
  const list = await db.collections.lists.create({
    boardId: board.id,
    order: 0,
  })
  await db.collections.items.create({ listId: list.id, order: 0 })
  return board
}

const loadTags = async (
  boardId: number
): Promise<{ tags: Tag[]; itemTags: ItemTag[] }> => {
  const [tags, itemTags] = await Promise.all([
    db.collections.tags.findMany((t) => t.boardId === boardId),
    db.collections.itemTags.findMany((t) => t.boardId === boardId),
  ])
  return {
    tags,
    itemTags,
  }
}

const deleteTagAndRelations = async (tag: Tag) => {
  await db.collections.tags.delete(tag.id)
  const iTags = await db.collections.itemTags.findMany(
    (it) => it.tagId === tag.id
  )
  await Promise.all(
    iTags.map((iTag) => db.collections.itemTags.delete(iTag.id))
  )
}
