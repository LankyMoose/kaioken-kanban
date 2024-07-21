import { Transition, useEffect, useRef } from "kaioken"
import { Button } from "./atoms/Button"
import "./ActionMenu.css"

type ActionMenuItem = {
  text: string
  onclick: (e: Event) => void
}

interface ActionMenuProps {
  btn: Kaioken.Ref<HTMLButtonElement | null>
  items: ActionMenuItem[]
  open: boolean
  close: () => void
}

export function ActionMenu({ btn, open, items, close }: ActionMenuProps) {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    window.addEventListener("click", handleClickOutside)
    window.addEventListener("keyup", handleEscapeKey)
    return () => {
      window.removeEventListener("click", handleClickOutside)
      window.removeEventListener("keyup", handleEscapeKey)
    }
  }, [])

  function handleClickOutside(e: MouseEvent) {
    if (!ref.current || !e.target || !btn.current) return
    const tgt = e.target as Node
    if (!ref.current.contains(tgt) && !btn.current.contains(tgt)) {
      console.log("click outside", e.target, ref.current)
      close()
    }
  }

  function handleEscapeKey(e: KeyboardEvent) {
    if (e.key !== "Escape") return
    if (!document.activeElement || !ref.current) return
    if (!ref.current.contains(document.activeElement)) return
    close()
  }

  return (
    <>
      <Transition
        in={open}
        duration={{
          in: 40,
          out: 150,
        }}
        element={(state) => {
          if (state == "exited") return null
          const opacity = state === "entered" ? "1" : "0"
          const scale = state === "entered" ? 1 : 0.85
          const translateY = state === "entered" ? 0 : -25
          const pointerEvents = state === "entered" ? "unset" : "none"
          return (
            <div
              ref={ref}
              className="action-menu absolute"
              style={{
                opacity,
                transform: `translateY(${translateY}%) scale(${scale})`,
                pointerEvents,
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
    </>
  )
}
