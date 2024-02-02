import { useContext } from "kaioken"
import { addBoard } from "../idb"
import { BoardContext, useBoard } from "../state/board"
import { useGlobal, GlobalDispatchCtx } from "../state/global"
import { Select } from "./atoms/Select"

export function BoardSelector() {
  const { boards } = useGlobal()
  const dispatch = useContext(GlobalDispatchCtx)
  const board = useContext(BoardContext)
  const { selectBoard } = useBoard()
  const newBoardKey = "new-board"

  async function handleBoardSelectorChange(key: string) {
    if (key === board?.id.toString()) return
    if (key === newBoardKey) {
      const newBoard = await addBoard()
      dispatch({ type: "SET_BOARDS", payload: [...boards, newBoard] })
      return
    }
    const selectedBoard = boards.find((b) => b.id.toString() === key)
    if (!selectedBoard) throw new Error("no board, dafuuuq")
    selectBoard(selectedBoard)
  }

  return (
    <Select
      value={board?.id}
      options={[
        ...boards.map((board) => ({
          key: board.id,
          text: board.title || "(New Board)",
        })),
        {
          key: newBoardKey,
          text: "Add new board",
        },
      ]}
      onChange={handleBoardSelectorChange}
    />
  )
}
