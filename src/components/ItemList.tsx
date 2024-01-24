import { useRef, useContext, useEffect } from "kaioken"
import { BoardDispatchContext, BoardContext } from "../state/BoardProvider"
import { List, ListItem } from "../types"
import "./ItemList.css"
import { GlobalCtx, GlobalDispatchCtx } from "../state/GlobalProvider"

export function ItemList({ list }: { list: List }) {
  const dropAreaRef = useRef<HTMLDivElement>(null)
  const dispatch = useContext(BoardDispatchContext)
  const dispatchGlobal = useContext(GlobalDispatchCtx)

  const { clickedItem, itemDragTarget } = useContext(GlobalCtx)

  useEffect(() => {
    if (!dropAreaRef.current) return
    dispatch({
      type: "UPDATE_LIST",
      payload: {
        id: list.id,
        dropArea: dropAreaRef.current,
      },
    })
  }, [dropAreaRef.current])

  function handleMouseMove(e: MouseEvent) {
    if (e.buttons !== 1) return
    if (!dropAreaRef.current) return
    if (!clickedItem) return
    if (clickedItem && !clickedItem.dragging) {
      dispatchGlobal({
        type: "SET_CLICKED_ITEM",
        payload: {
          ...clickedItem,
          dragging: true,
        },
      })
    }

    const elements = Array.from(
      dropAreaRef.current.querySelectorAll(".list-item")
    ).filter((el) => el.getAttribute("data-id") !== clickedItem.id)
    const isOriginList = clickedItem?.listId === list.id
    let index = elements.length

    const draggedItemTop = e.clientY - clickedItem.mouseOffset.y

    for (let i = 0; i < elements.length; i++) {
      const rect = elements[i].getBoundingClientRect()
      const top = rect.top
      if (draggedItemTop < top) {
        index = i
        break
      }
    }

    if (isOriginList && clickedItem.index <= index) {
      index++
    }

    dispatchGlobal({
      type: "SET_ITEM_DRAG_TARGET",
      payload: {
        index,
        listId: list.id,
        initial: false,
      },
    })
  }

  function handleMouseLeave() {
    if (!clickedItem) return
    dispatchGlobal({
      type: "SET_ITEM_DRAG_TARGET",
      payload: null,
    })
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
  const { clickedItem, itemDragTarget } = useContext(GlobalCtx)
  const { lists } = useContext(BoardContext)
  const dispatchGlobal = useContext(GlobalDispatchCtx)

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
    dispatchGlobal({
      type: "SET_CLICKED_ITEM",
      payload: {
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
      },
    })
    dispatchGlobal({
      type: "SET_ITEM_DRAG_TARGET",
      payload: {
        index: idx + 1,
        listId,
        initial: true,
      },
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
