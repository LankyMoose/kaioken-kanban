import { Transition } from "kaioken"
import { useGlobal } from "../state/global"
import { Drawer } from "./dialog/Drawer"
import { BoardEditor } from "./BoardEditor"

export function MainDrawer() {
  const { mainDrawerOpen, setMainDrawerOpen } = useGlobal()
  return (
    <Transition
      in={mainDrawerOpen}
      timings={[40, 150, 150, 150]}
      element={(state) =>
        state === "exited" ? null : (
          <Drawer state={state} close={() => setMainDrawerOpen(false)}>
            <BoardEditor />
          </Drawer>
        )
      }
    />
  )
}
