import { UndoIcon } from "$/components/icons/UndoIcon"
import { useToastItem } from "$/components/Toasts"
import { Item } from "$/db"
import { useCallback, useSignal } from "kaioken"
import { createItemAndReorder } from "./utils"

type ItemDeletedToastContentsProps = {
  items: Kaioken.MutableRefObject<Item[]>
  item: Item
}

export const ItemDeletedToastContents = ({
  items,
  item,
}: ItemDeletedToastContentsProps) => {
  const { cancel } = useToastItem()
  const cancelling = useSignal(false)
  const handleCancelClick = useCallback(async () => {
    cancelling.value = true
    await createItemAndReorder(items.current, item)
    cancel()
  }, [])

  return (
    <div className="flex gap-2 pl-4 pr-2 py-2 items-center">
      <p className="text-white text-shadow">Item deleted</p>
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
