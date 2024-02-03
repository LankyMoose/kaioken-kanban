import "./ItemList.css"
import { useRef, useEffect } from "kaioken"
import { ListItem, SelectedBoardList } from "../types"
import { useGlobal } from "../state/global"
import { useBoard } from "../state/board"
import { MoreIcon } from "./icons/MoreIcon"
import { Button } from "./atoms/Button"

export function ItemList({ list }: { list: SelectedBoardList }) {
  const headerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const rect = useRef<DOMRect>(null)
  const dropAreaRef = useRef<HTMLDivElement>(null)
  const { addItem } = useBoard()
  const {
    clickedItem,
    setClickedItem,
    itemDragTarget,
    setItemDragTarget,
    handleItemDrag,
    clickedList,
    setClickedList,
    listDragTarget,
    setListDragTarget,
    rootElement,
  } = useGlobal()

  useEffect(() => {
    if (!listRef.current) return
    rect.current = listRef.current.getBoundingClientRect()
  }, [listRef.current])

  if (clickedList?.id === list.id && clickedList.dragging) {
    return null
  }

  function handleMouseMove(e: MouseEvent) {
    if (e.buttons !== 1) return
    if (!dropAreaRef.current) return
    if (!clickedItem) return
    if (!clickedItem.dragging) {
      setClickedItem({
        ...clickedItem,
        dragging: true,
      })
    }

    handleItemDrag(e, dropAreaRef.current, clickedItem, list)
  }

  function handleMouseLeave() {
    if (!clickedItem) return
    setItemDragTarget(null)
  }

  function selectList(e: MouseEvent | KeyboardEvent) {
    if (e instanceof MouseEvent && e.buttons !== 1) return
    if (e instanceof KeyboardEvent) {
      if (e.key !== "Enter") return
      e.preventDefault()
    }
    const element = listRef.current?.cloneNode(true) as HTMLDivElement
    if (!element) return
    const rect = listRef.current!.getBoundingClientRect()
    const mouseOffset =
      e instanceof MouseEvent
        ? {
            x: e.clientX - rect.x - 12,
            y: e.clientY - rect.y - 12,
          }
        : {
            x: 0,
            y: 0,
          }
    setClickedList({
      sender: e,
      list,
      id: list.id,
      index: list.order,
      dragging: false,
      dialogOpen: e instanceof KeyboardEvent,
      element,
      domRect: rect,
      mouseOffset,
    })
    if (e instanceof MouseEvent) {
      setListDragTarget({ index: list.order + 1 })
    }
  }

  function getListItemsClassName() {
    let className = `list-items`

    if (!clickedItem?.dragging) {
      if (
        clickedItem &&
        clickedItem.listId === list.id &&
        clickedItem.index === list.items.length - 1 &&
        !clickedItem.dialogOpen
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
      itemDragTarget.index === list.items.length && !clickedItem.dialogOpen
        ? "last"
        : ""
    }`.trim()
  }

  function getListClassName() {
    let className = "list"
    if (clickedList?.id === list.id && !clickedList.dialogOpen) {
      className += " selected"
    }
    return className
  }

  function getListStyle() {
    if (listDragTarget && listDragTarget.index === list.order) {
      return "margin-left: calc(var(--selected-list-width) + var(--lists-gap));"
    }
    if (clickedList?.id !== list.id) return ""
    if (clickedList.dialogOpen) return ""

    // initial click state
    const dropArea = document.querySelector("#board .inner")!
    const dropAreaRect = dropArea.getBoundingClientRect()
    const rect = listRef.current!.getBoundingClientRect()

    const x = rect.left - dropAreaRect.x - rootElement.scrollLeft
    const y = rect.y - dropAreaRect.y - rootElement.scrollTop
    return `transform: translate(calc(${x}px - 1rem), calc(${y}px - 1rem))`
  }

  return (
    <div
      ref={listRef}
      style={getListStyle()}
      className={getListClassName()}
      data-id={list.id}
    >
      <div className="list-header" ref={headerRef} onmousedown={selectList}>
        <h3 className="list-title text-base font-bold">
          {list.title || "(New List)"}
        </h3>
        <button
          className="p-2"
          onkeydown={selectList}
          onclick={() =>
            clickedList && setClickedList({ ...clickedList, dialogOpen: true })
          }
        >
          <MoreIcon />
        </button>
      </div>
      <div
        className={getListItemsClassName()}
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
      <div className="flex py-2">
        <Button
          variant="primary"
          className="flex-grow py-2 text-sm font-semibold"
          onclick={() => addItem(list.id)}
        >
          Add Item
        </Button>
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
  listId: number
}) {
  const ref = useRef<HTMLButtonElement>(null)
  const { clickedItem, setClickedItem, itemDragTarget, setItemDragTarget } =
    useGlobal()

  if (clickedItem?.id === item.id && clickedItem.dragging) {
    return null
  }

  function selectItem(e: MouseEvent | KeyboardEvent) {
    if (e instanceof MouseEvent && e.buttons !== 1) return
    if (e instanceof KeyboardEvent) {
      if (e.key !== "Enter") return
      e.preventDefault()
    }
    const element = ref.current?.cloneNode(true) as HTMLButtonElement
    if (!element) return
    const rect = ref.current!.getBoundingClientRect()
    setClickedItem({
      sender: e,
      item,
      id: item.id,
      listId: listId,
      index: idx,
      dragging: false,
      dialogOpen: e instanceof KeyboardEvent,
      element,
      domRect: rect,
      mouseOffset:
        e instanceof MouseEvent
          ? { x: e.offsetX, y: e.offsetY }
          : { x: 0, y: 0 },
    })
    if (e instanceof KeyboardEvent) return
    setItemDragTarget({
      index: idx + 1,
      listId,
    })
  }

  function handleClick() {
    setClickedItem({
      ...clickedItem!,
      dialogOpen: true,
    })
  }

  function getStyle() {
    if (itemDragTarget?.index === idx && itemDragTarget?.listId === listId)
      return "margin-top: calc(var(--selected-item-height) + var(--items-gap));"
    if (clickedItem?.id !== item.id) return ""
    if (clickedItem.dialogOpen) return ""
    const dropArea = document.querySelector(
      `#board .inner .list[data-id="${listId}"] .list-items-inner`
    )!
    const dropAreaRect = dropArea.getBoundingClientRect()
    if (!dropAreaRect) return ""

    if (!ref.current) return ""
    const rect = ref.current.getBoundingClientRect()

    const x = rect.x - dropAreaRect.x
    const y = rect.y - dropAreaRect.y
    return `transform: translate(calc(${x}px), calc(${y}px))`
  }

  function getClassName() {
    let className = "list-item"
    if (clickedItem?.id === item.id && !clickedItem.dialogOpen) {
      className += " selected"
    }
    return className
  }

  return (
    <button
      ref={ref}
      className={getClassName()}
      style={getStyle()}
      onmousedown={selectItem}
      onkeydown={selectItem}
      onclick={handleClick}
      data-id={item.id}
    >
      {item.title || "(New Item)"}
    </button>
  )
}
