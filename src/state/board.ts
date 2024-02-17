import { createStore, navigate } from "kaioken"
import type { Board } from "../types"
import { useGlobal } from "./global"
import { useBoardTagsStore } from "./boardTags"
import { useItemsStore } from "./items"
import * as db from "../idb"
import { useListsStore } from "./lists"

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
      const { boards, updateBoards } = useGlobal()
      const board = get().board!
      const newBoard = { ...board, ...payload }
      const res = await db.updateBoard(newBoard)
      updateBoards(boards.map((b) => (b.id === res.id ? newBoard : b)))
      set({ board: res })
    }
    const deleteBoard = async () => {
      const board = get().board!
      if (!board) throw "no board, yikes!"
      const confirmDelete = confirm(
        "Are you sure you want to delete this board and all of its data? This can't be undone!"
      )
      if (!confirmDelete) return
      const { boards, updateBoards } = useGlobal()

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

      updateBoards(boards.filter((b) => b.id !== board.id))
      set({ board: null })
      navigate("/")
    }
    const archiveBoard = async () => {
      const { boards, updateBoards } = useGlobal()
      const board = get().board!
      const newBoard = await db.archiveBoard(board)
      updateBoards(boards.map((b) => (b.id === board.id ? newBoard : b)))
      navigate("/")
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
