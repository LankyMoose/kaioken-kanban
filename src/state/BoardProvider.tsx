import { useEffect, useReducer } from "kaioken"
import { boardStateReducer, BoardContext, BoardDispatchContext } from "./board"
import { useGlobal } from "./global"
import { loadLists } from "../idb"

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
    loadLists(selectedBoard.id).then((lists) => {
      dispatch({
        type: "UPDATE_LISTS",
        payload: lists.map((list) => ({
          ...list,
          items: [],
          dropArea: null,
        })),
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
