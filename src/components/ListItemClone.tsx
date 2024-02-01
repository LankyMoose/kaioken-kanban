import { useRef, useEffect } from "kaioken"
import { useGlobal } from "../state/global"
import { ClickedItem } from "../types"

export function ListItemClone({ item }: { item: ClickedItem }) {
  const { mousePos } = useGlobal()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    ref.current.innerHTML = item.element.outerHTML || ""
  }, [ref.current])

  function getStyle() {
    const x = mousePos.x - item.mouseOffset.x || 0
    const y = mousePos.y - item.mouseOffset.y || 0
    return `transform: translate(${x}px, ${y}px); width: ${
      item.domRect.width || 0
    }px; height: ${item.domRect.height || 0}px;`
  }

  return <div ref={ref} id="item-clone" style={getStyle()}></div>
}
