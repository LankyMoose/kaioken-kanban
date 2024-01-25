import { useRef, type TransitionState } from "kaioken"
import { Backdrop } from "./Backdrop"

type ModalProps = {
  state: TransitionState
  close: () => void
  children?: JSX.Element[]
}

export function Modal({ state, close, children }: ModalProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  if (state == "exited") return null
  const opacity = state === "entered" ? "1" : "0"
  const scale = state === "entered" ? 1 : 0.85
  const translateY = state === "entered" ? -50 : -25
  return (
    <Backdrop
      ref={wrapperRef}
      onclick={(e) => e.target === wrapperRef.current && close()}
      style={{ opacity }}
    >
      <div
        className="modal-content"
        style={{
          transform: `translate(-50%, ${translateY}%) scale(${scale})`,
        }}
      >
        {children}
      </div>
    </Backdrop>
  )
}
