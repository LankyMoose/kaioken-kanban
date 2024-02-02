import { Transition, useEffect, useModel, useState } from "kaioken"
import { useGlobal } from "../state/global"
import { Drawer } from "./dialog/Drawer"
import { DialogHeader } from "./dialog/DialogHeader"
import { useBoard } from "../state/board"
import { Input } from "./atoms/Input"
import { Button } from "./atoms/Button"
import { List } from "../types"
import { loadLists } from "../idb"
import { Spinner } from "./atoms/Spinner"

export function MainDrawer() {
  const { mainDrawerOpen, setMainDrawerOpen } = useGlobal()
  return (
    <Transition
      in={mainDrawerOpen}
      timings={[40, 150, 150, 150]}
      element={(state) => (
        <Drawer state={state} close={() => setMainDrawerOpen(false)}>
          <BoardEditor />
        </Drawer>
      )}
    />
  )
}

function BoardEditor() {
  const { board, updateSelectedBoard } = useBoard()
  const [titleRef, title] = useModel(board?.title || "(New Board)")
  const [archivedLists, setArchivedLists] = useState<List[]>([])
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    if (!board) return
    setLoading(true)
    ;(async () => {
      const res = await loadLists(board.id, true)
      setArchivedLists(res)
      setLoading(false)
    })()
  }, [])

  function handleSubmit() {
    updateSelectedBoard({ ...board, title })
  }

  return (
    <>
      <DialogHeader>Board Details</DialogHeader>
      <div className="flex gap-2">
        <Input
          className="bg-opacity-5 bg-white w-full border-0"
          ref={titleRef}
        />
        <Button variant="primary" onclick={handleSubmit}>
          Save
        </Button>
      </div>
      <div className="p-2">
        {loading ? (
          <Spinner />
        ) : archivedLists.length === 0 ? (
          <small className="text-gray-400">
            <i>No archived lists</i>
          </small>
        ) : (
          archivedLists.map((l) => <div>{l.title}</div>)
        )}
      </div>
    </>
  )
}

// open
//    view:
//      edit board
//      archived lists
//      archived items
