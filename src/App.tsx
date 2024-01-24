import { useContext } from "kaioken"
import { BoardContext, BoardProvider } from "./state/BoardProvider"
import { GlobalProvider, GlobalDispatchCtx } from "./state/GlobalProvider"
import { Board } from "./components/Board"

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
  const dispatch = useContext(GlobalDispatchCtx)

  function handleMouseMove(e: MouseEvent) {
    dispatch({
      type: "UPDATE_MOUSE_POS",
      payload: {
        x: e.clientX,
        y: e.clientY,
      },
    })
  }
  return (
    <main onmousemove={handleMouseMove}>
      <Board />
    </main>
  )
}
