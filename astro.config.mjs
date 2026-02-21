// @ts-check
import { defineConfig } from "astro/config";
import solidJs from "@astrojs/solid-js";
import db from "@astrojs/db";
import tailwindcss from "@tailwindcss/vite";
import AstroPWA from "@vite-pwa/astro";
import bun from "@wyattjoh/astro-bun-adapter";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: bun(),
  integrations: [
    solidJs(),
    db(),
    AstroPWA({
      registerType: "autoUpdate",
      manifest: {
        name: "G-Tracker",
        short_name: "GTrack",
        description: "",
        theme_color: "#1a1a1a",
        background_color: "#0d0d0d",
        display: "standalone",
        start_url: "/",
        lang: "it",
        scope: "/",
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
              expiration: {
                maxEntries: 400,
                maxAgeSeconds: 90 * 24 * 60 * 60 /* 90 days */,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  i18n: {
    defaultLocale: "it",
    locales: ["it", "en"],
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
