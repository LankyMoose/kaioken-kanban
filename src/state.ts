import { PrevStateSignal } from "./prevStateSignal"

const prefersDark = window.matchMedia("(prefers-color-scheme: dark)")
export const preferredTheme = new PrevStateSignal<"dark" | "light">(
  prefersDark.matches ? "dark" : "light"
)

prefersDark.addEventListener(
  "change",
  () => (preferredTheme.value = prefersDark.matches ? "dark" : "light")
)

preferredTheme.subscribe((theme) => {
  console.log("theme changed", theme, preferredTheme.prev)
})
