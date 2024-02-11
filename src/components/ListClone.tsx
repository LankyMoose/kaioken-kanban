import { useRef, useEffect } from "kaioken"
import { ClickedList } from "../types"
import { useMouse } from "../state/mouse"

export function ListClone({ list }: { list: ClickedList }) {
  const { current: mousePos } = useMouse()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    ref.current.innerHTML = list.element?.outerHTML || ""
  }, [ref.current])

  function getStyle() {
    const x = mousePos.x - (list.mouseOffset?.x ?? 0)
    const y = mousePos.y - (list.mouseOffset?.y ?? 0)
    return `transform: translate(calc(${x}px - var(--list-header-padding-x)), calc(${y}px - var(--list-header-padding-y))); width: ${list.domRect?.width}px; height: ${list.domRect?.height}px;`
  }

  return <div ref={ref} id="list-clone" style={getStyle()}></div>
}
