import { db } from "$/db"
import { useRouter, useAsync, navigate, Portal } from "kaioken"

export function ItemViewOverlay() {
  const { params } = useRouter()
  const item = useAsync(
    () => db.collections.items.find(params.itemId),
    [params.itemId]
  )

  const closeOverlay = () => {
    navigate("/boards/" + params.boardId)
  }

  return (
    <Portal container={() => document.getElementById("portal-root")!}>
      <div
        onclick={closeOverlay}
        className={[
          "fixed left-0 right-0 bottom-0 top-0",
          "flex flex-col justify-end items-end",
          "bg-black/50",
        ]}
      >
        <div
          onclick={(e) => e.stopPropagation()}
          className={[
            "flex flex-col gap-2 p-4",
            "max-w-screen-sm w-full max-h-screen overflow-y-auto",
            "bg-neutral-600",
          ]}
        >
          {item.loading ? (
            <div>Loading...</div>
          ) : item.error ? (
            <div>{item.error.message}</div>
          ) : !item.data ? (
            <div>Item not found</div>
          ) : (
            <>
              <div>{item.data.title}</div>
              <div>{item.data.content}</div>
            </>
          )}
        </div>
      </div>
    </Portal>
  )
}
