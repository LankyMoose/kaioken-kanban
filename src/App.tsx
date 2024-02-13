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
      <Footer />
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
