import { useEffect, useRef } from "kaioken"
import { BoardProvider } from "./state/BoardProvider"
import { GlobalProvider } from "./state/GlobalProvider"
import { Board } from "./components/Board"
import { useGlobal } from "./state/global"
import { MoreIcon } from "./components/icons/MoreIcon"
import { BoardSelector } from "./components/BoardSelector"
import { LogoIcon } from "./components/icons/LogoIcon"
import { GithubIcon } from "./components/icons/GithubIcon"

export function App() {
  return (
    <GlobalProvider>
      <BoardProvider>
        <Main />
        <Footer />
      </BoardProvider>
    </GlobalProvider>
  )
}

function Footer() {
  return (
    <footer className="fixed bottom-0 w-full px-3 py-2">
      <div className="text-right">
        <a
          href="https://github.com/robby6strings/kaioken-kanban"
          target="_blank"
          style="color:crimson"
          className="inline-flex gap-1"
        >
          <GithubIcon />
        </a>
      </div>
    </footer>
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
  const { setBoardEditorOpen } = useGlobal()

  return (
    <nav className="p-4 flex justify-between">
      <div className="flex items-center gap-2">
        <button className="p-2">
          <LogoIcon />
        </button>
        <BoardSelector />
      </div>
      <button onclick={() => setBoardEditorOpen(true)} className="py-2 px-3">
        <MoreIcon />
      </button>
    </nav>
  )
}
