import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    outDir: "build",
    sourcemap: true,
    manifest: "asset-manifest.json",
  },
  server: {
    watch: {
      ignored: [/.vscode-test\/*/, /build\/*/, /build-ext\/*/, /coverage\/*/],
    },
  },
});
