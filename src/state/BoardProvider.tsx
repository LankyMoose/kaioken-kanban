import { useReducer } from "kaioken"
import { boardStateReducer, BoardContext, BoardDispatchContext } from "./board"

export function BoardProvider({ children }: { children?: JSX.Element[] }) {
  const [value, dispatch] = useReducer(boardStateReducer, null)

  return (
    <BoardContext.Provider value={value}>
      <BoardDispatchContext.Provider value={dispatch}>
        {children}
      </BoardDispatchContext.Provider>
    </BoardContext.Provider>
  )
}
