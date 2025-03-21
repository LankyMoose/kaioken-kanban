import { ClickedList } from "../types"
import { useMouse } from "../state/mouse"

export function ListClone({ list }: { list: ClickedList }) {
  const { current: mousePos } = useMouse()

  function getStyle() {
    const x = mousePos.x - (list.mouseOffset?.x ?? 0)
    const y = mousePos.y - (list.mouseOffset?.y ?? 0)
    return `transform: translate(calc(${x}px - var(--list-header-padding-x)), calc(${y}px - var(--list-header-padding-y))); width: ${list.domRect?.width}px; height: ${list.domRect?.height}px;`
  }

  return (
    <div
      id="list-clone"
      style={getStyle()}
      innerHTML={list.element?.outerHTML || ""}
    />
  )
}
