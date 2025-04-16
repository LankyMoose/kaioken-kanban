import { TrashIcon } from "$/components/icons/TrashIcon"
import { Item } from "$/db"
import { itemDragState, selectedItem } from "./state"
import { useRef, useCallback, useEffect } from "kaioken"
import { boardElementsMap } from "./state"

type ListItemDisplayProps = {
  item: Item
  handleDelete: () => void
}
export function ListItemDisplay({ item, handleDelete }: ListItemDisplayProps) {
  const btnRef = useRef<HTMLButtonElement>(null)
  const longPressing = useRef(false)

  const handlePointerDown = useCallback((e: PointerEvent) => {
    if (e.currentTarget !== btnRef.current) return

    const beginDrag = () => {
      document.body.style.userSelect = "none"
      document.body.style.cursor = "grabbing"
      longPressing.current = true
      const domRect = el.getBoundingClientRect()
      const element = el.cloneNode(true) as HTMLButtonElement
      element.style.width = `${domRect.width}px`
      element.style.height = `${domRect.height}px`
      element.style.pointerEvents = "none"
      itemDragState.value = {
        item,
        element,
        offset: {
          x: e.clientX - domRect.left,
          y: e.clientY - domRect.top,
        },
        mousePos: { x: e.clientX, y: e.clientY },
        target: {
          listId: item.listId,
          index: item.order,
        },
      }
    }
    const el = btnRef.current!
    const timer = setTimeout(() => {
      if (longPressing.current) return
      beginDrag()
    }, 500)

    // effectively handles 'long press' event for touch device
    const handleContextMenu = () => {
      if (longPressing.current) return
      beginDrag()
    }

    const handlePointerMove = (e: TouchEvent | PointerEvent) => {
      if (!longPressing.current) {
        return handlePointerUp()
      }
      if (!itemDragState.value) return
      const currentState = itemDragState.value
      const pos = (
        e.type === "touchmove" && "touches" in e ? e.touches[0] : e
      ) as {
        clientX: number
        clientY: number
      }
      itemDragState.value = {
        ...currentState,
        mousePos: { x: pos.clientX, y: pos.clientY },
      }
    }
    // ptr up event fires before click
    const handlePointerUp = () => {
      document.body.style.userSelect = "auto"
      document.body.style.cursor = "default"
      clearTimeout(timer)
      window.removeEventListener("touchmove", handlePointerMove)
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("touchend", handlePointerUp)
      window.removeEventListener("pointerup", handlePointerUp)
      window.removeEventListener("contextmenu", handleContextMenu)
      itemDragState.value = null
      longPressing.current = false
    }

    window.addEventListener("pointerup", handlePointerUp)
    window.addEventListener("touchend", handlePointerUp)
    window.addEventListener("touchmove", handlePointerMove)
    window.addEventListener("pointermove", handlePointerMove)
    window.addEventListener("contextmenu", handleContextMenu)
  }, [])

  useEffect(() => {
    boardElementsMap[item.listId].items[item.order] = {
      ref: btnRef,
      item,
    }
  })

  if (itemDragState.value?.item.id === item.id) {
    return null
  }

  return (
    <button
      ref={btnRef}
      onclick={(e) => {
        // prevent selection if delete was clicked
        if (e.defaultPrevented) return
        selectedItem.value = item
      }}
      onpointerdown={handlePointerDown}
      className={[
        "bg-[#eee]",
        "dark:bg-[#202020]",
        "p-2 text-sm flex gap-2 items-start",
        itemDragState.value?.item.id === item.id && "opacity-50",
        itemDragState.value?.target.listId === item.listId &&
          itemDragState.value?.target.index === item.order &&
          "mt-8",
      ]}
    >
      <p className="flex-grow text-left">{item.title}</p>
      <button
        className="hover:text-red-500"
        onclick={(e) => {
          e.preventDefault()
          handleDelete()
        }}
      >
        <TrashIcon />
      </button>
    </button>
  )
}
