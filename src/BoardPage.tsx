import { useRef, useEffect } from "kaioken"
import { Board } from "./components/Board"
import { BoardProvider } from "./state/BoardProvider"
import { useGlobal } from "./state/global"

export function BoardPage({ params }: { params: Record<string, any> }) {
  const rootElementRef = useRef<HTMLDivElement>(null)
  const { setRootElement } = useGlobal()

  useEffect(() => {
    if (!rootElementRef.current) return
    setRootElement(rootElementRef.current)
  }, [rootElementRef.current])

  const { boardId } = params
  return (
    <BoardProvider>
      <main ref={rootElementRef}>
        <Board boardId={boardId} />
      </main>
    </BoardProvider>
  )
}
