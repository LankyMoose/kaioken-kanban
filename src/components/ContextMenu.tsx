import { Transition, useEffect, useMemo, useRef } from "kaioken"
import { useContextMenu } from "../state/contextMenu"
import "./ContextMenu.css"
import { useBoardTagsStore } from "../state/boardTags"
import { useItemsStore } from "../state/items"
import { useBoardStore } from "../state/board"
import { Tag } from "../types"

export function ContextMenu() {
  const menuRef = useRef<HTMLDivElement>(null)
  const {
    value: { open, click },
    setOpen,
  } = useContextMenu()

  useEffect(() => {
    document.body.addEventListener("pointerdown", handleClickOutside)
    document.body.addEventListener("keydown", handleKeydown)
    return () => {
      document.body.removeEventListener("pointerdown", handleClickOutside)
      document.body.removeEventListener("keydown", handleKeydown)
    }
  }, [])

  if (!open) return null

  function handleClickOutside(e: PointerEvent) {
    if (!menuRef.current || !e.target || !(e.target instanceof Element)) return
    if (menuRef.current.contains(e.target)) return
    if (useContextMenu.getState().rightClickHandled) return
    setOpen(false)
  }
  function handleKeydown(e: KeyboardEvent) {
    if (e.key !== "Escape") return
    setOpen(false)
  }

  return (
    <Transition
      timings={[30, 150, 150, 150]}
      in={open}
      element={(state) => {
        if (state === "exited") return null
        const opacity = String(state === "entered" ? 1 : 0)
        return (
          <div
            ref={menuRef}
            id="context-menu"
            style={{
              transform: `translate(${click.x}px, ${click.y}px)`,
              transition: "all .15s",
              opacity,
            }}
          >
            <ContextMenuDisplay />
          </div>
        )
      }}
    />
  )
}

function ContextMenuDisplay() {
  const {
    value: { item },
    reset,
  } = useContextMenu()
  const { deleteItem, archiveItem } = useItemsStore()
  const {
    value: { board },
  } = useBoardStore()
  const {
    value: { tags, itemTags: boardItemTags },
    addItemTag,
    removeItemTag,
  } = useBoardTagsStore()

  const itemTags = useMemo(() => {
    if (!item) return []
    return boardItemTags.filter((it) => it.itemId === item.id)
  }, [boardItemTags, item?.id])

  async function handleDelete() {
    if (!item) return
    await deleteItem(item)
    reset()
  }

  async function handleArchive() {
    if (!item) return
    await archiveItem(item)
    reset()
  }

  function handleTagToggle(tag: Tag, selected: boolean) {
    if (!item || !board) return
    if (selected) {
      const itemTag = itemTags.find((it) => it.tagId === tag.id)
      if (!itemTag) return console.error("itemTag not found")
      removeItemTag(itemTag)
    } else {
      addItemTag({
        itemId: item.id,
        tagId: tag.id,
        boardId: board.id,
      })
    }
  }

  return (
    <div id="context-menu-inner" className="flex flex-col">
      <button onclick={handleDelete} className="context-menu-item">
        Delete
      </button>
      <button onclick={handleArchive} className="context-menu-item">
        Archive
      </button>
      <div className="context-menu-item tag-selector">
        <span className="header">Tags</span>
        <div className="p-2 tag-selector">
          {tags.map((tag) => {
            const selected = itemTags.some((it) => it.tagId === tag.id)
            return (
              <button
                className="px-[4px] py-[1px] text-xs border border-black border-opacity-30"
                style={{
                  backgroundColor: selected ? tag.color : "#333",
                  opacity: selected ? "1" : ".5",
                }}
                onclick={() => handleTagToggle(tag, selected)}
              >
                {tag.title}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
