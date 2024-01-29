import { Transition } from "kaioken"
import "./ContextMenu.css"
import { Button } from "./atoms/Button"

type ContextMenuItem = {
  text: string
  onclick: (e: Event) => void
}

interface ContextMenuProps {
  items: ContextMenuItem[]
  open: boolean
}

export function ContextMenu({ open, items }: ContextMenuProps) {
  return (
    <Transition
      in={open}
      timings={[40, 150, 150, 150]}
      element={(state) => {
        if (state == "exited") return null
        const opacity = state === "entered" ? "1" : "0"
        const scale = state === "entered" ? 1 : 0.85
        const translateY = state === "entered" ? 0 : -25
        return (
          <div
            className="context-menu absolute"
            style={{
              opacity,
              transform: `translateY(${translateY}%) scale(${scale})`,
            }}
          >
            {items.map((item) => (
              <div className="context-menu-item flex">
                <Button
                  variant="primary"
                  className="text-xs font-normal text-nowrap px-5 py-2 flex-grow"
                  onclick={item.onclick}
                >
                  {item.text}
                </Button>
              </div>
            ))}
          </div>
        )
      }}
    />
  )
}
