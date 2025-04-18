import { Portal, Route, Router } from "kaioken"
import { HomePage } from "./pages/HomePage/HomePage"
import { BoardsProvider } from "./context/boardContext"
import { BoardPage } from "./pages/BoardPage/BoardPage"
import { Toasts } from "./components/Toasts"

export function App() {
  return (
    <BoardsProvider>
      <Router transition>
        <Route path="/" element={<HomePage />} />
        <Route path="/boards/:boardId" fallthrough element={<BoardPage />} />

        <Route path="*" element={<p>Route not found.</p>} />
      </Router>
      <Portal container={() => document.getElementById("toast-root")!}>
        <Toasts />
      </Portal>
    </BoardsProvider>
  )
}
