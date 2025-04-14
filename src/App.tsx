import { Route, Router } from "kaioken"
import { HomePage } from "./pages/HomePage/HomePage"
import { BoardsProvider } from "./context/boardContext"
import { BoardPage } from "./pages/BoardPage/BoardPage"

export function App() {
  return (
    <BoardsProvider>
      <Router transition>
        <Route path="/" element={<HomePage />} />
        <Route path="/boards/:boardId" fallthrough element={<BoardPage />} />

        <Route path="*" element={<p>Route not found.</p>} />
      </Router>
    </BoardsProvider>
  )
}
