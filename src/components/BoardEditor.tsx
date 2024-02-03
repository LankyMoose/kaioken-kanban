import { useModel, useState, useEffect } from "kaioken"
import { loadItems, loadLists } from "../idb"
import { useBoard } from "../state/board"
import { SelectedBoard, List, ListItem } from "../types"
import { Button } from "./atoms/Button"
import { Input } from "./atoms/Input"
import { Spinner } from "./atoms/Spinner"
import { DialogHeader } from "./dialog/DialogHeader"
import { useGlobal } from "../state/global"
import { ContextMenu } from "./ContextMenu"
import { MoreIcon } from "./icons/MoreIcon"

export function BoardEditor() {
  const { setMainDrawerOpen } = useGlobal()
  const { board, updateSelectedBoard, deleteBoard, archiveBoard } = useBoard()
  const [titleRef, title] = useModel(board?.title || "(New Board)")
  const [ctxMenuOpen, setCtxMenuOpen] = useState(false)

  function handleSubmit() {
    updateSelectedBoard({ ...board, title })
  }

  async function handleDeleteClick() {
    if (!board) return
    if (!confirm("Are you sure? This can't be undone!")) return
    await deleteBoard(board)
    setMainDrawerOpen(false)
  }

  async function handleArchiveClick() {
    if (!board) return
    await archiveBoard(board)
    setMainDrawerOpen(false)
  }

  return (
    <>
      <DialogHeader>
        Board Details
        <div className="relative">
          <button onclick={() => setCtxMenuOpen((prev) => !prev)}>
            <MoreIcon />
          </button>
          <ContextMenu
            items={[
              {
                text: "Archive",
                onclick: handleArchiveClick,
              },
              {
                text: "Delete",
                onclick: handleDeleteClick,
              },
            ]}
            open={ctxMenuOpen}
          />
        </div>
      </DialogHeader>
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
      <br />
      <ArchivedItems board={board} />
    </>
  )
}

function ArchivedItems({ board }: { board: SelectedBoard | null }) {
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<(ListItem & { list: string })[]>([])
  const { restoreItem } = useBoard()

  useEffect(() => {
    if (!board) return
    setLoading(true)
    ;(async () => {
      const res = await Promise.all(
        board.lists.map(async (list) => {
          return (await loadItems(list.id, true)).map((item) => ({
            ...item,
            list: list.title,
          }))
        })
      )
      setLoading(false)
      setItems(res.flat())
    })()
  }, [])

  async function handleItemRestore(item: ListItem & { list: string }) {
    const { list, ...rest } = item
    await restoreItem(rest)
    setItems((prev) => prev.filter((l) => l.id !== item.id))
  }

  return (
    <div className="p-3 bg-black bg-opacity-15">
      <h4 className="text-sm mb-2 pb-1 border-b border-white border-opacity-10">
        Archived Items
      </h4>
      {loading ? (
        <div className="flex justify-center">
          <Spinner />
        </div>
      ) : items.length === 0 ? (
        <span className="text-sm text-gray-400">
          <i>No archived items</i>
        </span>
      ) : (
        items.map((item) => (
          <div className="flex gap-2 px-2 py-1 justify-between bg-white bg-opacity-5 border-b border-black border-opacity-30 last:border-b-0">
            <span>{item.title}</span>
            <div className="flex flex-col items-end">
              <span className="text-xs align-super opacity-75">
                {item.list || "(Unnamed Item)"}
              </span>
              <Button
                variant="link"
                className="p-0"
                onclick={() => handleItemRestore(item)}
              >
                Restore
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
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
            <span className="text-sm">{list.title || "(Unnamed List)"}</span>
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
