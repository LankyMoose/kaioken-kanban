import { Transition, useEffect, useModel, useRef, useState } from "kaioken"
import { Input } from "./atoms/Input"
import { DialogBody } from "./dialog/DialogBody"
import { DialogHeader } from "./dialog/DialogHeader"
import { useGlobal } from "../state/global"
import { Modal } from "./dialog/Modal"
import { MoreIcon } from "./icons/MoreIcon"
import { ActionMenu } from "./ActionMenu"
import { Button } from "./atoms/Button"
import { DialogFooter } from "./dialog/DialogFooter"
import { maxItemNameLength } from "../constants"
import { useBoardTagsStore } from "../state/boardTags"
import { useBoardStore } from "../state/board"
import { useItemsStore } from "../state/items"

export function ItemEditorModal() {
  const { clickedItem, setClickedItem } = useGlobal()
  if (!clickedItem) return null

  const handleClose = () => {
    const tgt = clickedItem.sender?.target
    if (tgt && tgt instanceof HTMLElement) tgt.focus()
    setClickedItem(null)
  }

  return (
    <Transition
      in={clickedItem?.dialogOpen || false}
      duration={{ in: 40, out: 150 }}
      element={(state) => {
        return (
          <Modal state={state} close={handleClose}>
            <ItemEditor />
          </Modal>
        )
      }}
    />
  )
}

function ItemEditor() {
  const { setClickedItem, clickedItem } = useGlobal()
  const {
    value: { board },
  } = useBoardStore()
  const {
    value: { tags, itemTags },
    addItemTag,
    removeItemTag,
  } = useBoardTagsStore()
  const { updateItem, deleteItem, archiveItem } = useItemsStore()

  const [titleRef, title] = useModel<HTMLInputElement, string>(
    clickedItem?.item.title || ""
  )
  const [contentRef, content] = useModel<HTMLTextAreaElement, string>(
    clickedItem?.item.content || ""
  )

  const savedTagIds =
    itemTags.filter((t) => t.itemId === clickedItem?.id).map((i) => i.tagId) ??
    []

  const [ctxOpen, setCtxOpen] = useState(false)
  const ctxMenuButtonRef = useRef<HTMLButtonElement>(null)
  const [itemTagIds, setItemTagIds] = useState(savedTagIds)

  const addedItemTagIds = itemTagIds.filter((id) => !savedTagIds.includes(id))
  const removedItemTagIds = savedTagIds.filter((id) => !itemTagIds.includes(id))
  const itemTagIdsChanged = addedItemTagIds.length || removedItemTagIds.length

  useEffect(() => {
    titleRef.current?.focus()
  }, [])

  async function saveChanges() {
    if (!clickedItem) return

    if (addedItemTagIds.length || removedItemTagIds.length) {
      await Promise.all([
        ...addedItemTagIds.map((it) =>
          addItemTag({ boardId: board!.id, itemId: clickedItem.id, tagId: it })
        ),
        ...removedItemTagIds
          .map(
            (it) =>
              itemTags.find(
                (t) => t.tagId === it && t.itemId === clickedItem.id
              )!.id
          )
          .map((id) => {
            return removeItemTag(itemTags.find((it) => it.id === id)!)
          }),
      ])
    }

    if (
      content !== clickedItem.item.content ||
      title !== clickedItem.item.title
    ) {
      const newItem = { ...clickedItem.item, content, title }
      await updateItem(newItem)
    }
    setClickedItem(null)
  }

  async function handleCtxAction(action: "delete" | "archive") {
    if (!clickedItem) return
    await (action === "delete" ? deleteItem : archiveItem)(clickedItem.item)
    setClickedItem(null)
  }

  async function handleItemTagChange(e: Event, id: number) {
    const checked = (e.target as HTMLInputElement).checked
    const newTagIds = checked
      ? [...itemTagIds, id]
      : itemTagIds.filter((item) => item !== id)

    setItemTagIds(newTagIds)
  }

  return (
    <>
      <DialogHeader>
        <Input
          ref={titleRef}
          maxLength={maxItemNameLength}
          placeholder="(Unnamed Item)"
          className="w-full border-0"
          onfocus={(e) => (e.target as HTMLInputElement)?.select()}
        />
        <div className="relative">
          <button
            ref={ctxMenuButtonRef}
            onclick={() => setCtxOpen((prev) => !prev)}
            className="w-9 flex justify-center items-center h-full"
          >
            <MoreIcon />
          </button>
          <ActionMenu
            btn={ctxMenuButtonRef}
            open={ctxOpen}
            close={() => setCtxOpen(false)}
            items={[
              { text: "Archive", onclick: () => handleCtxAction("archive") },
              { text: "Delete", onclick: () => handleCtxAction("delete") },
            ]}
          />
        </div>
      </DialogHeader>
      <DialogBody>
        <div>
          <label className="text-sm font-semibold">Description</label>
          <textarea ref={contentRef} className="w-full border-0 resize-none" />
        </div>
        <div>
          <label className="text-sm font-semibold">Tags</label>
          <ul>
            {tags.map((t) => (
              <li className="flex items-center gap-2">
                <input
                  id={`item-tag-${t.id}`}
                  type={"checkbox"}
                  checked={itemTagIds?.includes(t.id)}
                  onchange={(e) => handleItemTagChange(e, t.id)}
                />
                <label
                  className="text-sm text-gray-200"
                  htmlFor={`item-tag-${t.id}`}
                >
                  {t.title}
                </label>
                <input type="color" value={t.color} disabled />
              </li>
            ))}
          </ul>
        </div>
      </DialogBody>
      <DialogFooter>
        <span></span>
        <Button
          variant="primary"
          onclick={saveChanges}
          disabled={
            title === clickedItem?.item.title &&
            content === clickedItem?.item.content &&
            !itemTagIdsChanged
          }
        >
          Save & close
        </Button>
      </DialogFooter>
    </>
  )
}
