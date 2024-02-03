import { Portal } from "kaioken"
import { BoardProvider } from "./state/BoardProvider"
import { GlobalProvider } from "./state/GlobalProvider"
import { Board } from "./components/Board"
import { useGlobal } from "./state/global"
import { MoreIcon } from "./components/icons/MoreIcon"
import { ListItemClone } from "./components/ListItemClone"
import { ListClone } from "./components/ListClone"
import { ItemEditorModal } from "./components/ItemEditor"
import { ListEditorModal } from "./components/ListEditor"
import { MainDrawer } from "./components/MainDrawer"
import { BoardSelector } from "./components/BoardSelector"

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
  const { setMainDrawerOpen } = useGlobal()

  return (
    <nav className="p-4 flex justify-between">
      <BoardSelector />

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
