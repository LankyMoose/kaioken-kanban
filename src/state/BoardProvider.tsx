import { useEffect, useReducer } from "kaioken"
import { boardStateReducer, BoardContext, BoardDispatchContext } from "./board"
import { useGlobal } from "./global"
import { loadItems, loadLists } from "../idb"
import { SelectedBoardList } from "../types"

export function BoardProvider({ children }: { children?: JSX.Element }) {
  const [value, dispatch] = useReducer(boardStateReducer, null)
  const { boards } = useGlobal()
  useEffect(() => {
    if (boards.length === 0) return
    const selectedBoard = {
      ...boards.at(-1)!,
      lists: [],
      dropArea: null,
    }
    loadLists(selectedBoard.id).then(async (res) => {
      const lists = await Promise.all(
        res.map(async (list) => {
          const items = await loadItems(list.id)
          return {
            ...list,
            items,
            dropArea: null,
          } as SelectedBoardList
        })
      )
      dispatch({
        type: "UPDATE_LISTS",
        payload: lists,
      })
    })
    dispatch({
      type: "SET_BOARD",
      payload: selectedBoard,
    })
  }, [boards.length])

  return (
    <BoardContext.Provider value={value}>
      <BoardDispatchContext.Provider value={dispatch}>
        {children}
      </BoardDispatchContext.Provider>
    </BoardContext.Provider>
  )
}
