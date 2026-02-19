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
          cleanupOutdatedCaches: true,
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/([a-d])\.basemaps\.cartocdn\.com\/.*/,
              handler: "CacheFirst",
              options: {
                cacheName: "carto-tiles",
                expiration: { maxEntries: 400, maxAgeSeconds: 30 * 24 * 60 * 60 },
                cacheableResponse: { statuses: [0, 200] }
              }
            }
          ]
        }
      })
    ]
  }
});
