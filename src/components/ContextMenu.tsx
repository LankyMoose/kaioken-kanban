import { Transition, useEffect, useRef } from "kaioken"
import { useContextMenu } from "../state/contextMenu"
import "./ContextMenu.css"

export function ContextMenu() {
  const menuRef = useRef<HTMLDivElement>(null)
  const {
    value: { open, click },
    setOpen,
  } = useContextMenu()

  useEffect(() => {
    document.body.addEventListener("pointerdown", handleClickOutside)
    document.body.addEventListener("keydown", handleKeydown)
    return () => {
      document.body.removeEventListener("pointerdown", handleClickOutside)
      document.body.removeEventListener("keydown", handleKeydown)
    }
  }, [])

  if (!open) return null

  function handleClickOutside(e: PointerEvent) {
    if (!menuRef.current || !e.target || !(e.target instanceof Element)) return
    if (menuRef.current.contains(e.target)) return
    if (useContextMenu.getState().rightClickHandled) return
    setOpen(false)
  }
  function handleKeydown(e: KeyboardEvent) {
    if (e.key !== "Escape") return
    setOpen(false)
  }

  return (
    <Transition
      timings={[30, 150, 150, 150]}
      in={open}
      element={(state) => {
        if (state === "exited") return null
        const opacity = String(state === "entered" ? 1 : 0)
        return (
          <div
            ref={menuRef}
            id="context-menu"
            style={{
              transform: `translate(${click.x}px, ${click.y}px)`,
              transition: "opacity .15s",
              opacity,
            }}
          >
            Context Menu!
          </div>
        )
      }}
    />
  )
}
