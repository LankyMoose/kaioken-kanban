import { JsonUtils } from "$/db"

function readFile(file: Blob): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.addEventListener("load", () => resolve(reader.result as string))
    reader.readAsText(file, "UTF-8")
  })
}

export async function jsonExport() {
  const data = await JsonUtils.export()
  const dateStr = new Date().toLocaleString().split(",")[0].replaceAll("/", "-")

  const file = new Blob([data], { type: "application/json" })
  const a = document.createElement("a")
  a.href = URL.createObjectURL(file)
  a.download = `kaioban-export-${dateStr}.json`
  a.click()
}

export function jsonImport() {
  const confirmOverwrite = confirm(
    "Continuing will overwrite your existing data. Are you sure you want to continue?"
  )
  if (!confirmOverwrite) return
  const input = Object.assign(document.createElement("input"), {
    type: "file",
    accept: ".json",
    onchange: async () => {
      const file = input.files?.[0]
      if (!file) return
      const data = await readFile(file)
      console.log("IMPORT", data)
      await JsonUtils.import(data)
    },
  })
  input.click()
}
