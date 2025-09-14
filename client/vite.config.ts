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
    // Set a higher chunk size warning limit since we have properly chunked large dependencies
    chunkSizeWarningLimit: 1000, // 1MB limit for chunks
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("@mui/material") || id.includes("@emotion/"))
            return "mui-core";
          if (id.includes("react-router-dom")) return "router";
          if (id.includes("@reduxjs/toolkit") || id.includes("react-redux"))
            return "redux";
          if (id.includes("react-markdown") || id.includes("remark-gfm"))
            return "markdown";
          // fall back to default for others
        },
      },
    },
  },
});
