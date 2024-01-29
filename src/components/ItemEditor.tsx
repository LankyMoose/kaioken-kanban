import { Transition, useEffect, useModel } from "kaioken"
import { useBoard } from "../state/board"
import { Input } from "./atoms/Input"
import { DialogBody } from "./dialog/DialogBody"
import { DialogHeader } from "./dialog/DialogHeader"
import { updateItem as updateDbItem } from "../idb"
import { useGlobal } from "../state/global"
import { Modal } from "./dialog/Modal"
import { MoreIcon } from "./icons/MoreIcon"

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
  const { updateItem } = useBoard()
  const [titleRef, title] = useModel<HTMLInputElement, string>(
    clickedItem?.item.title || "(New Item)"
  )
  const [contentRef, content] = useModel<HTMLTextAreaElement, string>(
    clickedItem?.item.content || ""
  )

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

  return (
    <>
      <DialogHeader>
        <Input
          ref={titleRef}
          className="bg-transparent w-full border-0"
          onfocus={(e) => (e.target as HTMLInputElement)?.select()}
          onchange={handleTitleChange}
        />
        <button className="w-9 flex justify-center items-center">
          <MoreIcon />
        </button>
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
