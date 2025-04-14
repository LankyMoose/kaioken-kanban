import { Button } from "$/components/atoms/Button/Button"
import { Board, db, Item, List } from "$/db"
import { useAsync, useEffect, useRouter } from "kaioken"

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
      <header className="flex gap-2 justify-between items-center h-16 px-4 sm:px-8 bg-white/10">
        <h1 className="text-2xl flex gap-2 items-end">{board.data.title}</h1>
      </header>
      <div className="grow flex gap-2 items-start justify-start p-2 overflow-auto">
        <BoardLists boardId={params.boardId} />
      </div>
    </div>
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
    <div className="flex flex-col gap-2 p-2 min-w-64 basis-80 max-w-screen bg-white/10">
      <div>{list.title}</div>
      <ListItemsDisplay listId={list.id} />
    </div>
  )
}

type ListItemsDisplayProps = {
  listId: string
}
function ListItemsDisplay({ listId }: ListItemsDisplayProps) {
  const items = useAsync(async () => {
    const res = await db.collections.items.findMany((i) => i.listId === listId)
    return res.sort((a, b) => a.order - b.order)
  }, [listId])

  if (items.loading) {
    return <div>Loading...</div>
  }

  if (items.error) {
    return <div>{items.error.message}</div>
  }

  return (
    <div className="flex flex-col gap-2">
      <div className={"flex flex-col gap-1 p-1 bg-black/30"}>
        {items.data.map((item) => (
          <ListItemDisplay key={item.id} item={item} />
        ))}
      </div>
      <Button
        variant="primary"
        onclick={async () => {
          await db.collections.items.create({
            listId,
            order: items.data.length,
          })
          items.invalidate()
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
  return (
    <button className="p-2 bg-white/5 text-sm text-left">{item.title}</button>
  )
}
