import { idb, model, Field, InferRecord, InferDto } from "async-idb-orm"

export {
  // boards
  loadBoards,
  updateBoard,
  addBoard,
  deleteBoard,
  archiveBoard,
  // lists
  loadLists,
  updateList,
  addList,
  deleteList,
  archiveList,
  // items
  loadItems,
  updateItem,
  addItem,
  deleteItem,
  archiveItem,
  // tags
  loadTags,
  updateTag,
  addTag,
  deleteTag,
  addItemTag,
  deleteItemTag,
  // import/export
  JsonUtils,
}

const boards = model({
  id: Field.number({ key: true }),
  uuid: Field.string({ default: () => crypto.randomUUID() as string }),
  title: Field.string({ default: () => "" }),
  created: Field.date({ default: () => new Date() }),
  archived: Field.boolean({ default: () => false }),
  order: Field.number({ default: () => 0 }),
})

export type Board = InferRecord<typeof boards>
export type BoardDTO = InferDto<typeof boards>

const lists = model({
  id: Field.number({ key: true }),
  boardId: Field.number(),
  title: Field.string({ default: () => "" }),
  created: Field.date({ default: () => new Date() }),
  archived: Field.boolean({ default: () => false }),
  order: Field.number({ default: () => 0 }),
})

export type List = InferRecord<typeof lists>
export type ListDTO = InferDto<typeof lists>

const items = model({
  id: Field.number({ key: true }),
  listId: Field.number(),
  title: Field.string({ default: () => "" }),
  content: Field.string({ default: () => "" }),
  created: Field.date({ default: () => new Date() }),
  archived: Field.boolean({ default: () => false }),
  refereceItems: Field.array(Field.number()),
  order: Field.number({ default: () => 0 }),
})

export type ListItem = InferRecord<typeof items>
export type ListItemDTO = InferDto<typeof items>

const tags = model({
  id: Field.number({ key: true }),
  boardId: Field.number(),
  title: Field.string({ default: () => "" }),
  color: Field.string({ default: () => "#402579" }),
})

export type Tag = InferRecord<typeof tags>
export type TagDTO = InferDto<typeof tags>

const itemTags = model({
  id: Field.number({ key: true }),
  itemId: Field.number(),
  tagId: Field.number(),
  boardId: Field.number(),
})

export type ItemTag = InferRecord<typeof itemTags>
export type ItemTagDTO = InferDto<typeof itemTags>

const db = idb("kanban", { boards, lists, items, tags, itemTags }, 3)

const JsonUtils = {
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
        items: ListItem[]
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

// Boards

const loadBoards = async () => await db.boards.all()

const updateBoard = (board: Board) => db.boards.update(board) as Promise<Board>

const addBoard = async () => {
  const board = await db.boards.create({})
  if (!board) throw new Error("failed to create board")
  await addList(board.id)
  return board as Board
}

const deleteBoard = (board: Board) => db.boards.delete(board.id)

const archiveBoard = (board: Board) =>
  db.boards.update({ ...board, archived: true })

// Lists

const loadLists = (boardId: number, archived = false) =>
  db.lists.findMany((l) => {
    return l.boardId === boardId && l.archived === archived
  }) as Promise<List[]>

const updateList = (list: List) => db.lists.update(list) as Promise<List>

const addList = (boardId: number, order = 0) =>
  db.lists.create({ boardId, order }) as Promise<List>

const deleteList = (list: List) => db.lists.delete(list.id)

const archiveList = (list: List) =>
  db.lists.update({ ...list, archived: true }) as Promise<List>

// Items

const loadItems = (listId: number, archived = false) =>
  db.items.findMany((i) => {
    return i.listId === listId && i.archived === archived
  }) as Promise<ListItem[]>

const updateItem = (item: ListItem) =>
  db.items.update(item) as Promise<ListItem>

const addItem = (listId: number, order = 0) =>
  db.items.create({ listId, refereceItems: [], order }) as Promise<ListItem>

const deleteItem = (item: ListItem) => db.items.delete(item.id)

const archiveItem = (item: ListItem) =>
  db.items.update({ ...item, archived: true }) as Promise<ListItem>

// Tags

const loadTags = async (
  boardId: number
): Promise<{ tags: Tag[]; itemTags: ItemTag[] }> => {
  const [tags, itemTags] = await Promise.all([
    db.tags.findMany((t) => t.boardId === boardId),
    db.itemTags.findMany((t) => t.boardId === boardId),
  ])
  return {
    tags,
    itemTags,
  }
}

const updateTag = (tag: Tag) => db.tags.update(tag) as Promise<Tag>

const addTag = (boardId: number) => db.tags.create({ boardId }) as Promise<Tag>

const deleteTag = async (tag: Tag) => db.tags.delete(tag.id)

const addItemTag = (boardId: number, itemId: number, tagId: number) =>
  db.itemTags.create({
    boardId,
    itemId,
    tagId,
  }) as Promise<ItemTag>

const deleteItemTag = (itemTag: ItemTag) => db.itemTags.delete(itemTag.id)
