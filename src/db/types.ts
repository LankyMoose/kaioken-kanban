export type {
  Board,
  BoardDTO,
  List,
  ListDTO,
  Item,
  ItemDTO,
  Tag,
  TagDTO,
  ItemTag,
  ItemTagDTO,
}

type Board = {
  id: string
  title: string
  created: Date
  archived: boolean
  order: number
}

type BoardDTO = {
  title?: string
}

type List = {
  id: string
  boardId: string
  title: string
  created: Date
  archived: boolean
  order: number
}

type ListDTO = {
  boardId: string
  title?: string
  order: number
}

type Item = {
  id: string
  listId: string
  title: string
  content: string
  created: Date
  archived: boolean
  refereceItems: string[]
  order: number
}

type ItemDTO = {
  listId: string
  title?: string
  order?: number
}

type Tag = {
  id: string
  boardId: string
  title: string
  color: string
}

type TagDTO = {
  boardId: string
}

type ItemTag = {
  id: string
  itemId: string
  tagId: string
  boardId: string
}

type ItemTagDTO = {
  itemId: string
  tagId: string
  boardId: string
}
