import { useState, useEffect, ElementProps, useRef, useSignal } from "kaioken"
import { Board, db, List, ListItem, Tag } from "../idb"
import { useBoardStore } from "../state/board"
import { Button } from "./atoms/Button"
import { Input } from "./atoms/Input"
import { Spinner } from "./atoms/Spinner"
import { DialogHeader } from "./dialog/DialogHeader"
import { useGlobal } from "../state/global"
import { ActionMenu } from "./ActionMenu"
import { MoreIcon } from "./icons/MoreIcon"
import { maxBoardNameLength, maxTagNameLength } from "../constants"
import { Transition } from "kaioken"
import { Drawer } from "./dialog/Drawer"
import { useListsStore } from "../state/lists"
import { useBoardTagsStore } from "../state/boardTags"
import { useItemsStore } from "../state/items"
import { toast } from "./Toasts/Toasts"
import { ToastContentsWithUndo } from "./Toasts/ToastContentsWithUndo"

export function BoardEditorDrawer() {
  const { boardEditorOpen, setBoardEditorOpen } = useGlobal()
  return (
    <Transition
      in={boardEditorOpen}
      duration={{
        in: 40,
        out: 150,
      }}
      element={(state) =>
        state === "exited" ? null : (
          <Drawer state={state} close={() => setBoardEditorOpen(false)}>
            <BoardEditor />
          </Drawer>
        )
      }
    />
  )
}

function BoardEditor() {
  const { setBoardEditorOpen, boards, updateBoards } = useGlobal()

  const {
    value: { board },
    deleteBoard,
    archiveBoard,
    restoreBoard,
    updateSelectedBoard,
  } = useBoardStore()
  const titleRef = useRef<HTMLInputElement>(null)
  const title = useSignal(board?.title || "")
  const [ctxMenuOpen, setCtxMenuOpen] = useState(false)
  const ctxMenuButtonRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    titleRef.current?.focus()
  }, [])

  async function handleSubmit() {
    const res = await updateSelectedBoard({ ...board, title: title.peek() })
    updateBoards(boards.map((b) => (b.id === res.id ? res : b)))
  }

  async function handleDeleteClick() {
    if (!board) return
    const restore = await deleteBoard()

    const newBoards = boards.filter((b) => b.id !== board.id)
    updateBoards(newBoards)
    setBoardEditorOpen(false)

    toast({
      type: "info",
      children: () => (
        <ToastContentsWithUndo
          undo={async () => {
            restore()
            updateBoards([...newBoards, board])
          }}
        >
          Board deleted
        </ToastContentsWithUndo>
      ),
      pauseOnHover: true,
    })
  }

  async function handleArchiveClick() {
    const res = await archiveBoard()
    const newBoards = boards.map((b) => (b.id === res.id ? res : b))
    updateBoards(newBoards)
    setBoardEditorOpen(false)

    toast({
      type: "info",
      children: () => (
        <ToastContentsWithUndo
          undo={async () => {
            await restoreBoard()
            updateBoards(boards)
          }}
        >
          Board archived
        </ToastContentsWithUndo>
      ),
      pauseOnHover: true,
    })
  }

  async function handleRestoreClick() {
    if (!board) return
    await restoreBoard()
    updateBoards(
      boards.map((b) => (b.id === board.id ? { ...board, archived: false } : b))
    )
    setBoardEditorOpen(false)
  }

  return (
    <>
      <DialogHeader>
        Board Details
        <div className="relative">
          <button
            ref={ctxMenuButtonRef}
            className="w-9 flex justify-center items-center h-full"
            onclick={() => setCtxMenuOpen((prev) => !prev)}
          >
            <MoreIcon />
          </button>
          <ActionMenu
            btn={ctxMenuButtonRef}
            open={ctxMenuOpen}
            close={() => setCtxMenuOpen(false)}
            items={[
              board?.archived
                ? {
                    text: "Restore",
                    onclick: handleRestoreClick,
                  }
                : {
                    text: "Archive",
                    onclick: handleArchiveClick,
                  },
              {
                text: "Delete",
                onclick: handleDeleteClick,
              },
            ]}
          />
        </div>
      </DialogHeader>
      <div className="flex gap-2">
        <Input
          className="bg-black/15 w-full border-0"
          bind:value={title}
          ref={titleRef}
          maxLength={maxBoardNameLength}
          placeholder="(Unnamed Board)"
          onkeypress={(e) => e.key === "Enter" && handleSubmit()}
        />
        <Button
          variant="primary"
          onclick={handleSubmit}
          disabled={title.value === board?.title}
        >
          Save
        </Button>
      </div>
      <br />
      <BoardTagsEditor board={board} />
      <br />
      <ArchivedLists board={board} />
      <br />
      <ArchivedItems board={board} />
    </>
  )
}

function BoardTagsEditor({ board }: { board: Board | null }) {
  const {
    addTag,
    value: { tags },
  } = useBoardTagsStore()

  function handleAddTagClick() {
    if (!board) return
    addTag(board.id)
  }

  return (
    <ListContainer>
      <ListTitle>Board Tags</ListTitle>

      <div className="mb-2">
        {tags.map((tag) => (
          <BoardTagEditor key={tag.id} tag={tag} />
        ))}
      </div>
      <div className="flex">
        <Button variant="link" className="ml-auto" onclick={handleAddTagClick}>
          Add Tag
        </Button>
      </div>
    </ListContainer>
  )
}

function BoardTagEditor({ tag }: { tag: Tag }) {
  const { updateTag, deleteTagAndRelations } = useBoardTagsStore()

  const handleTitleChange = (e: Event) => {
    const title = (e.target as HTMLInputElement).value
    updateTag({ ...tag, title })
  }

  const handleColorChange = (e: Event) => {
    const color = (e.target as HTMLInputElement).value
    updateTag({ ...tag, color })
  }

  return (
    <ListItemContainer className="items-center">
      <Input
        value={tag.title}
        onchange={handleTitleChange}
        placeholder="(Unnamed Tag)"
        className="border-0 text-sm grow"
        maxLength={maxTagNameLength}
      />
      <input
        value={tag.color}
        onchange={handleColorChange}
        type="color"
        className="cursor-pointer"
      />
      <button onclick={() => deleteTagAndRelations(tag)}>Delete</button>
    </ListItemContainer>
  )
}

function ArchivedItems({ board }: { board: Board | null }) {
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<(ListItem & { list: string })[]>([])
  const { restoreItem } = useItemsStore()
  const {
    value: { lists },
  } = useListsStore()

  useEffect(() => {
    if (!board) return
    setLoading(true)
    ;(async () => {
      const res = await Promise.all(
        lists.map(async (list) => {
          return (
            await db.collections.items.findMany(
              (it) => it.listId === list.id && it.archived
            )
          ).map((item) => ({
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
    <ListContainer>
      <ListTitle>Archived Items</ListTitle>
      {loading ? (
        <div className="flex justify-center">
          <Spinner />
        </div>
      ) : items.length === 0 ? (
        <span className="text-sm text-gray-500">
          <i>No archived items</i>
        </span>
      ) : (
        items.map((item) => (
          <ListItemContainer key={item.id}>
            <span className="text-sm">{item.title || "(Unnamed item)"}</span>
            <div className="flex flex-col items-end">
              <span className="text-xs align-super text-gray-400 text-nowrap mb-2">
                {item.list || "(Unnamed list)"}
              </span>
              <Button
                variant="link"
                className="px-0 py-0"
                onclick={() => handleItemRestore(item)}
              >
                Restore
              </Button>
            </div>
          </ListItemContainer>
        ))
      )}
    </ListContainer>
  )
}

function ArchivedLists({ board }: { board: Board | null }) {
  const [loading, setLoading] = useState(false)
  const [lists, setLists] = useState<List[]>([])
  const { restoreList } = useListsStore()
  useEffect(() => {
    if (!board) return
    setLoading(true)
    ;(async () => {
      const res = await db.collections.lists.findMany(
        (l) => l.boardId === board.id && l.archived
      )
      setLists(res)
      setLoading(false)
    })()
  }, [])

  async function handleSendToBoard(list: List) {
    await restoreList(list)
    setLists((prev) => prev.filter((l) => l.id !== list.id))
  }

  return (
    <ListContainer>
      <ListTitle>Archived Lists</ListTitle>
      {loading ? (
        <div className="flex justify-center">
          <Spinner />
        </div>
      ) : lists.length === 0 ? (
        <span className="text-sm text-gray-500">
          <i>No archived lists</i>
        </span>
      ) : (
        lists.map((list) => (
          <ListItemContainer key={list.id}>
            <span className="text-sm">{list.title || "(Unnamed List)"}</span>
            <Button
              variant="link"
              className="text-sm py-0 px-0"
              onclick={() => handleSendToBoard(list)}
            >
              Restore
            </Button>
          </ListItemContainer>
        ))
      )}
    </ListContainer>
  )
}

function ListContainer({ children }: ElementProps<"div">) {
  return <div className="p-3 bg-black/15">{children}</div>
}

function ListTitle({ children }: ElementProps<"div">) {
  return (
    <h4 className="text-sm mb-2 pb-1 border-b border-white/10 text-gray-300">
      {children}
    </h4>
  )
}

function ListItemContainer({ children, className }: ElementProps<"div">) {
  return (
    <div
      className={`flex gap-4 p-2 justify-between bg-white/5 border-b border-black/30 last:border-b-0 ${
        className || ""
      }`}
    >
      {children}
    </div>
  )
}
