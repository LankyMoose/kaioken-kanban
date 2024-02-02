import { useModel, useState, useEffect } from "kaioken"
import { loadLists } from "../idb"
import { useBoard } from "../state/board"
import { SelectedBoard, List } from "../types"
import { Button } from "./atoms/Button"
import { Input } from "./atoms/Input"
import { Spinner } from "./atoms/Spinner"
import { DialogHeader } from "./dialog/DialogHeader"
import { addNotification } from "./notifications/Tray"

export function BoardEditor() {
  const { board, updateSelectedBoard } = useBoard()
  const [titleRef, title] = useModel(board?.title || "(New Board)")

  function handleSubmit() {
    updateSelectedBoard({ ...board, title })
  }

  return (
    <>
      <DialogHeader>Board Details</DialogHeader>
      <div className="flex gap-2">
        <Input
          className="bg-opacity-15 bg-black w-full border-0"
          ref={titleRef}
        />
        {title !== board?.title && (
          <Button variant="primary" onclick={handleSubmit}>
            Save
          </Button>
        )}
      </div>
      <br />
      <ArchivedLists board={board} />
    </>
  )
}

function ArchivedLists({ board }: { board: SelectedBoard | null }) {
  const [loading, setLoading] = useState(false)
  const [lists, setLists] = useState<List[]>([])
  const { restoreList } = useBoard()
  useEffect(() => {
    if (!board) return
    setLoading(true)
    ;(async () => {
      const res = await loadLists(board.id, true)
      setLists(res)
      setLoading(false)
    })()
  }, [])

  async function handleSendToBoard(list: List) {
    await restoreList(list)
    setLists((prev) => prev.filter((l) => l.id !== list.id))
    addNotification({
      text: `List '${list.title}' was restored`,
    })
  }

  return (
    <div className="p-3 bg-black bg-opacity-15">
      <h4 className="text-sm mb-2 pb-1 border-b border-white border-opacity-10">
        Archived Lists
      </h4>
      {loading ? (
        <div className="flex justify-center">
          <Spinner />
        </div>
      ) : lists.length === 0 ? (
        <span className="text-sm text-gray-400">
          <i>No archived lists</i>
        </span>
      ) : (
        lists.map((list) => (
          <div className="flex gap-2 px-2 py-1  items-center justify-between bg-white bg-opacity-5">
            <span className="text-sm">{list.title}</span>
            <Button
              variant="link"
              className="text-sm py-1"
              onclick={() => handleSendToBoard(list)}
            >
              Send to board
            </Button>
          </div>
        ))
      )}
    </div>
  )
}
