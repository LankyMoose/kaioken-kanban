import { createStore } from "kaioken"
import * as db from "../idb"
import { ItemTag, Tag } from "../idb"

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
      const itemTag = await db.addItemTag(boardId, itemId, tagId)
      set((prev) => ({ ...prev, itemTags: [...prev.itemTags, itemTag] }))
    }
    const removeItemTag = async (itemTag: ItemTag) => {
      await db.deleteItemTag(itemTag)
      set((prev) => ({
        ...prev,
        itemTags: prev.itemTags.filter((it) => it.id !== itemTag.id),
      }))
    }

    const addTag = async (boardId: number) => {
      const tag = await db.addTag(boardId)
      set((prev) => ({ ...prev, tags: [...prev.tags, tag] }))
    }

    const updateTag = async (tag: Tag) => {
      const newTag = await db.updateTag(tag)
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
      addTag,
      updateTag,
    }
  }
)
