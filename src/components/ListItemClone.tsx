import { ClickedItem } from "../types"
import { mousePos } from "../state/mouse"
import { useComputed } from "kaioken"

export function ListItemClone({ item }: { item: ClickedItem }) {
  const style = useComputed(() => {
    const x = mousePos.value.x - (item.mouseOffset?.x ?? 0)
    const y = mousePos.value.y - (item.mouseOffset?.y ?? 0)
    return `transform: translate(${x}px, ${y}px); width: ${
      item.domRect?.width || 0
    }px; height: ${item.domRect?.height || 0}px;`
  })

  return (
    <div
      id="item-clone"
      style={style}
      innerHTML={item.element?.outerHTML || ""}
    />
  )
}
