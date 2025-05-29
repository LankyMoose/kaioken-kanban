import { createStore } from "kaioken"
import {
  db,
  ItemTag,
  Tag,
  deleteTagAndRelations as db_deleteTagAndRelations,
} from "../idb"

export { useBoardTagsStore }

const useBoardTagsStore = createStore(
  { tags: [] as Tag[], itemTags: [] as ItemTag[] },
  function (set) {
    const addItemTag = async ({
      boardId,
      itemId,
      tagId,
    }: {
      boardId: number
      itemId: number
      tagId: number
    }) => {
      const itemTag = await db.collections.itemTags.create({
        boardId,
        itemId,
        tagId,
      })
      set((prev) => ({ ...prev, itemTags: [...prev.itemTags, itemTag] }))
    }
    const removeItemTag = async (itemTag: ItemTag) => {
      await db.collections.itemTags.delete(itemTag.id)
      set((prev) => ({
        ...prev,
        itemTags: prev.itemTags.filter((it) => it.id !== itemTag.id),
      }))
    }

    const deleteTagAndRelations = async (tag: Tag) => {
      await db_deleteTagAndRelations(tag)
      set((prev) => ({
        tags: prev.tags.filter((t) => t.id !== tag.id),
        itemTags: prev.itemTags.filter((it) => it.tagId !== tag.id),
      }))
    }

    const addTag = async (boardId: number) => {
      const tag = await db.collections.tags.create({ boardId })
      set((prev) => ({ ...prev, tags: [...prev.tags, tag] }))
    }

    const updateTag = async (tag: Tag) => {
      const newTag = (await db.collections.tags.update(tag))!
      set((prev) => ({
        ...prev,
        tags: prev.tags.map((t) => (t.id === tag.id ? newTag : t)),
      }))
    }

    const setState = async ({
      tags,
      itemTags,
    }: {
      tags: Tag[]
      itemTags: ItemTag[]
    }) => {
      set({ tags, itemTags })
    }
    return {
      addItemTag,
      removeItemTag,
      setState,
      deleteTagAndRelations,
      addTag,
      updateTag,
    }
  }
)
