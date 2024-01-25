import { useContext } from "kaioken"
import { BoardProvider } from "./state/BoardProvider"
import { GlobalProvider } from "./state/GlobalProvider"
import { Board } from "./components/Board"
import { BoardContext } from "./state/board"
import { useGlobal } from "./state/global"
import { Select } from "./components/Select"

export function App() {
  return (
    <GlobalProvider>
      <BoardProvider>
        <Nav />
        <Main />
      </BoardProvider>
    </GlobalProvider>
  )
}

function Nav() {
  const { boards } = useGlobal()
  const board = useContext(BoardContext)

  return (
    <nav className="p-4 ">
      <Select
        value={board?.id}
        options={boards.map((board) => ({
          key: board.id,
          text: board.title || "(New Board)",
        }))}
        onChange={console.log}
      />
    </nav>
  )
}

function Main() {
  const { updateMousePos } = useGlobal()

  function handleMouseMove(e: MouseEvent) {
    updateMousePos({
      x: e.clientX,
      y: e.clientY,
    })
  }
  return (
    <main onmousemove={handleMouseMove}>
      <Board />
    </main>
  )
}
