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
          // Core React libraries
          react: ["react", "react-dom"],
          "mui-core": ["@mui/material", "@emotion/react", "@emotion/styled"],
          "mui-icons": ["@mui/icons-material"],
          "mui-x": ["@mui/x-data-grid"],
          markdown: ["react-markdown", "remark-gfm", "@uiw/react-md-editor"],
          fabric: ["fabric", "fabricjs-react"],
          "media-player": ["react-player", "react-social-media-embed"],
          redux: ["@reduxjs/toolkit", "react-redux", "redux-logger"],
          router: ["react-router-dom"],
          forms: ["formik", "yup"],
          utils: ["lodash", "chroma-js", "uuid", "axios", "jwt-decode"],
          i18n: [
            "i18next",
            "react-i18next",
            "i18next-browser-languagedetector",
          ],
        },
      },
    },
  },
});
