import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Unique port for local_projects
    strictPort: true,
    host: true,
    cors: true,
    origin: "http://localhost:8000",
    proxy: {
      "/api": { target: "http://127.0.0.1:19119", changeOrigin: true },
    },
  },
  build: {
    outDir: "build",
    emptyOutDir: true,
    sourcemap: true,
  },
  base: "/clients/core-local-workspace/",
});
