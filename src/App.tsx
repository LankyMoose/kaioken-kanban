import { Route, Router } from "kaioken"
import { GlobalProvider } from "./state/GlobalProvider"
import { GithubIcon } from "./components/icons/GithubIcon"
import { BoardPage } from "./BoardPage"
import { HomePage } from "./HomePage"

export function App() {
  return (
    <GlobalProvider>
      <Router>
        <Route path="/" element={HomePage} />
        <Route path="/boards/:boardId" element={BoardPage} />
      </Router>
      <footer className="fixed bottom-0 right-0 p-3">
        <div className="text-right flex">
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
    </GlobalProvider>
  )
}
