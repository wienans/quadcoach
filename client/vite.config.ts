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
          
          // Material-UI split into multiple chunks for better caching
          "mui-core": ["@mui/material"],
          "mui-icons": ["@mui/icons-material"],
          "mui-x": ["@mui/x-data-grid"],
          
          // Markdown editor and related dependencies
          markdown: [
            "react-markdown", 
            "remark-gfm",
            "@uiw/react-md-editor"
          ],
          
          // Fabric.js and canvas-related dependencies
          fabric: ["fabric", "fabricjs-react"],
          
          // Media player dependencies
          "media-player": [
            "react-player",
            "react-social-media-embed"
          ],
          
          // Redux and state management
          redux: [
            "@reduxjs/toolkit",
            "react-redux",
            "redux-logger"
          ],
          
          // Router
          router: ["react-router-dom"],
          
          // Form libraries
          forms: ["formik", "yup"],
          
          // Utility libraries
          utils: [
            "lodash",
            "chroma-js",
            "uuid",
            "axios",
            "jwt-decode"
          ],
          
          // Internationalization
          i18n: [
            "i18next",
            "react-i18next",
            "i18next-browser-languagedetector"
          ],
          
          // Color and animation libraries
          visual: [
            "@emotion/react",
            "@emotion/styled",
            "@react-spring/web",
            "react-color"
          ],
        },
      },
    },
  },
});
