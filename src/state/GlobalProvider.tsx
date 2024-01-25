import { useEffect, useReducer } from "kaioken"
import {
  GlobalCtx,
  GlobalDispatchCtx,
  defaultGlobalState,
  globalStateReducer,
} from "./global"
import { addBoard, loadBoards } from "../idb"

export function GlobalProvider({ children }: { children?: JSX.Element[] }) {
  const [state, dispatch] = useReducer(globalStateReducer, defaultGlobalState)
  useEffect(() => {
    ;(async () => {
      const boards = await loadBoards()
      if (boards.length === 0) {
        const board = await addBoard()
        boards.push(board)
      }
      dispatch({ type: "SET_BOARDS", payload: boards })
    })()
  }, [])
  return (
    <GlobalCtx.Provider value={state}>
      <GlobalDispatchCtx.Provider value={dispatch}>
        {children}
      </GlobalDispatchCtx.Provider>
    </GlobalCtx.Provider>
  )
}
