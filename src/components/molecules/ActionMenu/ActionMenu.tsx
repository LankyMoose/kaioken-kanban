import { Transition, useEffect, useRef } from "kaioken"
import { Button } from "$/components/atoms/Button/Button"
import "./ActionMenu.css"

type ActionMenuItem = {
  text: string
  onclick: (e: Event) => void
}

interface ActionMenuProps {
  items: ActionMenuItem[]
  open: boolean
  close: () => void
  onActionClicked?: (e: Event) => void
  button: (ref: Kaioken.RefObject<HTMLButtonElement>) => JSX.Children
}

export function ActionMenu({
  button,
  open,
  items,
  close,
  onActionClicked,
}: ActionMenuProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    window.addEventListener("click", handleClickOutside)
    window.addEventListener("keyup", handleEscapeKey)
    return () => {
      window.removeEventListener("click", handleClickOutside)
      window.removeEventListener("keyup", handleEscapeKey)
    }
  }, [])

  function handleClickOutside(e: MouseEvent) {
    if (!menuRef.current || !e.target || !buttonRef.current) return
    const tgt = e.target as Node
    if (!menuRef.current.contains(tgt) && !buttonRef.current.contains(tgt)) {
      close()
    }
  }

  function handleEscapeKey(e: KeyboardEvent) {
    if (e.key !== "Escape") return
    if (!document.activeElement || !menuRef.current) return
    if (!menuRef.current.contains(document.activeElement)) return
    close()
  }

  return (
    <>
      {button(buttonRef)}
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
              ref={menuRef}
              className="action-menu absolute"
              style={{
                opacity,
                transform: `translateY(${translateY}%) scale(${scale})`,
                pointerEvents,
              }}
            >
              {items.map((item) => (
                <div key={item.text} className="action-menu-item flex">
                  <Button
                    variant="primary"
                    className="text-xs font-normal text-nowrap px-5 py-2 grow"
                    onclick={(e) => {
                      onActionClicked?.(e)
                      item.onclick(e)
                    }}
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
