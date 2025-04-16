import { signal } from "kaioken"

const prefersDark = window.matchMedia("(prefers-color-scheme: dark)")
export const preferredTheme = signal<"dark" | "light">(
  prefersDark.matches ? "dark" : "light"
)

prefersDark.addEventListener(
  "change",
  () => (preferredTheme.value = prefersDark.matches ? "dark" : "light")
)
