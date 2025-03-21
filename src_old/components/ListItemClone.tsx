import { ClickedItem } from "../types"
import { useMouse } from "../state/mouse"

export function ListItemClone({ item }: { item: ClickedItem }) {
  const { current: mousePos } = useMouse()

  function getStyle() {
    const x = mousePos.x - (item.mouseOffset?.x ?? 0)
    const y = mousePos.y - (item.mouseOffset?.y ?? 0)
    return `transform: translate(${x}px, ${y}px); width: ${
      item.domRect?.width || 0
    }px; height: ${item.domRect?.height || 0}px;`
  }

  return (
    <div
      id="item-clone"
      style={getStyle()}
      innerHTML={item.element?.outerHTML || ""}
    />
  )
}
