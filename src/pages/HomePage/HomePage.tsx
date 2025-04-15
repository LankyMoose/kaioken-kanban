import { navigate, useCallback, useSignal } from "kaioken"
import { Board, db } from "$/db"
import { LogoIcon } from "$/components/icons/LogoIcon"
import { useBoards } from "$/context/boardContext"
import { ImportExportMenu } from "$/components/organisms/ImportExportMenu/ImportExportMenu"
import { Button } from "$/components/atoms/Button/Button"
import { Card } from "$/components/molecules/Card/Card"
import { CardHeader } from "$/components/atoms/Card/CardHeader"
import { ActionMenu } from "$/components/molecules/ActionMenu/ActionMenu"
import { MoreIcon } from "$/components/icons/MoreIcon"

export function HomePage() {
  return (
    <>
      <header className="flex gap-2 justify-between items-center h-16 px-4 sm:px-8">
        <h1 className="text-4xl flex gap-2 items-end ">
          <LogoIcon size={36} />
          <span>Kaioban</span>
        </h1>
        <ImportExportMenu />
      </header>
      <main className="flex flex-col grow">
        <BoardsList />
      </main>
    </>
  )
}

function BoardsList() {
  const { boards } = useBoards()

  const createBoard = useCallback(() => {
    db.transaction(async (ctx) => {
      const board = await ctx.boards.create({})
      await ctx.lists.create({ boardId: board.id, order: 0 })
    })
  }, [])

  return (
    <div className="flex flex-col grow max-h-[calc(100dvh-64px)] min-h-full overflow-y-auto px-4 sm:px-8">
      <div className="flex grow gap-2 flex-wrap content-start">
        {boards.map((board) => (
          <BoardItem key={board.id} board={board} />
        ))}
      </div>
      <Button
        className="w-full sticky bottom-4"
        onclick={createBoard}
        variant="primary"
      >
        + Create board
      </Button>
    </div>
  )
}

function BoardItem({ board }: { board: Board }) {
  const menuOpen = useSignal(false)
  return (
    <Card
      className={"transition hover:scale-105 cursor-pointer grow"}
      onclick={(e) => !e.defaultPrevented && navigate(`/boards/${board.id}`)}
    >
      <CardHeader>
        <span className="font-bold text-lg">
          {board.title || "(Unnamed board)"}
        </span>
        <div className={"relative"}>
          <ActionMenu
            open={menuOpen.value}
            onActionClicked={(e) => e.preventDefault()}
            close={() => (menuOpen.value = false)}
            items={[
              {
                text: "Delete",
                onclick: async () => {
                  await db.collections.boards.delete(board.id)
                },
              },
              {
                text: "Archive",
                onclick: async () => {
                  await db.collections.boards.update({
                    ...board,
                    archived: true,
                  })
                },
              },
            ]}
            button={(ref) => (
              <button
                ref={ref}
                onclick={(e) => (
                  e.preventDefault(), (menuOpen.value = !menuOpen.value)
                )}
              >
                <MoreIcon />
              </button>
            )}
          />
        </div>
      </CardHeader>
    </Card>
  )
}
