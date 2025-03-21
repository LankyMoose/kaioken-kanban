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
import { useItemsStore } from "../state/items"
import { MDEditor } from "./MDEditor"

export function ItemEditorModal() {
  const { clickedItem, setClickedItem } = useGlobal()

  const handleClose = () => {
    const tgt = clickedItem?.sender?.target
    if (tgt && tgt instanceof HTMLElement) {
      tgt.focus()
    }
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
  const { updateItem, deleteItem, archiveItem } = useItemsStore()

  const [titleRef, title] = useModel<HTMLInputElement, string>(
    clickedItem?.item.title || ""
  )
  const [content, setContent] = useState(clickedItem?.item.content ?? "")

  const [ctxOpen, setCtxOpen] = useState(false)
  const ctxMenuButtonRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    titleRef.current?.focus()
  }, [])

  const close = () => {
    const tgt = clickedItem?.sender?.target
    if (tgt && tgt instanceof HTMLElement) {
      tgt.focus()
    }
    setClickedItem(null)
  }

  async function saveChanges() {
    if (!clickedItem) return
    if (
      content !== clickedItem.item.content ||
      title !== clickedItem.item.title
    ) {
      const newItem = { ...clickedItem.item, content, title }
      await updateItem(newItem)
      close()
    }
  }

  async function handleCtxAction(action: "delete" | "archive") {
    if (!clickedItem) return
    await (action === "delete" ? deleteItem : archiveItem)(clickedItem.item)
    close()
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
          onkeyup={(e) => (e.key === "Enter" ? saveChanges() : null)}
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
          <MDEditor
            initialValue={clickedItem?.item.content}
            onChange={setContent}
          />
        </div>
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
          Save & close
        </Button>
      </DialogFooter>
    </>
  )
}
