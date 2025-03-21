import "./HomePage.css"
import { Link, navigate, useSignal } from "kaioken"
import { Board, dbMethods } from "$/db"
import { LogoIcon } from "$/components/atoms/icons/LogoIcon"
import { useBoards } from "$/context/boardContext"
import { ImportExportMenu } from "$/components/organisms/ImportExportMenu/ImportExportMenu"
import { Button } from "$/components/atoms/Button/Button"
import { Card } from "$/components/molecules/Card/Card"
import { CardHeader } from "$/components/atoms/Card/CardHeader"
import { ActionMenu } from "$/components/molecules/ActionMenu/ActionMenu"
import { MoreIcon } from "$/components/atoms/icons/MoreIcon"

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

  return (
    <div className="flex flex-col grow max-h-[calc(100dvh-64px)] min-h-full overflow-y-auto px-4 sm:px-8">
      <div className="flex grow gap-2 flex-wrap content-start">
        {boards.map((board) => (
          <BoardItem key={board.id} board={board} />
        ))}
      </div>
      <Button
        className="w-full sticky bottom-4"
        onclick={dbMethods.boards.add}
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
      className={"transition hover:scale-105 cursor-pointer"}
      onclick={(e) => !e.defaultPrevented && navigate(`/board/${board.id}`)}
    >
      <CardHeader>
        <span className="board-item__title">
          {board.title || "(Unnamed board)"}
        </span>
        <div className={"board-item__actions"}>
          <ActionMenu
            open={menuOpen.value}
            onActionClicked={(e) => e.preventDefault()}
            close={() => (menuOpen.value = false)}
            items={[
              {
                text: "Delete",
                onclick: async () => {
                  await dbMethods.boards.delete(board)
                },
              },
              {
                text: "Archive",
                onclick: async () => {
                  await dbMethods.boards.archive(board)
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
