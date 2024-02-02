import { useEffect, useReducer } from "kaioken"
import {
  boardStateReducer,
  BoardContext,
  BoardDispatchContext,
  useBoard,
} from "./board"
import { useGlobal } from "./global"

export function BoardProvider({ children }: { children?: JSX.Element }) {
  const [value, dispatch] = useReducer(boardStateReducer, null)
  const { boards } = useGlobal()
  const { selectBoard } = useBoard()

  useEffect(() => {
    if (boards.length === 0) return
    const prevBoardId = localStorage.getItem("kaioban-board-id")
    if (prevBoardId) {
      const board = boards.find((b) => b.id.toString() === prevBoardId)
      if (board) {
        selectBoard(board)
        return
      }
    }
    selectBoard(boards[0])
  }, [boards.length])

  return (
    <BoardContext.Provider value={value}>
      <BoardDispatchContext.Provider value={dispatch}>
        {children}
      </BoardDispatchContext.Provider>
    </BoardContext.Provider>
  )
}
