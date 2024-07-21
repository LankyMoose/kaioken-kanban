import { createStore, navigate } from "kaioken"
import { useBoardTagsStore } from "./boardTags"
import { useItemsStore } from "./items"
import * as db from "../idb"
import { useListsStore } from "./lists"
import { Board } from "../idb"

export const useBoardStore = createStore(
  { board: null as Board | null },
  function (set, get) {
    const selectBoard = async (board: Board) => {
      const setTagsState = useBoardTagsStore.methods.setState
      const setListsState = useListsStore.methods.setState
      const setListItemsState = useItemsStore.methods.setState
      const lists = await db.loadLists(board.id)
      const { tags, itemTags } = await db.loadTags(board.id)
      const listItems = (
        await Promise.all(lists.map((list) => db.loadItems(list.id)))
      ).flat()

      set({ board })
      setListsState(lists)
      setTagsState({ tags, itemTags })
      setListItemsState(listItems)
    }
    const updateSelectedBoard = async (payload: Partial<Board>) => {
      const board = get().board!
      const newBoard = { ...board, ...payload }
      const res = await db.updateBoard(newBoard)
      set({ board: res })
      return board
    }
    const deleteBoard = async () => {
      const board = get().board!
      if (!board) throw "no board, yikes!"
      const confirmDelete = confirm(
        "Are you sure you want to delete this board and all of its data? This can't be undone!"
      )
      if (!confirmDelete) return

      const { items } = useItemsStore.getState()
      const { tags, itemTags } = useBoardTagsStore.getState()
      const { lists } = useListsStore.getState()
      await Promise.all([
        ...tags.map(db.deleteTag),
        ...itemTags.map(db.deleteItemTag),
        ...items.map(db.deleteItem),
        ...lists.map(db.deleteList),
        db.deleteBoard(board),
      ])

      set({ board: null })
      navigate("/")
    }
    const archiveBoard = async () => {
      const board = get().board!
      const newBoard = await db.archiveBoard(board)
      navigate("/")
      return newBoard
    }
    const restoreBoard = async () => {
      const board = get()!
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
