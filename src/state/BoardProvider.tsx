import { useReducer, useState } from "kaioken"
import { Board } from "../types"
import {
  loadBoard,
  boardStateReducer,
  BoardContext,
  BoardDispatchContext,
} from "./board"

export function BoardProvider({ children }: { children?: JSX.Element }) {
  const [boardState] = useState<Board>(loadBoard)
  const [value, dispatch] = useReducer(boardStateReducer, boardState)
  return (
    <BoardContext.Provider value={value}>
      <BoardDispatchContext.Provider value={dispatch}>
        {children}
      </BoardDispatchContext.Provider>
    </BoardContext.Provider>
  )
}
