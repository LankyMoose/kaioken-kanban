import "./HomePage.css"
import { Button } from "./components/atoms/Button"
import { LogoIcon } from "./components/icons/LogoIcon"
import { useGlobal } from "./state/global"
import { Board } from "./types"
import { Link } from "kaioken"

export function HomePage() {
  const { boards, addBoard } = useGlobal()
  const activeBoards = boards.filter((b) => !b.archived)
  // const archivedBoards = boards.filter((b) => b.archived)

  return (
    <main className="p-8">
      <h1 className="text-5xl flex gap-2 items-center mb-4">
        <LogoIcon size={36} />
        <span>Kaioban</span>
      </h1>
      <hr
        className="mt-2 mb-4 opacity-75"
        style="border-color:crimson;border-width:2px"
      />
      <section>
        <h2 className="text-2xl mb-2">Boards</h2>
        <div>
          {activeBoards.length > 0 && (
            <div className="p-4 mb-4 flex flex-wrap gap-4 bg-black bg-opacity-15 rounded">
              {activeBoards.map((board) => (
                <BoardCard board={board} />
              ))}
            </div>
          )}
          <Button
            onclick={addBoard}
            variant="primary"
            //className="bg-white bg-opacity-10 hover:bg-opacity-25 text-white"
          >
            Add a new board
          </Button>
        </div>
      </section>
    </main>
  )
}

function BoardCard({ board }: { board: Board }) {
  return (
    <Link to={`/boards/${board.uuid}`} className="board-item px-4 py-3 rounded">
      <span className="font-bold">{board.title || "(Unnamed board)"}</span>
    </Link>
  )
}
