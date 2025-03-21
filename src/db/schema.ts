import { Collection } from "async-idb-orm"
import {
  Board,
  BoardDTO,
  Item,
  ItemDTO,
  ItemTag,
  ItemTagDTO,
  List,
  ListDTO,
  Tag,
  TagDTO,
} from "./types"

export { boards, lists, items, tags, itemTags }

const boards = Collection.create<Board, BoardDTO>()
  .withKeyPath("id")
  .withTransformers({
    create(data) {
      return {
        ...data,
        title: data.title ?? "New Board",
        created: new Date(),
        archived: false,
        id: crypto.randomUUID(),
        order: 0,
      }
    },
  })

const lists = Collection.create<List, ListDTO>()
  .withKeyPath("id")
  .withTransformers({
    create(data) {
      return {
        ...data,
        title: data.title ?? "New List",
        created: new Date(),
        archived: false,
        id: crypto.randomUUID(),
        order: data.order ?? 0,
      }
    },
  })

const items = Collection.create<Item, ItemDTO>()
  .withKeyPath("id")
  .withTransformers({
    create(data) {
      return {
        ...data,
        title: data.title ?? "New Item",
        content: "",
        created: new Date(),
        archived: false,
        id: crypto.randomUUID(),
        refereceItems: [],
        order: data.order ?? 0,
      }
    },
  })

const tags = Collection.create<Tag, TagDTO>()
  .withKeyPath("id")
  .withTransformers({
    create(data) {
      return {
        ...data,
        id: crypto.randomUUID(),
        title: "",
        color: "#402579",
      }
    },
  })

const itemTags = Collection.create<ItemTag, ItemTagDTO>()
  .withKeyPath("id")
  .withTransformers({
    create(data) {
      return {
        ...data,
        id: crypto.randomUUID(),
      }
    },
  })
