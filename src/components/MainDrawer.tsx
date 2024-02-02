import { Transition, useModel } from "kaioken"
import { useGlobal } from "../state/global"
import { Drawer } from "./dialog/Drawer"
import { DialogHeader } from "./dialog/DialogHeader"
import { useBoard } from "../state/board"
import { Input } from "./atoms/Input"
import { Button } from "./atoms/Button"

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

  function handleSubmit() {
    updateSelectedBoard({ ...board, title })
  }

  return (
    <>
      <DialogHeader>asdasd</DialogHeader>
      <div className="flex gap-2">
        <Input
          className="bg-opacity-5 bg-white w-full border-0"
          ref={titleRef}
        />
        <Button variant="primary" onclick={handleSubmit}>
          Save
        </Button>
      </div>
    </>
  )
}

// open
//    view:
//      edit board
//      archived lists
//      archived items
