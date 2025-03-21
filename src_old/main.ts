import "./styles.css"
import { mount } from "kaioken"
import { App } from "./App"
import { useContextMenu } from "./state/contextMenu"

document.addEventListener("touchstart", () => {
  document.body.setAttribute("inputMode", "touch")
})

const root = document.querySelector<HTMLDivElement>("#app")!
mount(App, { root, maxFrameMs: 16 })

document.body.addEventListener("contextmenu", (e) => {
  if (useContextMenu.getState().rightClickHandled) {
    e.preventDefault()
    useContextMenu.setState((prev) => ({ ...prev, rightClickHandled: false }))
  }
  if ("custom-click" in e) {
    e.preventDefault()
  }
})
