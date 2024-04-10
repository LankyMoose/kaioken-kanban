import { createContext, useContext } from "kaioken"
import { Vector2 } from "../types"

type MouseContext = {
  current: Vector2
  setValue: (payload: Vector2) => void
}

export const MouseCtx = createContext<MouseContext>({
  current: { x: 0, y: 0 },
  setValue: () => {},
})
export const useMouse = () => useContext(MouseCtx)
