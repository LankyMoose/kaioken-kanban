import { UndoIcon } from "$/components/icons/UndoIcon"
import { useToastItem } from "./Toasts"
import { useCallback, useSignal } from "kaioken"

type ToastContentsWithUndoProps = {
  children: JSX.Children
  undo: () => Promise<void>
}

export const ToastContentsWithUndo = ({
  children,
  undo,
}: ToastContentsWithUndoProps) => {
  const { cancel } = useToastItem()
  const cancelling = useSignal(false)
  const handleCancelClick = useCallback(() => {
    cancelling.value = true
    undo().then(cancel)
  }, [])

  return (
    <div className="flex gap-2 pl-4 pr-2 py-2 items-center">
      <p className="text-white text-shadow">{children}</p>
      <button
        disabled={cancelling}
        onclick={handleCancelClick}
        className="text-white bg-black/10 hover:bg-black/30 px-2 py-1 rounded"
      >
        <UndoIcon />
      </button>
    </div>
  )
}
