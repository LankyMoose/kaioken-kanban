import { Transition, useEffect, useModel, useState } from "kaioken"
import { Input } from "../atoms/Input"
import { Modal } from "./Dialog/Modal"
import { MoreIcon } from "../icons/MoreIcon"
import { Button } from "../atoms/Button/Button"
import { MDEditor } from "./MDEditor"
import Dialog from "./Dialog/Dialog"
import { ActionMenu } from "../molecules/ActionMenu/ActionMenu"
import { selectedItem } from "$/state"
import { db } from "$/db"
import { maxItemNameLength } from "$/constants"

export function ItemEditorModal() {
  const handleClose = () => {
    selectedItem.value = null
  }

  return (
    <Transition
      in={selectedItem.value !== null}
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
  const [titleRef, title] = useModel<HTMLInputElement, string>(
    selectedItem.value?.title || ""
  )
  const [content, setContent] = useState(selectedItem.value?.content ?? "")

  const [ctxOpen, setCtxOpen] = useState(false)

  useEffect(() => {
    titleRef.current?.focus()
  }, [])

  const close = () => {
    selectedItem.value = null
  }

  async function saveChanges() {
    if (!selectedItem.value) return
    if (
      content !== selectedItem.value.content ||
      title !== selectedItem.value.title
    ) {
      await db.collections.items.update({
        ...selectedItem.value,
        title,
        content,
      })
      close()
    }
  }

  async function handleCtxAction(action: "delete" | "archive") {
    if (!selectedItem.value) return
    if (action === "delete") {
      await db.collections.items.delete(selectedItem.value.id)
    } else {
      await db.collections.items.update({
        ...selectedItem.value,
        archived: true,
      })
    }
    close()
  }

  return (
    <>
      <Dialog.Header>
        <Input
          ref={titleRef}
          maxLength={maxItemNameLength}
          placeholder="(Unnamed Item)"
          className="w-full border-0"
          onfocus={(e) => (e.target as HTMLInputElement)?.select()}
          onkeyup={(e) => (e.key === "Enter" ? saveChanges() : null)}
        />
        <div className="relative">
          <ActionMenu
            button={(ref) => (
              <button
                ref={ref}
                onclick={() => setCtxOpen((prev) => !prev)}
                className="w-9 flex justify-center items-center h-full"
              >
                <MoreIcon />
              </button>
            )}
            open={ctxOpen}
            close={() => setCtxOpen(false)}
            items={[
              { text: "Archive", onclick: () => handleCtxAction("archive") },
              { text: "Delete", onclick: () => handleCtxAction("delete") },
            ]}
          />
        </div>
      </Dialog.Header>
      <Dialog.Body>
        <div>
          <label className="text-sm font-semibold">Description</label>
          <MDEditor
            initialValue={selectedItem.value?.content}
            onChange={setContent}
          />
        </div>
      </Dialog.Body>
      <Dialog.Footer>
        <span></span>
        <Button
          variant="primary"
          onclick={saveChanges}
          disabled={
            title === selectedItem.value?.title &&
            content === selectedItem.value?.content
          }
        >
          Save & close
        </Button>
      </Dialog.Footer>
    </>
  )
}
