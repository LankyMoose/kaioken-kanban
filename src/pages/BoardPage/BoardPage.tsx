import { Button } from "$/components/atoms/Button/Button"
import { ChevronLeftIcon } from "$/components/atoms/icons/ChevronLeftIcon"
import { CircleXIcon } from "$/components/atoms/icons/CircleXIcon"
import { Board, db, Item, List } from "$/db"
import {
  Link,
  navigate,
  Portal,
  Route,
  Router,
  useAsync,
  useEffect,
  useRef,
  useRouter,
} from "kaioken"

export function BoardPage() {
  const { params } = useRouter()
  const board = useAsync(async () => {
    const res = await db.collections.boards.find(params.boardId)
    if (!res) throw new Error("board not found")
    return res
  }, [params.boardId])

  useEffect(() => {
    const onBoardChanged = (changedBoard: Board) => {
      if (changedBoard.id !== params.boardId) return
      board.invalidate()
    }
    db.collections.boards.addEventListener("write|delete", onBoardChanged)
    return () => {
      db.collections.boards.removeEventListener("write|delete", onBoardChanged)
    }
  }, [params.boardId])

  if (board.loading) {
    return <div>Loading...</div>
  }

  if (board.error) {
    return <div>{board.error.message}</div>
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex gap-2 justify-between items-center h-16 px-4 sm:px-8 bg-white/5">
        <div className="flex gap-2 items-center">
          <Link to="/" children={<ChevronLeftIcon />} />
          <h1 className="text-2xl flex gap-2 items-end">{board.data.title}</h1>
        </div>
      </header>
      <div className="grow flex gap-2 items-start justify-start p-2 overflow-auto">
        <BoardLists boardId={params.boardId} />
      </div>
      <Router transition>
        <Route path="/items/:itemId" element={<ItemViewOverlay />} />
      </Router>
    </div>
  )
}

function ItemViewOverlay() {
  const { params } = useRouter()
  const item = useAsync(
    () => db.collections.items.find(params.itemId),
    [params.itemId]
  )

  const closeOverlay = () => {
    navigate("/boards/" + params.boardId)
  }

  return (
    <Portal container={() => document.getElementById("portal-root")!}>
      <div
        onclick={closeOverlay}
        className={[
          "fixed left-0 right-0 bottom-0 top-0",
          "flex flex-col justify-end items-end",
          "bg-black/50",
        ]}
      >
        <div
          onclick={(e) => e.stopPropagation()}
          className={[
            "flex flex-col gap-2 p-4",
            "max-w-screen-sm w-full max-h-screen overflow-y-auto",
            "bg-neutral-600",
          ]}
        >
          {item.loading ? (
            <div>Loading...</div>
          ) : item.error ? (
            <div>{item.error.message}</div>
          ) : !item.data ? (
            <div>Item not found</div>
          ) : (
            <>
              <div>{item.data.title}</div>
              <div>{item.data.content}</div>
            </>
          )}
        </div>
      </div>
    </Portal>
  )
}

type BoardListsProps = {
  boardId: string
}
function BoardLists({ boardId }: BoardListsProps) {
  const lists = useAsync(async () => {
    const res = await db.collections.lists.findMany(
      (l) => l.boardId === boardId
    )
    return res.sort((a, b) => a.order - b.order)
  }, [boardId])

  useEffect(() => {
    const onListChanged = (list: List) => {
      if (list.boardId !== boardId) return
      lists.invalidate()
    }
    db.collections.lists.addEventListener("write|delete", onListChanged)
    return () => {
      db.collections.lists.removeEventListener("write|delete", onListChanged)
    }
  }, [boardId])

  if (lists.loading) {
    return <div>Loading...</div>
  }

  if (lists.error) {
    return <div>{lists.error.message}</div>
  }

  return (
    <>
      {lists.data.map((list) => (
        <ListDisplay key={list.id} list={list} />
      ))}
      <Button
        onclick={() =>
          db.collections.lists.create({ boardId, order: lists.data.length })
        }
        variant="primary"
        className="min-w-64 basis-80 max-w-screen"
      >
        + Add List
      </Button>
    </>
  )
}

type ListDisplayProps = {
  list: List
}
function ListDisplay({ list }: ListDisplayProps) {
  return (
    <div className="flex flex-col gap-2 p-2 min-w-64 basis-80 max-w-screen bg-white/5 rounded-lg">
      <div>{list.title}</div>
      <ListItemsDisplay listId={list.id} />
    </div>
  )
}

type ListItemsDisplayProps = {
  listId: string
}
function ListItemsDisplay({ listId }: ListItemsDisplayProps) {
  const items = useRef<Item[]>([])
  const loadState = useAsync(async () => {
    const res = await db.collections.items.findMany((i) => i.listId === listId)
    items.current = res.sort((a, b) => a.order - b.order)
  }, [listId])

  useEffect(() => {
    const handleDelete = async (item: Item) => {
      if (item.listId !== listId) return
      loadState.invalidate()
    }
    db.collections.items.addEventListener("delete", handleDelete)
    return () => {
      db.collections.items.removeEventListener("delete", handleDelete)
    }
  }, [])

  return (
    <div className="flex flex-col gap-2">
      <div className={"flex flex-col gap-1 p-1 bg-black/30"}>
        {items.current.length ? (
          items.current.map((item) => (
            <ListItemDisplay key={item.id} item={item} />
          ))
        ) : loadState.loading ? (
          <i className="text-neutral-300">Loading</i>
        ) : loadState.error ? (
          loadState.error.message
        ) : (
          <i className="text-neutral-300">No items</i>
        )}
      </div>
      <Button
        variant="primary"
        onclick={async () => {
          await db.collections.items.create({
            listId,
            order: items.current.length,
          })
          loadState.invalidate()
        }}
      >
        Add Item
      </Button>
    </div>
  )
}

type ListItemDisplayProps = {
  item: Item
}
function ListItemDisplay({ item }: ListItemDisplayProps) {
  const { params } = useRouter()
  return (
    <button
      onclick={(e) => {
        if (e.defaultPrevented) return
        navigate(`/boards/${params.boardId}/items/${item.id}`)
      }}
      className="p-2 bg-white/5 text-sm flex gap-2 items-start"
    >
      <p className="flex-grow text-left">{item.title}</p>
      <button
        className="hover:text-red-500"
        onclick={(e) => {
          e.preventDefault()
          db.collections.items.delete(item.id)
        }}
      >
        <CircleXIcon />
      </button>
    </button>
  )
}
