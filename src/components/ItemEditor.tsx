import {
  Transition,
  useComputed,
  useEffect,
  useRef,
  useSignal,
  useState,
} from "kaioken"
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
import { ListItem } from "../idb"
import { toast } from "./Toasts/Toasts"
import { ToastContentsWithUndo } from "./Toasts/ToastContentsWithUndo"

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
  const titleRef = useRef<HTMLInputElement>(null)
  const title = useSignal(clickedItem?.item.title || "")
  const content = useSignal(clickedItem?.item.content || "")
  const disableSave = useComputed(() => {
    const _title = title.value
    const _content = content.value
    return (
      _title === clickedItem?.item.title &&
      _content === clickedItem?.item.content
    )
  })

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
    const newContent = content.peek()
    const newTitle = title.peek()
    if (
      newContent === clickedItem.item.content &&
      newTitle === clickedItem.item.title
    )
      return

    const newItem: ListItem = {
      ...clickedItem.item,
      content: newContent,
      title: newTitle,
    }
    await updateItem(newItem)
    close()
  }

  async function handleCtxAction(action: "delete" | "archive") {
    if (!clickedItem) return
    const revert = await (action === "delete" ? deleteItem : archiveItem)(
      clickedItem.item
    )
    toast({
      type: "info",
      children: () => (
        <ToastContentsWithUndo undo={revert}>
          item {action === "delete" ? "deleted" : "archived"}
        </ToastContentsWithUndo>
      ),
      pauseOnHover: true,
    })
    close()
  }

  return (
    <>
      <DialogHeader>
        <Input
          ref={titleRef}
          bind:value={title}
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
            onChange={(v) => (content.value = v)}
          />
        </div>
      </DialogBody>
      <DialogFooter>
        <span></span>
        <Button variant="primary" onclick={saveChanges} disabled={disableSave}>
          Save & close
        </Button>
      </DialogFooter>
    </>
  )
}
