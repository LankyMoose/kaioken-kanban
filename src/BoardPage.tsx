import { useRef, useEffect, useRouter, Link } from "kaioken"
import { Board } from "./components/Board"
import { useGlobal } from "./state/global"

export function BoardPage() {
  const { boards, boardsLoaded } = useGlobal()
  const { params } = useRouter()
  const { setRootElement } = useGlobal()
  const rootElementRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!rootElementRef.current) return
    setRootElement(rootElementRef.current)
  }, [rootElementRef.current])

  if (!boardsLoaded) {
    return null
  }

  const board = boards.find((b) => b.uuid === params.boardId)
  if (!board) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p>Board not found</p>
        <br />
        <Link to="/" className="text-red-400 underline">
          Go back
        </Link>
      </div>
    )
  }

  debugger

  return (
    <main ref={rootElementRef}>
      <Board board={board} />
    </main>
  )
}
