import { Board } from "$/db"
import { useLiveCollection } from "$/hooks/useLiveCollection"
import { createContext, useContext } from "kaioken"

type BoardsCtx = {
  boards: Board[]
}

const BoardsContext = createContext<BoardsCtx>({
  boards: [],
})

export const useBoards = () => useContext(BoardsContext)

export const BoardsProvider: Kaioken.FC = ({ children }) => {
  const { data, loading, error } = useLiveCollection("boards")
  if (loading) return null
  if (error) return <p>{error.message}</p>
  return (
    <BoardsContext.Provider value={{ boards: data }}>
      {children}
    </BoardsContext.Provider>
  )
}
