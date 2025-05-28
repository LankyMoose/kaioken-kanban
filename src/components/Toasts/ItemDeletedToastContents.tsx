import { UndoIcon } from "$/components/icons/UndoIcon"
import { useToastItem } from "./Toasts"
import { useCallback, useSignal } from "kaioken"

type ItemDeletedToastContentsProps = {
  revert: () => Promise<void>
  isArchive?: boolean
}

export const ItemDeletedToastContents = ({
  revert,
  isArchive,
}: ItemDeletedToastContentsProps) => {
  const { cancel } = useToastItem()
  const cancelling = useSignal(false)
  const handleCancelClick = useCallback(() => {
    cancelling.value = true
    revert().then(cancel)
  }, [])

  return (
    <div className="flex gap-2 pl-4 pr-2 py-2 items-center">
      <p className="text-white text-shadow">
        Item {isArchive ? "archived" : "deleted"}
      </p>
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
