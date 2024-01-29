import { Transition, useEffect, useModel, useState } from "kaioken"
import { useBoard } from "../state/board"
import { Input } from "./atoms/Input"
import { DialogBody } from "./dialog/DialogBody"
import { DialogHeader } from "./dialog/DialogHeader"
import { archiveItem, deleteItem, updateItem as updateDbItem } from "../idb"
import { useGlobal } from "../state/global"
import { Modal } from "./dialog/Modal"
import { MoreIcon } from "./icons/MoreIcon"
import { ContextMenu } from "./ContextMenu"

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
  const { updateItem, removeItem } = useBoard()
  const [titleRef, title] = useModel<HTMLInputElement, string>(
    clickedItem?.item.title || "(New Item)"
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

  async function handleTitleChange() {
    if (!clickedItem) return
    if (title === clickedItem.item.title) return

    const newItem = { ...clickedItem.item, title }
    updateItem(newItem)
    await updateDbItem(newItem)
    const { clickedItem: c } = useGlobal()
    if (c?.id === newItem.id && c.dialogOpen) {
      setClickedItem({
        ...c,
        item: newItem,
      })
    }
  }

  async function handleContentChange() {
    if (!clickedItem) return
    const newItem = { ...clickedItem.item, content }
    await updateDbItem(newItem)
    updateItem(newItem)
    setClickedItem({
      ...clickedItem,
      item: newItem,
    })
  }

  async function handleCtxAction(action: "delete" | "archive") {
    if (!clickedItem) return
    await (action === "delete" ? deleteItem : archiveItem)(clickedItem?.item)
    if (action === "archive") {
      updateItem({ ...clickedItem.item, archived: true })
    } else {
      removeItem(clickedItem.item)
    }
    setClickedItem(null)
  }

  return (
    <>
      <DialogHeader>
        <Input
          ref={titleRef}
          className="bg-transparent w-full border-0"
          onfocus={(e) => (e.target as HTMLInputElement)?.select()}
          onchange={handleTitleChange}
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
        <h3 className="text-sm font-semibold">Description</h3>
        <textarea
          ref={contentRef}
          className="w-full border-0 resize-none"
          onchange={handleContentChange}
        />
      </DialogBody>
    </>
  )
}
