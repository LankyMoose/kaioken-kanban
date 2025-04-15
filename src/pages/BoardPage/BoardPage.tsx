import { Button } from "$/components/atoms/Button/Button"
import { ChevronLeftIcon } from "$/components/icons/ChevronLeftIcon"
import { TrashIcon } from "$/components/icons/TrashIcon"
import { Board, db, Item, List } from "$/db"
import {
  Link,
  Portal,
  useAsync,
  useCallback,
  useEffect,
  useRef,
  useRouter,
  useWatch,
} from "kaioken"
import { itemDragState, preferredTheme, selectedItem } from "$/state"
import { ItemEditorModal } from "$/components/organisms/ItemEditor"

export function BoardPage() {
  const { params } = useRouter()
  const board = useAsync(async () => {
    const res = await db.collections.boards.find(params.boardId)
    if (!res) throw new Error("board not found")
    return res
  }, [params.boardId])

  useEffect(() => {
    const onBoardChanged = (changedBoard: Board) => {
      if (changedBoard.id !== params.boardId) return
      board.invalidate()
    }
    db.collections.boards.addEventListener("write|delete", onBoardChanged)
    return () => {
      db.collections.boards.removeEventListener("write|delete", onBoardChanged)
    }
  }, [params.boardId])

  if (board.loading) {
    return <div>Loading...</div>
  }

  if (board.error) {
    return <div>{board.error.message}</div>
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header
        className={[
          "bg-[#eee]",
          "dark:bg-white/5",
          "flex gap-2 justify-between items-center h-16 px-4 sm:px-8",
        ]}
      >
        <div className="flex gap-2 items-center">
          <Link to="/" children={<ChevronLeftIcon />} />
          <h1 className="text-2xl flex gap-2 items-end">{board.data.title}</h1>
        </div>
      </header>
      <div
        className={[
          "grow flex gap-2 items-start justify-start p-2 overflow-auto",
        ]}
      >
        <BoardLists boardId={params.boardId} />
        <Portal container={() => document.getElementById("portal-root")!}>
          <DraggedItemDisplay />
          <ItemEditorModal />
        </Portal>
      </div>
    </div>
  )
}

function DraggedItemDisplay() {
  const animTimeout = useRef(-1)
  const ref = useRef<HTMLDivElement>(null)
  useWatch(() => {
    const state = itemDragState.value
    const container = ref.current
    clearTimeout(animTimeout.current)

    if (!state && container?.firstChild) {
      container.firstChild.remove()
    }
    if (!state || !container) return
    const offset = {
      x: state.mousePos.x - state.offset.x,
      y: state.mousePos.y - state.offset.y,
    }
    container.style.transform = `translate(${offset.x}px, ${offset.y}px)`

    const element = state.element
    if (!container.firstChild) {
      container.append(element)
      element.style.userSelect = "none"
      element.style.transition = "0.2s ease-in"
      animTimeout.current = setTimeout(() => {
        element.style.rotate = "-5deg"
        element.style.scale = "1.1"
        element.style.boxShadow =
          preferredTheme.value === "dark"
            ? "0 0 10px rgba(0, 0, 0, 0.5)"
            : "0 0 10px rgba(0, 0, 0, 0.15)"
      }, 1)
    }
  })

  return <div ref={ref} className="absolute top-0 left-0" />
}

type BoardListsProps = {
  boardId: string
}
function BoardLists({ boardId }: BoardListsProps) {
  const lists = useAsync(async () => {
    const res = await db.collections.lists.findMany(
      (l) => l.boardId === boardId
    )
    return res.sort((a, b) => a.order - b.order)
  }, [boardId])

  useEffect(() => {
    const onListChanged = (list: List) => {
      if (list.boardId !== boardId) return
      lists.invalidate()
    }
    db.collections.lists.addEventListener("write|delete", onListChanged)
    return () => {
      db.collections.lists.removeEventListener("write|delete", onListChanged)
    }
  }, [boardId])

  if (lists.loading) {
    return <div>Loading...</div>
  }

  if (lists.error) {
    return <div>{lists.error.message}</div>
  }

  return (
    <>
      {lists.data.map((list) => (
        <ListDisplay key={list.id} list={list} />
      ))}
      <Button
        onclick={() =>
          db.collections.lists.create({ boardId, order: lists.data.length })
        }
        variant="primary"
        className="min-w-64 basis-80 max-w-screen"
      >
        + Add List
      </Button>
    </>
  )
}

type ListDisplayProps = {
  list: List
}
function ListDisplay({ list }: ListDisplayProps) {
  return (
    <div
      className={[
        "bg-[#eee]",
        "dark:bg-white/5",
        "flex flex-col gap-2 p-2 min-w-64 basis-80 max-w-screen rounded-lg",
      ]}
    >
      <div>{list.title}</div>
      <ListItemsDisplay listId={list.id} />
    </div>
  )
}

type ListItemsDisplayProps = {
  listId: string
}
function ListItemsDisplay({ listId }: ListItemsDisplayProps) {
  const items = useRef<Item[]>([])
  const loadState = useAsync(async () => {
    const res = await db.collections.items.findMany((i) => i.listId === listId)
    items.current = res.sort((a, b) => a.order - b.order)
  }, [listId])

  useEffect(() => {
    const handleDelete = async (item: Item) => {
      if (item.listId !== listId) return
      loadState.invalidate()
    }
    db.collections.items.addEventListener("delete", handleDelete)
    return () => {
      db.collections.items.removeEventListener("delete", handleDelete)
    }
  }, [])

  return (
    <div className="flex flex-col gap-2">
      <div
        className={[
          "bg-black/6",
          "dark:bg-black/30",
          "flex flex-col gap-1 p-1",
        ]}
      >
        {items.current.length ? (
          items.current.map((item) => (
            <ListItemDisplay key={item.id} item={item} />
          ))
        ) : loadState.loading ? (
          <i className={["text-neutral-600 p-1", "dark:text-neutral-300"]}>
            Loading
          </i>
        ) : loadState.error ? (
          loadState.error.message
        ) : (
          <i className={["text-neutral-600 p-1", "dark:text-neutral-300"]}>
            No items
          </i>
        )}
      </div>
      <Button
        variant="primary"
        onclick={async () => {
          await db.collections.items.create({
            listId,
            order: items.current.length,
          })
          loadState.invalidate()
        }}
      >
        Add Item
      </Button>
    </div>
  )
}

type ListItemDisplayProps = {
  item: Item
}
function ListItemDisplay({ item }: ListItemDisplayProps) {
  const btnRef = useRef<HTMLButtonElement>(null)
  const longPressing = useRef(false)

  const handlePointerDown = useCallback((e: PointerEvent) => {
    if (e.currentTarget !== btnRef.current) return

    const beginLongPress = () => {
      console.log("long press")
      document.body.style.userSelect = "none"
      longPressing.current = true
      const domRect = el.getBoundingClientRect()
      const element = el.cloneNode(true) as HTMLButtonElement
      element.style.width = `${domRect.width}px`
      element.style.height = `${domRect.height}px`
      element.style.pointerEvents = "none"
      itemDragState.value = {
        item,
        element,
        dragging: false,
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
      beginLongPress()
    }, 500)

    // effectively handles 'long press' event for touch device
    const handleContextMenu = () => {
      if (longPressing.current) return
      beginLongPress()
    }

    const handlePointerMove = (e: TouchEvent | PointerEvent) => {
      console.log("move")
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
        dragging: true,
        mousePos: { x: pos.clientX, y: pos.clientY },
      }
    }
    // ptr up event fires before click
    const handlePointerUp = () => {
      document.body.style.userSelect = "auto"
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

  return (
    <button
      ref={btnRef}
      onclick={(e) => {
        console.log("click", e.defaultPrevented)
        if (e.defaultPrevented) return
        selectedItem.value = item
      }}
      onpointerdown={handlePointerDown}
      className={[
        "bg-[#eee]",
        "dark:bg-[#202020]",
        "p-2 text-sm flex gap-2 items-start",
        itemDragState.value?.item.id === item.id && "opacity-50",
      ]}
    >
      <p className="flex-grow text-left">{item.title}</p>
      <button
        className="hover:text-red-500"
        onclick={(e) => {
          e.preventDefault()
          db.collections.items.delete(item.id)
        }}
      >
        <TrashIcon />
      </button>
    </button>
  )
}
