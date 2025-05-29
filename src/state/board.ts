import { createStore } from "kaioken"
import { navigate } from "kaioken/router"
import { useBoardTagsStore } from "./boardTags"
import { useItemsStore } from "./items"
import { db, Board, loadTags } from "../idb"
import { useListsStore } from "./lists"

export const useBoardStore = createStore(
  { board: null as Board | null },
  function (set, get) {
    const selectBoard = async (board: Board) => {
      const setTagsState = useBoardTagsStore.methods.setState
      const setListsState = useListsStore.methods.setState
      const setListItemsState = useItemsStore.methods.setState
      const lists = await db.collections.lists.findMany(
        (l) => l.boardId === board.id
      )
      const { tags, itemTags } = await loadTags(board.id)
      const listItems = (
        await Promise.all(
          lists.map((list) =>
            db.collections.items.findMany(
              (i) => i.listId === list.id && !i.archived
            )
          )
        )
      ).flat()

      set({ board })
      setListsState(lists)
      setTagsState({ tags, itemTags })
      setListItemsState(listItems)
    }
    const updateSelectedBoard = async (payload: Partial<Board>) => {
      const board = get().board!
      const newBoard = { ...board, ...payload }
      const res = (await db.collections.boards.update(newBoard))!
      set({ board: res })
      return res
    }
    const deleteBoard = async () => {
      const board = get().board!
      if (!board) throw "no board, yikes!"

      const { items } = useItemsStore.getState()
      const { tags, itemTags } = useBoardTagsStore.getState()
      const { lists } = useListsStore.getState()
      await Promise.all([
        ...tags.map((t) => db.collections.tags.delete(t.id)),
        ...itemTags.map((it) => db.collections.itemTags.delete(it.id)),
        ...items.map((i) => db.collections.items.delete(i.id)),
        ...lists.map((l) => db.collections.lists.delete(l.id)),
        db.collections.boards.delete(board.id),
      ])

      set({ board: null })
      navigate("/")
      return async () => {
        await Promise.all([
          ...tags.map((t) => db.collections.tags.create(t)),
          ...itemTags.map((it) => db.collections.itemTags.create(it)),
          ...items.map((i) => db.collections.items.create(i)),
          ...lists.map((l) => db.collections.lists.create(l)),
          db.collections.boards.create(board),
        ])
      }
    }
    const archiveBoard = async () => {
      const board = get().board!
      const newBoard = (await db.collections.boards.update({
        ...board,
        archived: true,
      }))!
      navigate("/")
      return newBoard
    }
    const restoreBoard = async () => {
      const board = get()!.board
      await updateSelectedBoard({ ...board, archived: false })
    }
    return {
      selectBoard,
      archiveBoard,
      deleteBoard,
      updateSelectedBoard,
      restoreBoard,
    }
  }
)
