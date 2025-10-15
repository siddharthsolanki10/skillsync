import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true, // Listen on all addresses for Docker
    open: true,
    watch: {
      usePolling: true, // Enable polling for file changes in Docker
    },
  },
});
