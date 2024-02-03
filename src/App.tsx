import { useEffect, useRef } from "kaioken"
import { BoardProvider } from "./state/BoardProvider"
import { GlobalProvider } from "./state/GlobalProvider"
import { Board } from "./components/Board"
import { useGlobal } from "./state/global"
import { MoreIcon } from "./components/icons/MoreIcon"
import { BoardSelector } from "./components/BoardSelector"

export function App() {
  return (
    <GlobalProvider>
      <BoardProvider>
        <Main />
      </BoardProvider>
    </GlobalProvider>
  )
}

function Main() {
  const rootElementRef = useRef<HTMLDivElement>(null)
  const { setRootElement } = useGlobal()

  useEffect(() => {
    if (!rootElementRef.current) return
    setRootElement(rootElementRef.current)
  }, [rootElementRef.current])

  return (
    <main ref={rootElementRef}>
      <Nav />
      <Board />
    </main>
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
