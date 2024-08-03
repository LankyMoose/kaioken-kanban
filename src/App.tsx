import { Route, Router } from "kaioken"
import { GlobalProvider } from "./state/GlobalProvider"
import { BoardPage } from "./BoardPage"
import { HomePage } from "./HomePage"

export function App() {
  return (
    <GlobalProvider>
      <Router>
        <Route path="/" element={<HomePage />} />
        <Route path="/boards/:boardId" element={<BoardPage />} />
      </Router>
    </GlobalProvider>
  )
}
