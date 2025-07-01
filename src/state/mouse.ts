import { signal } from "kaioken"
import { Vector2 } from "../types"

export const mousePos = signal<Vector2>({ x: 0, y: 0 })
