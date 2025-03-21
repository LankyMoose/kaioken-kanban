import { useSignal } from "kaioken"
import { MoreIcon } from "../../atoms/icons/MoreIcon"
import { ActionMenu } from "../../molecules/ActionMenu/ActionMenu"
import { jsonExport, jsonImport } from "./utils"

export function ImportExportMenu() {
  const menuOpen = useSignal(false)
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
            onclick: jsonImport,
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
