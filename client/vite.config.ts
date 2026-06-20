import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      "/api": "http://quadcoach-backend:3001",
    },
  },
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;

          if (id.includes("react-markdown") || id.includes("remark-gfm")) {
            return "markdown";
          }

          if (id.includes("/react/") || id.includes("/react-dom/")) {
            return "react";
          }

          if (
            id.includes("@mui/material") ||
            id.includes("@mui/icons-material")
          ) {
            return "mui";
          }
        },
      },
    },
  },
});
