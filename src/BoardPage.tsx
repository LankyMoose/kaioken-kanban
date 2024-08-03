import { useRef, useEffect, useRouter } from "kaioken"
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

  const board = boards.find((b) => b.uuid === params.boardId)!

  if (!boardsLoaded) {
    return null
  }

  return (
    <main ref={rootElementRef}>
      <Board board={board} />
    </main>
  )
}
