import { useSignal } from "kaioken"
import { MoreIcon } from "../../icons/MoreIcon"
import { ActionMenu } from "../../molecules/ActionMenu/ActionMenu"
import { jsonExport, jsonImport } from "./utils"
import { useBoards } from "$/context/boardContext"

export function ImportExportMenu() {
  const menuOpen = useSignal(false)
  const { reloadBoards } = useBoards()
  return (
    <div className="relative">
      <ActionMenu
        open={menuOpen.value}
        close={() => (menuOpen.value = false)}
        items={[
          {
            text: "Export data",
            onclick: jsonExport,
          },
          {
            text: "Import data",
            onclick: () => {
              jsonImport(reloadBoards)
            },
          },
        ]}
        button={(ref) => (
          <button ref={ref} onclick={() => (menuOpen.value = !menuOpen.value)}>
            <MoreIcon width="1.5rem" />
          </button>
        )}
      />
    </div>
  )
}
