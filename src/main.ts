import "./styles.css"
import { mount } from "kaioken"
import { App } from "./App"

document.addEventListener("touchstart", () => {
  document.body.setAttribute("inputMode", "touch")
})

const root = document.querySelector<HTMLDivElement>("#app")!
mount(App, { root, maxFrameMs: 16 })
