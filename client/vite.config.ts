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
        manualChunks: {
          markdown: ["react-markdown", "remark-gfm", "@uiw/react-md-editor"],
          react: ["react", "react-dom"],
          mui: ["@mui/material", "@mui/icons-material"],
        },
      },
    },
  },
});
