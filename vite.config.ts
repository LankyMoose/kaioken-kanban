import { defineConfig } from "vite"
import kaioken from "vite-plugin-kaioken"

export default defineConfig({
  resolve: {
    alias: {
      $: "/src",
    },
  },
  esbuild: {
    sourcemap: false,
  },
  plugins: [kaioken()],
})
