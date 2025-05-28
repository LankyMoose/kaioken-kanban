import { Route, Router } from "kaioken/router"
import { GlobalProvider } from "./state/GlobalProvider"
import { BoardPage } from "./BoardPage"
import { HomePage } from "./HomePage"
import { Portal } from "kaioken"

export function App() {
  return (
    <GlobalProvider>
      <Router>
        <Route path="/" element={<HomePage />} />
        <Route path="/boards/:boardId" element={<BoardPage />} />
      </Router>
      <Portal container={document.getElementById("toast-root")!}></Portal>
    </GlobalProvider>
  )
}
