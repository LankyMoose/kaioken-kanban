import { Transition } from "kaioken"
import { Button } from "./atoms/Button"
import "./ActionMenu.css"

type ActionMenuItem = {
  text: string
  onclick: (e: Event) => void
}

interface ActionMenuProps {
  items: ActionMenuItem[]
  open: boolean
}

export function ActionMenu({ open, items }: ActionMenuProps) {
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
            className="action-menu absolute"
            style={{
              opacity,
              transform: `translateY(${translateY}%) scale(${scale})`,
            }}
          >
            {items.map((item) => (
              <div className="action-menu-item flex">
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
