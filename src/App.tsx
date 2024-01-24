import { useContext } from "kaioken"
import { BoardProvider } from "./state/BoardProvider"
import { GlobalProvider } from "./state/GlobalProvider"
import { Board } from "./components/Board"
import { BoardContext } from "./state/board"
import { useGlobal } from "./state/global"

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
  const board = useContext(BoardContext)
  return (
    <nav className="p-8 ">
      <h1>{board.title}</h1>
    </nav>
  )
}

function Main() {
  const { updateMousePos, clickedItem } = useGlobal()

  function handleMouseMove(e: MouseEvent) {
    if (!clickedItem) return
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
