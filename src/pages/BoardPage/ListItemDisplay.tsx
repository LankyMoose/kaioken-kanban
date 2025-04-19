import { TrashIcon } from "$/components/icons/TrashIcon"
import { Item } from "$/db"
import { handleItemDrop, itemDragState, selectedItem } from "./state"
import { useRef, useEffect } from "kaioken"
import { boardElementsMap } from "./state"

type ListItemDisplayProps = {
  item: Item
  handleDelete: () => void
}

const getEvtPos = (e: PointerEvent | TouchEvent) => {
  return (e.type === "touchmove" && "touches" in e ? e.touches[0] : e) as {
    clientX: number
    clientY: number
  }
}

const v2Dist = function (
  a: { x: number; y: number },
  b: { x: number; y: number }
) {
  var dx = b.x - a.x
  var dy = b.y - a.y
  return Math.sqrt(dx * dx + dy * dy)
}

export function ListItemDisplay({ item, handleDelete }: ListItemDisplayProps) {
  const btnRef = useRef<HTMLButtonElement>(null)
  const isDragActive = useRef(false)

  const handlePointerDown = (e: PointerEvent) => {
    if (e.currentTarget !== btnRef.current) return
    const initialPos = getEvtPos(e)

    const beginDrag = () => {
      document.body.style.userSelect = "none"
      document.body.style.cursor = "grabbing"
      isDragActive.current = true
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
      if (isDragActive.current) return
      beginDrag()
    }, 500)

    // effectively handles 'long press' event for touch device
    const handleContextMenu = (e: Event) => {
      e.preventDefault()
      if (isDragActive.current) return
      beginDrag()
    }

    const handlePointerMove = (e: TouchEvent | PointerEvent) => {
      const pos = getEvtPos(e)
      const dist = v2Dist(
        { x: pos.clientX, y: pos.clientY },
        { x: initialPos.clientX, y: initialPos.clientY }
      )
      if (!isDragActive.current && dist > 10) {
        return handlePointerUp()
      }
      if (!itemDragState.value) return
      const currentState = itemDragState.value
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
      window.removeEventListener("resize", cancelScrollOrResize, {
        capture: true,
      })
      window.removeEventListener("scroll", cancelScrollOrResize, {
        capture: true,
      })

      window.removeEventListener("touchmove", handlePointerMove, {
        capture: true,
      })
      window.removeEventListener("pointermove", handlePointerMove, {
        capture: true,
      })
      window.removeEventListener("touchend", handlePointerUp)
      window.removeEventListener("pointerup", handlePointerUp)
      window.removeEventListener("contextmenu", handleContextMenu)
      isDragActive.current = false
      handleItemDrop()
    }

    const cancelScrollOrResize = (e: Event) => {
      e.preventDefault()
    }

    window.addEventListener("resize", cancelScrollOrResize, {
      capture: true,
      passive: false,
    })
    window.addEventListener("scroll", cancelScrollOrResize, {
      capture: true,
      passive: false,
    })
    window.addEventListener("touchmove", handlePointerMove, {
      capture: true,
      passive: false,
    })
    window.addEventListener("pointermove", handlePointerMove, {
      capture: true,
      passive: false,
    })
    window.addEventListener("pointerup", handlePointerUp)
    window.addEventListener("touchend", handlePointerUp)
    window.addEventListener("contextmenu", handleContextMenu)
  }

  useEffect(() => {
    boardElementsMap[item.listId].items[item.order] = {
      ref: btnRef,
      item,
    }
    return () => {
      boardElementsMap[item.listId]?.items.splice(item.order, 1)
    }
  })
  return (
    <button
      data-order={item.order}
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
        itemDragState.value?.item.id === item.id && "opacity-50 hidden",
        itemDragState.value?.target.listId === item.listId &&
          itemDragState.value?.target.index === item.order &&
          "mt-(--dragged-item-height)",
      ]}
    >
      <p className="flex-grow text-left">{item.title || "(Untitled Item)"}</p>
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
