import { defineConfig } from "@solidjs/start/config";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  vite: {
    plugins: [
      tailwindcss(),
      VitePWA({
        registerType: "autoUpdate",
        manifest: {
          name: "Gianni Tracker",
          short_name: "Gianni",
          description: "",
          theme_color: "#1a1a1a",
          background_color: "#0d0d0d",
          display: "standalone",
          start_url: "/",
          lang: "it",
          scope: "/"
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
          cleanupOutdatedCaches: true
        }
      })
    ]
  }
});
