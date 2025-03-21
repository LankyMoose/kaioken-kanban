import { Route, Router } from "kaioken"
import { HomePage } from "./pages/HomePage/HomePage"
import { BoardsProvider } from "./context/boardContext"

export function App() {
  return (
    <BoardsProvider>
      <Router>
        <Route path="/" element={<HomePage />} />

        <Route path="*" element={<p>Route not found.</p>} />
      </Router>
    </BoardsProvider>
  )
}
