import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";
import { demoAssets } from './demo-assets';
export default defineConfig({
  plugins: [react(), tailwindcss(), demoAssets()],
  optimizeDeps: {
    // Scan the app entry, not HTML examples bundled with skills and demo assets.
    entries: ["index.html"],
  },
  resolve: {
    alias: {
      "@studio": fileURLToPath(new URL("./src/studio", import.meta.url)),
      "@engine": fileURLToPath(new URL("./src/engine", import.meta.url)),
      "@chat": fileURLToPath(new URL("./src/chat", import.meta.url)),
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (/node_modules\/(?:@lexical\/|lexical\/)/.test(id))
            return "lexical";
          if (/node_modules\/(?:react\/|react-dom\/|scheduler\/)/.test(id))
            return "react";
        },
      },
    },
  },
  server: { port: 5178, strictPort: true },
});
