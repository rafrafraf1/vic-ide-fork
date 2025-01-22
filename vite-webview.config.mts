import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    outDir: "build-webview",
    sourcemap: true,
    manifest: "asset-manifest.json",
    rollupOptions: {
      input: {
        index: "./index-webview.html",
      },
    },
  },
});
