import { useRef, type TransitionState, useEffect } from "kaioken"
import { Backdrop } from "./Backdrop"

type DrawerProps = {
  state: TransitionState
  close: () => void
  children: JSX.Children
}

export function Drawer({ state, close, children }: DrawerProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const didPtrDownBackdrop = useRef(false)
  useEffect(() => {
    function handleKeyPress(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault()
        if (state === "exited") return
        close()
      }
    }
    window.addEventListener("keyup", handleKeyPress)
    return () => window.removeEventListener("keyup", handleKeyPress)
  }, [state])

  if (state == "exited") return null

  const opacity = state === "entered" ? "1" : "0"
  const translateX = state === "entered" ? 0 : 100

  return (
    <Backdrop
      ref={wrapperRef}
      onpointerdown={(e) =>
        e.target === wrapperRef.current && (didPtrDownBackdrop.current = true)
      }
      onpointerup={(e) =>
        e.target === wrapperRef.current &&
        didPtrDownBackdrop.current &&
        ((didPtrDownBackdrop.current = false), close())
      }
      style={{ opacity }}
    >
      <div
        className="drawer-content p-4"
        style={{ transform: `translateX(${translateX}%)` }}
      >
        {children}
      </div>
    </Backdrop>
  )
}
