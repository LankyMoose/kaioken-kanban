import "./ItemList.css"
import { useRef, useEffect } from "kaioken"
import { ListItem, SelectedBoardList } from "../types"
import { useGlobal } from "../state/global"
import { useBoard } from "../state/board"
import { addItem } from "../idb"

export function ItemList({ list }: { list: SelectedBoardList }) {
  const listRef = useRef<HTMLDivElement>(null)
  const rect = useRef<DOMRect>(null)
  const dropAreaRef = useRef<HTMLDivElement>(null)
  const { updateList, dropArea } = useBoard()
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

  useEffect(() => {
    if (!dropAreaRef.current) return
    updateList({
      id: list.id,
      dropArea: dropAreaRef.current,
    })
  }, [dropAreaRef.current])

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

  function handleHeaderMouseDown(e: MouseEvent) {
    if (e.buttons !== 1) return
    const element = listRef.current?.cloneNode(true) as HTMLDivElement
    if (!element) return
    setClickedList({
      id: list.id,
      index: list.order,
      dragging: false,
      element,
      domRect: rect.current!,
      mouseOffset: {
        x: e.offsetX,
        y: e.offsetY,
      },
    })
    setListDragTarget({ index: list.order + 1 })
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
    if (clickedList?.id === list.id) {
      className += " selected"
    }
    return className
  }

  function getListStyle() {
    if (!rect.current) return ""
    if (listDragTarget?.index === list.order) {
      console.log("listDragTarget?.index === list.order")
      return "margin-left: calc(var(--selected-list-width) + var(--lists-gap));"
    }
    if (clickedList?.id !== list.id) return ""

    const dropAreaRect = dropArea?.getBoundingClientRect()
    if (!dropAreaRect) return ""

    const x = rect.current.x - rootElement.scrollLeft
    const y = rect.current.y - dropAreaRect.y - rootElement.scrollTop
    return `transform: translate(calc(${x}px - 1rem), calc(${y}px - 1rem))`
  }

  async function handleAddItemClick() {
    const listMax = list.items.reduce((max, item) => {
      if (item.order > max) return item.order
      return max
    }, -1)
    const res = await addItem(list.id, listMax + 1)
    updateList({
      id: list.id,
      items: [...list.items, res],
    })
  }

  return (
    <div
      ref={listRef}
      style={getListStyle()}
      className={getListClassName()}
      data-id={list.id}
    >
      <div className="list-header" onmousedown={handleHeaderMouseDown}>
        <h3 className="list-title text-base font-bold">
          {list.title || "(New List)"}
        </h3>
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
      <div className="flex p-2">
        <button
          className="add-item flex-grow py-2 text-sm font-semibold"
          onclick={handleAddItemClick}
        >
          Add Item
        </button>
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
  const rect = useRef<DOMRect>(null)
  const ref = useRef<HTMLButtonElement>(null)
  const {
    clickedItem,
    setClickedItem,
    itemDragTarget,
    setItemDragTarget,
    rootElement,
  } = useGlobal()
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
      item,
      id: item.id,
      listId: listId,
      index: idx,
      dragging: false,
      dialogOpen: false,
      element,
      domRect: rect.current!,
      mouseOffset: {
        x: e.offsetX,
        y: e.offsetY,
      },
    })
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
    if (!rect.current) return ""
    if (itemDragTarget?.index === idx && itemDragTarget?.listId === listId)
      return "margin-top: calc(var(--selected-item-height) + var(--items-gap));"
    if (clickedItem?.id !== item.id) return ""
    if (clickedItem.dialogOpen) return ""
    const list = lists?.find((l) => l.id === listId)
    const dropAreaRect = list?.dropArea?.getBoundingClientRect()
    if (!dropAreaRect) return ""

    const x = rect.current.x - dropAreaRect.x - rootElement.scrollLeft
    const y = rect.current.y - dropAreaRect.y - rootElement.scrollTop
    return `transform: translate(calc(${x}px - .5rem), calc(${y}px - .5rem))`
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
      onmousedown={handleMouseDown}
      onclick={handleClick}
      data-id={item.id}
    >
      {item.title || "(New Item)"}
    </button>
  )
}
