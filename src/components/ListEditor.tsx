import { Transition, useEffect, useModel, useState } from "kaioken"
import { useBoard } from "../state/board"
import { ClickedList } from "../types"
import { Input } from "./atoms/Input"
import { DialogHeader } from "./dialog/DialogHeader"
import { useGlobal } from "../state/global"
import { Modal } from "./dialog/Modal"
import { MoreIcon } from "./icons/MoreIcon"
import { ContextMenu } from "./ContextMenu"
import { DialogFooter } from "./dialog/DialogFooter"
import { Button } from "./atoms/Button"

export function ListEditorModal() {
  const { clickedList, setClickedList } = useGlobal()
  if (!clickedList) return null
  return (
    <Transition
      in={clickedList?.dialogOpen || false}
      timings={[40, 150, 150, 150]}
      element={(state) => (
        <Modal
          state={state}
          close={() => {
            const tgt = clickedList.sender.target
            if (tgt && tgt instanceof HTMLElement) tgt.focus()
            setClickedList(null)
          }}
        >
          <ListEditor clickedList={clickedList} />
        </Modal>
      )}
    />
  )
}

function ListEditor({ clickedList }: { clickedList: ClickedList | null }) {
  const { setClickedList } = useGlobal()
  const { updateList, removeList, archiveList, board } = useBoard()
  const [titleRef, title] = useModel<HTMLInputElement, string>(
    clickedList?.list.title || "(New List)"
  )

  const [ctxOpen, setCtxOpen] = useState(false)

  useEffect(() => {
    if (clickedList?.sender && clickedList.sender instanceof KeyboardEvent) {
      titleRef.current?.focus()
    }
  }, [])

  async function saveChanges() {
    if (!clickedList) return
    const list = board?.lists.find((l) => l.id === clickedList.id)
    if (!list) throw new Error("no list, wah wah")
    await updateList({ ...list, title })
    setClickedList({ ...clickedList, list: { ...clickedList.list, title } })
  }

  async function handleCtxAction(action: "delete" | "archive") {
    if (!clickedList) return
    switch (action) {
      case "delete": {
        await removeList(clickedList.id)
        setClickedList(null)
        break
      }
      case "archive": {
        await archiveList(clickedList.id)
        setClickedList(null)
        break
      }
    }
  }

  return (
    <>
      <DialogHeader className="flex">
        <Input
          ref={titleRef}
          className="bg-transparent w-full border-0"
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
      {title !== clickedList?.list.title && (
        <DialogFooter>
          <span></span>
          <Button variant="primary" onclick={saveChanges}>
            Save changes
          </Button>
        </DialogFooter>
      )}
    </>
  )
}
