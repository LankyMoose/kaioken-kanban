import { ClickedList } from "../types"
import { mousePos } from "../state/mouse"
import { useComputed } from "kaioken"

export function ListClone({ list }: { list: ClickedList }) {
  const style = useComputed(() => {
    const x = mousePos.value.x - (list.mouseOffset?.x ?? 0)
    const y = mousePos.value.y - (list.mouseOffset?.y ?? 0)
    return `transform: translate(calc(${x}px - var(--list-header-padding-x)), calc(${y}px - var(--list-header-padding-y))); width: ${list.domRect?.width}px; height: ${list.domRect?.height}px;`
  })

  return (
    <div
      id="list-clone"
      style={style}
      innerHTML={list.element?.outerHTML || ""}
    />
  )
}
