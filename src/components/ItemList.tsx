import { useRef, useEffect } from "kaioken"
import { List, ListItem } from "../types"
import "./ItemList.css"
import { useGlobal } from "../state/global"
import { useBoard } from "../state/board"

export function ItemList({ list }: { list: List }) {
  const dropAreaRef = useRef<HTMLDivElement>(null)
  const { updateList } = useBoard()
  const {
    clickedItem,
    setClickedItem,
    itemDragTarget,
    setItemDragTarget,
    handleItemDragStart,
  } = useGlobal()

  useEffect(() => {
    if (!dropAreaRef.current) return
    updateList({
      id: list.id,
      dropArea: dropAreaRef.current,
    })
  }, [dropAreaRef.current])

  function handleMouseMove(e: MouseEvent) {
    if (e.buttons !== 1) return
    if (!dropAreaRef.current) return
    if (!clickedItem) return
    if (clickedItem && !clickedItem.dragging) {
      setClickedItem({
        ...clickedItem,
        dragging: true,
      })
    }

    handleItemDragStart(e, dropAreaRef.current, clickedItem, list)
  }

  function handleMouseLeave() {
    if (!clickedItem) return
    setItemDragTarget(null)
  }

  function getClassName() {
    let className = `list-items`
    if (!clickedItem?.dragging) {
      if (
        clickedItem &&
        clickedItem.listId === list.id &&
        clickedItem.index === list.items.length - 1
      ) {
        return `${className} last`
      }
      return className
    }
    const isOriginList = clickedItem?.listId === list.id
    const empty =
      list.items.length === 0 || (isOriginList && list.items.length === 1)

    if (isOriginList) {
      className += " origin"
    }
    if (empty) {
      className += " empty"
    }
    if (itemDragTarget?.listId !== list.id) return className

    return `${className} ${clickedItem?.dragging ? "dragging" : ""} ${
      itemDragTarget.index === list.items.length ? "last" : ""
    }`.trim()
  }

  return (
    <div className="list">
      <div className="list-header">
        <h3 className="list-title">{list.title}</h3>
      </div>
      <div
        className={getClassName()}
        onmousemove={handleMouseMove}
        onmouseleave={handleMouseLeave}
      >
        <div ref={dropAreaRef} className="list-items-inner">
          {list.items
            .sort((a, b) => a.order - b.order)
            .map((item, i) => (
              <Item item={item} idx={i} listId={list.id} />
            ))}
        </div>
      </div>
    </div>
  )
}

function Item({
  item,
  idx,
  listId,
}: {
  item: ListItem
  idx: number
  listId: string
}) {
  const rect = useRef<DOMRect>(null)
  const ref = useRef<HTMLButtonElement>(null)
  const { clickedItem, setClickedItem, itemDragTarget, setItemDragTarget } =
    useGlobal()
  const { lists } = useBoard()

  useEffect(() => {
    if (!ref.current) return
    rect.current = ref.current.getBoundingClientRect()
  }, [ref.current])

  if (clickedItem?.id === item.id && clickedItem.dragging) {
    return null
  }

  function handleMouseDown(e: MouseEvent) {
    if (e.buttons !== 1) return
    const element = ref.current?.cloneNode(true) as HTMLButtonElement
    if (!element) return
    setClickedItem({
      id: item.id,
      listId: listId,
      index: idx,
      dragging: false,
      element,
      domRect: ref.current!.getBoundingClientRect(),
      mouseOffset: {
        x: e.offsetX,
        y: e.offsetY,
      },
    })
    setItemDragTarget({
      index: idx + 1,
      listId,
      initial: true,
    })
  }

  function getStyle() {
    let style = ""
    if (!rect.current) return ""
    if (itemDragTarget?.index === idx && itemDragTarget?.listId === listId)
      return "margin-top: calc(var(--selected-item-height) + var(--items-gap));"
    if (clickedItem?.id !== item.id) return ""

    const list = lists.find((l) => l.id === listId)!

    const dropAreaRect = list.dropArea?.getBoundingClientRect()
    if (!dropAreaRect) return ""

    const x = rect.current.x - dropAreaRect.x
    const y = rect.current.y - dropAreaRect.y
    return `${style} transform: translate(calc(${x}px - .5rem), calc(${y}px - .5rem))`
  }

  function getClass() {
    let className = "list-item"
    if (clickedItem?.id === item.id) {
      className += " selected"
    }
    return className
  }

  return (
    <button
      ref={ref}
      className={getClass()}
      style={getStyle()}
      onmousedown={handleMouseDown}
      data-id={item.id}
    >
      {item.title}
    </button>
  )
}
