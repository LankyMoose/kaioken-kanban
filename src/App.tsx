import { Portal, useContext } from "kaioken"
import { BoardProvider } from "./state/BoardProvider"
import { GlobalProvider } from "./state/GlobalProvider"
import { Board } from "./components/Board"
import { BoardContext, useBoard } from "./state/board"
import { GlobalDispatchCtx, useGlobal } from "./state/global"
import { Select } from "./components/atoms/Select"
import { MoreIcon } from "./components/icons/MoreIcon"
import { ListItemClone } from "./components/ListItemClone"
import { ListClone } from "./components/ListClone"
import { ItemEditorModal } from "./components/ItemEditor"
import { ListEditorModal } from "./components/ListEditor"
import { MainDrawer } from "./components/MainDrawer"
import { addBoard } from "./idb"

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

function Logo() {
  return <span className="honk-font cursor-default text-4xl">Kaioban</span>
}

function BoardSelector() {
  const { boards } = useGlobal()
  const dispatch = useContext(GlobalDispatchCtx)
  const board = useContext(BoardContext)
  const { selectBoard } = useBoard()
  const newBoardKey = "new-board"

  async function handleBoardSelectorChange(key: string) {
    if (key === board?.id.toString()) return
    if (key === newBoardKey) {
      const newBoard = await addBoard()
      dispatch({ type: "SET_BOARDS", payload: [...boards, newBoard] })
      return
    }
    const selectedBoard = boards.find((b) => b.id.toString() === key)
    if (!selectedBoard) throw new Error("no board, dafuuuq")
    selectBoard(selectedBoard)
  }

  return (
    <Select
      value={board?.id}
      options={[
        ...boards.map((board) => ({
          key: board.id,
          text: board.title || "(New Board)",
        })),
        {
          key: newBoardKey,
          text: "Add new board",
        },
      ]}
      onChange={handleBoardSelectorChange}
    />
  )
}

function Nav() {
  const { setMainDrawerOpen } = useGlobal()

  return (
    <nav className="p-4 flex justify-between">
      <BoardSelector />
      <Logo />
      <button onclick={() => setMainDrawerOpen(true)} className="py-2 px-3">
        <MoreIcon />
      </button>
    </nav>
  )
}

function Main() {
  const { updateMousePos, clickedItem, clickedList } = useGlobal()

  function handleMouseMove(e: MouseEvent) {
    updateMousePos({
      x: e.clientX,
      y: e.clientY,
    })
  }
  return (
    <main onmousemove={handleMouseMove}>
      <Board />
      <Portal container={document.getElementById("portal")!}>
        {clickedItem?.dragging && <ListItemClone item={clickedItem} />}
        {clickedList?.dragging && <ListClone list={clickedList} />}
        <ItemEditorModal />
        <ListEditorModal />
        <MainDrawer />
      </Portal>
    </main>
  )
}
