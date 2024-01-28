import { useModel } from "kaioken"
import { useBoard } from "../state/board"
import { ClickedItem } from "../types"
import { Input } from "./atoms/Input"
import { DialogBody } from "./dialog/DialogBody"
import { DialogHeader } from "./dialog/DialogHeader"
import { updateItem as updateDbItem } from "../idb"
import { useGlobal } from "../state/global"

export function ItemEditor({
  clickedItem,
}: {
  clickedItem: ClickedItem | null
}) {
  const { setClickedItem } = useGlobal()
  const { updateItem } = useBoard()
  const [nameRef, name] = useModel<HTMLInputElement, string>(
    clickedItem?.item.title || "(New Item)"
  )
  const [contentRef, content] = useModel<HTMLTextAreaElement, string>(
    clickedItem?.item.content || ""
  )

  async function handleTitleChange() {
    if (!clickedItem) return
    const newItem = {
      ...clickedItem.item,
      title: name,
    }
    await updateDbItem(newItem)
    updateItem(newItem)
    setClickedItem({
      ...clickedItem,
      item: newItem,
    })
  }

  async function handleContentChange() {
    if (!clickedItem) return
    const newItem = {
      ...clickedItem.item,
      content,
    }
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
          ref={nameRef}
          className="bg-transparent w-full border-0"
          onfocus={(e) => (e.target as HTMLInputElement)?.select()}
          onchange={handleTitleChange}
        />
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
