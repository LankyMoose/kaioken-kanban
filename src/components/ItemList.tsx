import "./ItemList.css"
import { useRef, useEffect, useCallback, useMemo } from "kaioken"
import { useGlobal } from "../state/global"
import { MoreIcon } from "./icons/MoreIcon"
import { Button } from "./atoms/Button"
import { useItemsStore } from "../state/items"
import { useBoardTagsStore } from "../state/boardTags"
import { useContextMenu } from "../state/contextMenu"
import { List, ListItem } from "../idb"
import { ClickedItem, ItemDragTarget } from "../types"

function getItemStyle(
  itemDragTarget: ItemDragTarget | null,
  clickedItem: ClickedItem | null,
  listId: number,
  idx: number,
  item: ListItem,
  ref: Kaioken.RefObject<HTMLButtonElement>
) {
  if (itemDragTarget?.index === idx && itemDragTarget?.listId === listId) {
    return "margin-top: calc(var(--selected-item-height) + var(--items-gap));"
  }

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
  return `transform: translate(calc(${x}px - .5rem), ${y}px)`
}

type InteractionEvent = MouseEvent | TouchEvent | KeyboardEvent

function isTouchEvent(e: Event): boolean {
  if (!Object.hasOwn(window, "TouchEvent")) return false
  return e instanceof TouchEvent
}

export function ItemList({ list }: { list: List }) {
  const headerRef = useRef<HTMLDivElement | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)
  const rect = useRef<DOMRect | null>(null)
  const dropAreaRef = useRef<HTMLDivElement | null>(null)

  const { value: items, addItem } = useItemsStore((state) =>
    state.items.filter((i) => i.listId === list.id)
  )
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

  function selectList(e: InteractionEvent) {
    const element = listRef.current?.cloneNode(true) as HTMLDivElement
    if (!element) return

    const isMouse = e instanceof MouseEvent && !isTouchEvent(e)
    if (isMouse && e.buttons !== 1) return
    if (e instanceof KeyboardEvent) {
      if (e.key !== "Enter" && e.key !== " ") return
      e.preventDefault()
    }

    const rect = listRef.current!.getBoundingClientRect()
    const mouseOffset =
      e instanceof MouseEvent
        ? {
            x: e.clientX - rect.x - 4,
            y: e.clientY - rect.y - 8,
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
      dialogOpen: !isMouse,
      element,
      domRect: rect,
      mouseOffset,
    })
    if (isMouse) {
      setListDragTarget({ index: list.order + 1 })
    }
  }

  function getListItemsClassName() {
    let className = `list-items`

    const isOriginList = clickedItem?.listId === list.id
    if (isOriginList) {
      className += " origin"
    }

    if (!clickedItem?.dragging) {
      if (
        clickedItem &&
        clickedItem.listId === list.id &&
        clickedItem.index === items.length - 1 &&
        !clickedItem.dialogOpen
      ) {
        return `${className} last`
      }
      return className
    }

    const empty = items.length === 0 || (isOriginList && items.length === 1)

    if (empty) {
      className += " empty"
    }
    if (itemDragTarget?.listId !== list.id) return className

    return `${className} ${clickedItem?.dragging ? "dragging" : ""} ${
      itemDragTarget.index === items.length && !clickedItem.dialogOpen
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
    if (!rootElement) return ""

    // initial click state
    const dropArea = document.querySelector("#board .inner")!
    const dropAreaRect = dropArea.getBoundingClientRect()
    const rect = listRef.current!.getBoundingClientRect()

    const x = rect.left - dropAreaRect.x - rootElement.scrollLeft
    const y = rect.y - dropAreaRect.y - rootElement.scrollTop
    return `position:absolute; transform: translate(calc(${x}px - 1rem), calc(${y}px - 1rem))`
  }

  return (
    <div
      ref={listRef}
      style={getListStyle()}
      className={getListClassName()}
      data-id={list.id}
    >
      <div className="list-header" ref={headerRef} onpointerdown={selectList}>
        <h3 className="list-title text-base font-bold">
          {list.title || `(Unnamed list)`}
        </h3>
        <button
          className="p-2"
          onkeydown={selectList}
          onclick={() =>
            setClickedList({
              ...(clickedList ?? {
                list,
                id: list.id,
                index: list.order,
                dragging: false,
              }),
              dialogOpen: true,
            })
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
          {items
            .sort((a, b) => a.order - b.order)
            .map((item, i) => (
              <Item key={item.id} item={item} idx={i} listId={list.id} />
            ))}
        </div>
      </div>
      <div className="flex p-2">
        <Button
          variant="primary"
          className="grow py-2 text-sm font-semibold"
          onclick={async () => {
            const item = await addItem(list.id)
            setClickedItem({
              item,
              id: item.id,
              dialogOpen: true,
              dragging: false,
              listId: list.id,
              index: item.order,
            })
          }}
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
  const ref = useRef<HTMLButtonElement | null>(null)
  const { clickedItem, setClickedItem, itemDragTarget, setItemDragTarget } =
    useGlobal()
  const {
    value: { itemItemTags },
  } = useBoardTagsStore(({ tags, itemTags }) => ({
    itemItemTags: itemTags
      .filter((it) => it.itemId === item.id)
      .map((it) => tags.find((t) => t.id === it.tagId)!),
  }))

  if (clickedItem?.id === item.id && clickedItem.dragging) {
    return null
  }

  const selectItem = useCallback(
    (e: InteractionEvent) => {
      const element = ref.current?.cloneNode(true) as HTMLButtonElement
      if (!element) return console.error("selectItem fail, no element")

      const isMouse = e instanceof MouseEvent && !isTouchEvent(e)
      if (isMouse && e.buttons !== 1) {
        if (e.buttons == 2) {
          useContextMenu.setState({
            rightClickHandled: true,
            click: {
              x: e.clientX,
              y: e.clientY,
            },
            open: true,
            item,
          })
        }
        return
      }
      if (e instanceof KeyboardEvent) {
        // check if either 'enter' or 'space' key
        if (e.key !== "Enter" && e.key !== " ") return
        e.preventDefault()
      }

      const mEvt = e as MouseEvent

      const rect = ref.current!.getBoundingClientRect()
      setClickedItem({
        sender: e,
        item,
        id: item.id,
        listId: listId,
        index: idx,
        dragging: false,
        dialogOpen: !isMouse,
        element,
        domRect: rect,
        mouseOffset: isMouse
          ? { x: mEvt.offsetX, y: mEvt.offsetY }
          : { x: 0, y: 0 },
      })
      if (isMouse) {
        setItemDragTarget({
          index: idx + 1,
          listId,
        })
      }
    },
    [item.id, item.title, item.content, listId, idx]
  )

  const handleClick = useCallback(() => {
    setClickedItem({
      ...(clickedItem ?? {
        item,
        id: item.id,
        listId: listId,
        index: idx,
        dragging: false,
      }),
      dialogOpen: true,
    })
  }, [clickedItem])

  const style = useMemo(
    () => getItemStyle(itemDragTarget, clickedItem, listId, idx, item, ref),
    [itemDragTarget, clickedItem, listId, idx, item, ref]
  )

  const className = useMemo(() => {
    let className = "list-item text-sm"
    if (clickedItem?.id === item.id && !clickedItem.dialogOpen) {
      className += " selected"
    }
    return className
  }, [clickedItem?.id, item.id, clickedItem?.dialogOpen])

  return (
    <button
      ref={ref}
      className={className}
      style={style}
      onpointerdown={selectItem}
      onkeydown={selectItem}
      onclick={handleClick}
      data-id={item.id}
    >
      <span className="font-light">{item.title || "(Unnamed Item)"}</span>
      {itemItemTags.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {itemItemTags.map((tag) => (
            <span
              key={tag.id}
              className="px-[4px] py-[1px] text-xs"
              style={{ backgroundColor: tag.color }}
            >
              {tag.title}
            </span>
          ))}
        </div>
      )}
    </button>
  )
}
