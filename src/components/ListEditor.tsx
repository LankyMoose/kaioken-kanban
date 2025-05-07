import {
  Transition,
  useComputed,
  useEffect,
  useRef,
  useSignal,
  useState,
} from "kaioken"
import { ClickedList } from "../types"
import { Input } from "./atoms/Input"
import { DialogHeader } from "./dialog/DialogHeader"
import { useGlobal } from "../state/global"
import { Modal } from "./dialog/Modal"
import { MoreIcon } from "./icons/MoreIcon"
import { ActionMenu } from "./ActionMenu"
import { DialogFooter } from "./dialog/DialogFooter"
import { Button } from "./atoms/Button"
import { maxListNameLength } from "../constants"
import { useListsStore } from "../state/lists"

export function ListEditorModal() {
  const { clickedList, setClickedList } = useGlobal()
  if (!clickedList) return null
  return (
    <Transition
      in={clickedList?.dialogOpen || false}
      duration={{ in: 40, out: 150 }}
      element={(state) => (
        <Modal
          state={state}
          close={() => {
            const tgt = clickedList.sender?.target
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
  const { updateList, getList, deleteList, archiveList } = useListsStore()
  const titleRef = useRef<HTMLInputElement>(null)
  const title = useSignal(clickedList?.list.title || "")
  const disableSave = useComputed(() => title.value === clickedList?.list.title)

  const [ctxOpen, setCtxOpen] = useState(false)
  const ctxMenuButtonRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    titleRef.current?.focus()
  }, [])

  async function saveChanges() {
    if (!clickedList) return
    const list = getList(clickedList.id)
    if (!list) throw new Error("no list, wah wah")
    await updateList({ ...list, title: title.peek() })
    setClickedList(null)
  }

  async function handleCtxAction(action: "delete" | "archive") {
    if (!clickedList) return
    switch (action) {
      case "delete": {
        await deleteList(clickedList.id)
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
      <DialogHeader className="flex pb-0 mb-0 border-b-0">
        <Input
          ref={titleRef}
          bind:value={title}
          maxLength={maxListNameLength}
          className="bg-transparent w-full border-0"
          placeholder="(Unnamed List)"
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
      <DialogFooter className="mt-2">
        <span></span>
        <Button variant="primary" onclick={saveChanges} disabled={disableSave}>
          Save & close
        </Button>
      </DialogFooter>
    </>
  )
}
