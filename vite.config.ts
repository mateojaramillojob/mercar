import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => ({
  base: mode === "production" ? "/mercar/" : "/",
  server: {
    host: "::",
    port: 8081,
  },
  plugins: [
    react(),
    // La lista se abre desde un tag NFC en la cocina, muchas veces con el wifi
    // a medias. Precachear la app entera hace que abra al instante siempre.
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "apple-touch-icon.png"],
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico,woff2}"],
        navigateFallback: "index.html",
      },
      manifest: {
        name: "Mercar",
        short_name: "Mercar",
        lang: "es",
        description: "La lista del mercado, compartida.",
        start_url: "/mercar/",
        scope: "/mercar/",
        display: "standalone",
        orientation: "portrait",
        background_color: "#FBF7F0",
        theme_color: "#1F7A54",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
    }),
  ],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
}));
