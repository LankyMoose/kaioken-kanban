import { preferredTheme } from "$/state"
import { useRef, useWatch } from "kaioken"
import { itemDragState } from "./state"

export function DraggedItemDisplay(): JSX.Element {
  const animTimeout = useRef(-1)
  const ref = useRef<HTMLDivElement>(null)
  useWatch(() => {
    const state = itemDragState.value
    const container = ref.current
    clearTimeout(animTimeout.current)

    if (!state && container?.firstChild) {
      container.firstChild.remove()
    }
    if (!state || !container) return
    const offset = {
      x: state.mousePos.x - state.offset.x,
      y: state.mousePos.y - state.offset.y,
    }
    container.style.transform = `translate(${offset.x}px, ${offset.y}px)`

    const element = state.element
    if (!container.firstChild) {
      container.append(element)
      element.style.userSelect = "none"
      element.style.transition = "0.2s ease-in"
      animTimeout.current = setTimeout(() => {
        element.style.scale = "1.1"
        element.style.boxShadow =
          preferredTheme.value === "dark"
            ? "0 0 10px rgba(0, 0, 0, 0.5)"
            : "0 0 10px rgba(0, 0, 0, 0.15)"
      }, 1)
    }
  })

  return <div ref={ref} className="absolute top-0 left-0" />
}
