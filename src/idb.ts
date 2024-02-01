import { idb, model, Field } from "async-idb-orm"
import { List, ListItem, Board } from "./types"

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
}

const items = model({
  id: Field.number({ primaryKey: true }),
  listId: Field.number(),
  title: Field.string({ default: () => "" }),
  content: Field.string({ default: () => "" }),
  created: Field.date({ default: () => new Date() }),
  archived: Field.boolean({ default: () => false }),
  refereceItems: Field.array(Field.number()),
  order: Field.number({ default: () => 0 }),
})

const lists = model({
  id: Field.number({ primaryKey: true }),
  boardId: Field.number(),
  title: Field.string({ default: () => "" }),
  created: Field.date({ default: () => new Date() }),
  archived: Field.boolean({ default: () => false }),
  order: Field.number({ default: () => 0 }),
})

const boards = model({
  id: Field.number({ primaryKey: true }),
  title: Field.string({ default: () => "" }),
  created: Field.date({ default: () => new Date() }),
  archived: Field.boolean({ default: () => false }),
  order: Field.number({ default: () => 0 }),
})

const db = idb("kanban", { boards, lists, items })

// Boards

const loadBoards = () => db.boards.all() as Promise<Board[]>

const updateBoard = (board: Board) => db.boards.update(board) as Promise<Board>

const addBoard = () => db.boards.create({}) as Promise<Board>

const deleteBoard = (board: Board) =>
  db.boards.delete(board.id) as Promise<void>

const archiveBoard = (board: Board) =>
  db.boards.update({ ...board, archived: true }) as Promise<Board>

// Lists

const loadLists = (boardId: number) =>
  db.lists.findMany((l) => {
    return l.boardId === boardId && !l.archived
  }) as Promise<List[]>

const updateList = (list: List) => db.lists.update(list) as Promise<List>

const addList = (boardId: number, order = 0) =>
  db.lists.create({ boardId, order }) as Promise<List>

const deleteList = (list: List) => db.lists.delete(list.id) as Promise<void>

const archiveList = (list: List) =>
  db.lists.update({ ...list, archived: true }) as Promise<List>

// Items

const loadItems = (listId: number) =>
  db.items.findMany((i) => {
    return i.listId === listId && !i.archived
  }) as Promise<ListItem[]>

const updateItem = (item: ListItem) =>
  db.items.update(item) as Promise<ListItem>

const addItem = (listId: number, order = 0) =>
  db.items.create({ listId, refereceItems: [], order }) as Promise<ListItem>

const deleteItem = (item: ListItem) => db.items.delete(item.id) as Promise<void>

const archiveItem = (item: ListItem) =>
  db.items.update({ ...item, archived: true }) as Promise<ListItem>
