import { ChevronLeftIcon } from "$/components/icons/ChevronLeftIcon"
import { Board, db } from "$/db"
import { Link, Portal, useAsync, useEffect, useRouter } from "kaioken"
import { itemDragState } from "./state"
import { boardElementsMap } from "./state"
import { BoardLists } from "./BoardLists"
import { DraggedItemDisplay } from "./DraggedItemDisplay"
import { ItemEditorModal } from "./ItemEditor"

export function BoardPage() {
  const { params } = useRouter()
  const board = useAsync(async () => {
    const res = await db.collections.boards.find(params.boardId)
    if (!res) throw new Error("board not found")
    return res
  }, [params.boardId])

  useEffect(() => {
    console.log("boardElementsMap", boardElementsMap)
    const onBoardChanged = (changedBoard: Board) => {
      if (changedBoard.id !== params.boardId) return
      for (const key in boardElementsMap) {
        delete boardElementsMap[key]
      }
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
    <>
      <div className="flex flex-col min-h-screen">
        <header
          className={[
            "bg-[#eee]",
            "dark:bg-white/5",
            "flex gap-2 justify-between items-center h-16 px-4 sm:px-8",
          ]}
        >
          <div className="flex gap-2 items-center">
            <Link to="/" children={<ChevronLeftIcon />} />
            <h1 className="text-lg font-bold flex gap-2 text-center">
              {board.data.title || "(Unnamed board)"}
            </h1>
          </div>
        </header>
        <div
          className={[
            "grow flex gap-2 items-start justify-start p-2 overflow-auto",
          ]}
          style={`--dragged-item-height: ${
            itemDragState.value?.element?.offsetHeight ?? 0
          }px;`}
        >
          <BoardLists boardId={params.boardId} />
        </div>
      </div>
      <Portal container={() => document.getElementById("portal-root")!}>
        <DraggedItemDisplay />
        <ItemEditorModal />
      </Portal>
    </>
  )
}
