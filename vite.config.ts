import preact from "@preact/preset-vite";
import basicSsl from "@vitejs/plugin-basic-ssl";
import tailwindcss from "tailwindcss";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [preact(), basicSsl()],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
});
