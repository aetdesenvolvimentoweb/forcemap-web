import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  resolve: {
    alias: {
      daisyui: resolve("./node_modules/daisyui/index.js"),
    },
  },
  server: {
    port: 3000,
  },
});
