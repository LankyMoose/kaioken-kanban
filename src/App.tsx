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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
            <path d="M9 18c-4.51 2-5-2-7-2" />
          </svg>
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
