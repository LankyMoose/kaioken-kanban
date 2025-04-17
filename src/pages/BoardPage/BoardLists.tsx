import { Button } from "$/components/atoms/Button/Button"
import { db, List } from "$/db"
import { useAsync, useEffect } from "kaioken"
import { boardElementsMap } from "./state"
import { ListDisplay } from "./ListDisplay"

type BoardListsProps = {
  boardId: string
}
export function BoardLists({ boardId }: BoardListsProps) {
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
    const onListDeleted = (list: List) => {
      if (list.boardId !== boardId) return
      delete boardElementsMap[list.id]
    }
    db.collections.lists.addEventListener("write|delete", onListChanged)
    db.collections.lists.addEventListener("delete", onListDeleted)
    return () => {
      db.collections.lists.removeEventListener("write|delete", onListChanged)
      db.collections.lists.removeEventListener("delete", onListDeleted)
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
