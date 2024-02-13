import { useBoard } from "../state/board"
import { useGlobal } from "../state/global"
import { Select } from "./atoms/Select"

export function BoardSelector() {
  const { boards } = useGlobal()
  const { selectBoard, board, addBoard } = useBoard()
  const newBoardKey = "new-board"

  async function handleBoardSelectorChange(key: string) {
    if (key === board?.id.toString()) return
    if (key === newBoardKey) {
      return await addBoard()
    }
    const selectedBoard = boards.find((b) => b.id.toString() === key)
    if (!selectedBoard) throw new Error("no board, dafuuuq")
    selectBoard(selectedBoard)
  }
  return (
    <Select
      value={board?.id}
      id="board-selector"
      options={[
        ...boards.map((board) => ({
          key: board.id,
          text: board.title || "(Unnamed board)",
        })),
        {
          key: newBoardKey,
          text: "Add new board",
        },
      ]}
      onchange={handleBoardSelectorChange}
    />
  )
}
