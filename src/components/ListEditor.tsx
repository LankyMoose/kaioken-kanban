import { Transition, useModel } from "kaioken"
import { useBoard } from "../state/board"
import { ClickedList } from "../types"
import { Input } from "./atoms/Input"
import { DialogBody } from "./dialog/DialogBody"
import { DialogHeader } from "./dialog/DialogHeader"
import { updateList as updateDbList } from "../idb"
import { useGlobal } from "../state/global"
import { Modal } from "./dialog/Modal"

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
  const { updateList } = useBoard()
  const [titleRef, title] = useModel<HTMLInputElement, string>(
    clickedList?.list.title || "(New List)"
  )

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

  return (
    <>
      <DialogHeader>
        <Input
          ref={titleRef}
          className="bg-transparent w-full border-0"
          onfocus={(e) => (e.target as HTMLInputElement)?.select()}
          onchange={handleTitleChange}
        />
      </DialogHeader>
      <DialogBody></DialogBody>
    </>
  )
}
