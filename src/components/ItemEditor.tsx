import { Transition, useEffect, useModel, useState } from "kaioken"
import { useBoard } from "../state/board"
import { Input } from "./atoms/Input"
import { DialogBody } from "./dialog/DialogBody"
import { DialogHeader } from "./dialog/DialogHeader"
import { useGlobal } from "../state/global"
import { Modal } from "./dialog/Modal"
import { MoreIcon } from "./icons/MoreIcon"
import { ContextMenu } from "./ContextMenu"
import { Button } from "./atoms/Button"
import { DialogFooter } from "./dialog/DialogFooter"
import { maxItemNameLength } from "../constants"

export function ItemEditorModal() {
  const { clickedItem, setClickedItem } = useGlobal()
  if (!clickedItem) return null

  const handleClose = () => {
    const tgt = clickedItem.sender.target
    if (tgt && tgt instanceof HTMLElement) tgt.focus()
    setClickedItem(null)
  }

  return (
    <Transition
      in={clickedItem?.dialogOpen || false}
      timings={[40, 150, 150, 150]}
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
  const { updateItem, removeItem, archiveItem } = useBoard()
  const [titleRef, title] = useModel<HTMLInputElement, string>(
    clickedItem?.item.title || ""
  )
  const [contentRef, content] = useModel<HTMLTextAreaElement, string>(
    clickedItem?.item.content || ""
  )

  const [ctxOpen, setCtxOpen] = useState(false)

  useEffect(() => {
    if (clickedItem?.sender && clickedItem.sender instanceof KeyboardEvent) {
      titleRef.current?.focus()
    }
  }, [])

  async function saveChanges() {
    if (!clickedItem) return
    const newItem = { ...clickedItem.item, content, title }
    await updateItem(newItem)
    setClickedItem({
      ...clickedItem,
      item: newItem,
    })
  }

  async function handleCtxAction(action: "delete" | "archive") {
    if (!clickedItem) return
    await (action === "delete" ? removeItem : archiveItem)(clickedItem.item)
    setClickedItem(null)
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
        <div className="flex justify-center items-center relative">
          <button
            onclick={() => setCtxOpen((prev) => !prev)}
            className="w-9 flex justify-center items-center h-full"
          >
            <MoreIcon />
          </button>
          <ContextMenu
            open={ctxOpen}
            items={[
              { text: "Archive", onclick: () => handleCtxAction("archive") },
              { text: "Delete", onclick: () => handleCtxAction("delete") },
            ]}
          />
        </div>
      </DialogHeader>
      <DialogBody>
        <label className="text-sm font-semibold">Description</label>
        <textarea ref={contentRef} className="w-full border-0 resize-none" />
      </DialogBody>
      <DialogFooter>
        <span></span>
        <Button
          variant="primary"
          onclick={saveChanges}
          disabled={
            title === clickedItem?.item.title &&
            content === clickedItem?.item.content
          }
        >
          Save changes
        </Button>
      </DialogFooter>
    </>
  )
}
