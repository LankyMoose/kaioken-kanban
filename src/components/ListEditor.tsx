import { Transition, useEffect, useModel, useState } from "kaioken"
import { useBoard } from "../state/board"
import { ClickedList } from "../types"
import { Input } from "./atoms/Input"
import { DialogBody } from "./dialog/DialogBody"
import { DialogHeader } from "./dialog/DialogHeader"
import { archiveList, deleteList, updateList as updateDbList } from "../idb"
import { useGlobal } from "../state/global"
import { Modal } from "./dialog/Modal"
import { MoreIcon } from "./icons/MoreIcon"
import { ContextMenu } from "./ContextMenu"

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
  const { updateList, removeList } = useBoard()
  const [titleRef, title] = useModel<HTMLInputElement, string>(
    clickedList?.list.title || "(New List)"
  )

  const [ctxOpen, setCtxOpen] = useState(false)

  useEffect(() => {
    if (clickedList?.sender && clickedList.sender instanceof KeyboardEvent) {
      titleRef.current?.focus()
    }
  }, [])

  async function handleTitleChange() {
    if (!clickedList) return
    const newList = { ...clickedList.list, title }
    await updateDbList(newList)
    updateList(newList)
    setClickedList({
      ...clickedList,
      list: newList,
    })
  }

  async function handleCtxAction(
    action: "delete" | "archive" | "view-archived"
  ) {
    if (!clickedList) return
    switch (action) {
      case "delete": {
        await deleteList(clickedList.list)
        removeList(clickedList.id)
        setClickedList(null)
        break
      }
      case "archive": {
        await archiveList(clickedList.list)
        updateList({ ...clickedList.list, archived: true })
        setClickedList(null)
        break
      }
      case "view-archived": {
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
              {
                text: "View archived items",
                onclick: () => handleCtxAction("delete"),
              },
              { text: "Archive", onclick: () => handleCtxAction("archive") },
              { text: "Delete", onclick: () => handleCtxAction("delete") },
            ]}
          />
        </div>
      </DialogHeader>
      <DialogBody></DialogBody>
    </>
  )
}
