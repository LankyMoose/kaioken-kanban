import { useRef, useEffect } from "kaioken"
import { useGlobal } from "../state/global"
import { ClickedList } from "../types"

export function ListClone({ list }: { list: ClickedList }) {
  const { mousePos } = useGlobal()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    ref.current.innerHTML = list.element.outerHTML || ""
  }, [ref.current])

  function getStyle() {
    const x = mousePos.x - list.mouseOffset.x || 0
    const y = mousePos.y - list.mouseOffset.y || 0
    return `transform: translate(calc(${x}px - var(--list-header-padding)), calc(${y}px - var(--list-header-padding))); width: ${list.domRect.width}px; height: ${list.domRect.height}px;`
  }

  return <div ref={ref} id="list-clone" style={getStyle()}></div>
}
