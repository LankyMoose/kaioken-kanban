import { useReducer } from "kaioken"
import {
  GlobalCtx,
  GlobalDispatchCtx,
  defaultGlobalState,
  globalStateReducer,
} from "./global"

export function GlobalProvider({ children }: { children?: JSX.Element[] }) {
  const [state, dispatch] = useReducer(globalStateReducer, defaultGlobalState)

  return (
    <GlobalCtx.Provider value={state}>
      <GlobalDispatchCtx.Provider value={dispatch}>
        {children}
      </GlobalDispatchCtx.Provider>
    </GlobalCtx.Provider>
  )
}
