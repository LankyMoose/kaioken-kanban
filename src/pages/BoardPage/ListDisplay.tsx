import { Button } from "$/components/atoms/Button/Button"
import { List, Item, db } from "$/db"
import { itemDragState } from "./state"
import {
  useRef,
  useAsync,
  useEffect,
  useLayoutEffect,
  useComputed,
} from "kaioken"
import { boardElementsMap } from "./state"
import { deleteItemAndReorder } from "./utils"
import { ListItemDisplay } from "./ListItemDisplay"

type ListDisplayProps = {
  list: List
}
export function ListDisplay({ list }: ListDisplayProps) {
  const dropTargetRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const items = useRef<Item[]>([])
  const loadState = useAsync(async () => {
    const res = await db.collections.items.findMany((i) => i.listId === list.id)
    items.current = res.sort((a, b) => a.order - b.order)
  }, [list.id])

  useEffect(() => {
    const handleItemChanged = async (item: Item) => {
      if (
        item.listId !== list.id &&
        items.current.find((i) => i.id === item.id) === undefined
      ) {
        return
      }
      loadState.invalidate()
    }
    db.collections.items.addEventListener("write|delete", handleItemChanged)
    return () => {
      db.collections.items.removeEventListener(
        "write|delete",
        handleItemChanged
      )
    }
  }, [])

  useLayoutEffect(() => {
    boardElementsMap[list.id] = {
      container: containerRef,
      dropTarget: dropTargetRef,
      items: [],
    }

    return () => {
      delete boardElementsMap[list.id]
    }
  }, [])

  const addPB = useComputed(() => {
    if (!itemDragState.value) return false
    if (itemDragState.value?.target.listId !== list.id) return false
    return itemDragState.value.target.index === items.current.length
  })

  const hideEmptyListDisplay = useComputed(() => {
    if (!itemDragState.value) return false
    if (itemDragState.value?.target.listId !== list.id) return false
    return items.current.length === 0
  })

  return (
    <div
      ref={containerRef}
      className={[
        "bg-[#eee]",
        "dark:bg-white/5",
        "flex flex-col gap-2 p-2 min-w-64 basis-80 max-w-screen rounded-lg",
      ]}
    >
      <div>{list.title}</div>
      <div className="flex flex-col gap-2">
        <div
          ref={dropTargetRef}
          className={[
            "bg-black/6",
            "dark:bg-black/30",
            "flex flex-col gap-1 p-1",
            addPB.value && "pb-(--dragged-item-height)",
          ]}
        >
          {items.current.length ? (
            items.current.map((item) => (
              <ListItemDisplay
                key={item.id}
                item={item}
                handleDelete={() => {
                  deleteItemAndReorder([...items.current], item)
                }}
              />
            ))
          ) : loadState.loading ? (
            <i className={["text-neutral-600 p-1", "dark:text-neutral-300"]}>
              Loading
            </i>
          ) : loadState.error ? (
            loadState.error.message
          ) : (
            hideEmptyListDisplay.value === false && (
              <i className={["text-neutral-600 p-1", "dark:text-neutral-300"]}>
                No items
              </i>
            )
          )}
        </div>
        <Button
          variant="primary"
          onclick={async () => {
            await db.collections.items.create({
              listId: list.id,
              order: items.current.length,
            })
            loadState.invalidate()
          }}
        >
          Add Item
        </Button>
      </div>
    </div>
  )
}
