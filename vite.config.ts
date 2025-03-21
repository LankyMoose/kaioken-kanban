import { defineConfig } from "vite"
import kaioken from "vite-plugin-kaioken"

export default defineConfig({
  resolve: {
    alias: {
      $: "/src",
    },
  },
  plugins: [kaioken()],
})
