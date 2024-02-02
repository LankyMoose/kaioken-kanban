import { Transition, useModel } from "kaioken"
import { useGlobal } from "../state/global"
import { Drawer } from "./dialog/Drawer"
import { DialogHeader } from "./dialog/DialogHeader"
import { useBoard } from "../state/board"

export function MainDrawer() {
  const { mainDrawerOpen, setMainDrawerOpen } = useGlobal()
  return (
    <Transition
      in={mainDrawerOpen}
      timings={[40, 150, 150, 150]}
      element={(state) => (
        <Drawer state={state} close={() => setMainDrawerOpen(false)}></Drawer>
      )}
    />
  )
}
