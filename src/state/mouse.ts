import { createContext, useContext } from "kaioken"
import { Vector2 } from "../types"

export { MouseCtx, useMouse }

type MouseContext = {
  current: Vector2
  setValue: (payload: Vector2) => void
}

const MouseCtx = createContext<MouseContext>({
  current: { x: 0, y: 0 },
  setValue: () => {},
})
MouseCtx.displayName = "MouseCtx"
const useMouse = () => useContext(MouseCtx)
