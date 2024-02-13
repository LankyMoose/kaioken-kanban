import { Transition } from "kaioken"
import { useGlobal } from "../state/global"
import { Drawer } from "./dialog/Drawer"
import { BoardEditor } from "./BoardEditor"

export function MainDrawer() {
  const { boardEditorOpen, setBoardEditorOpen } = useGlobal()
  return (
    <Transition
      in={boardEditorOpen}
      timings={[40, 150, 150, 150]}
      element={(state) =>
        state === "exited" ? null : (
          <Drawer state={state} close={() => setBoardEditorOpen(false)}>
            <BoardEditor />
          </Drawer>
        )
      }
    />
  )
}
