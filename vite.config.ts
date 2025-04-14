import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import eslint from "vite-plugin-eslint";
import compression from "vite-plugin-compression";
import legacy from "@vitejs/plugin-legacy";
import dotenv from "dotenv";
dotenv.config();
export default defineConfig(({ mode }) => ({
  // Server Configuration
  server: {
    host: process.env.VITE_HOST || "0.0.0.0", // Use environment variables for host
    port: parseInt(process.env.VITE_PORT || "3000", 10), // Use environment variables for port
    https: process.env.VITE_HTTPS === "true" ? {
      key: process.env.VITE_SSL_KEY_PATH,
      cert: process.env.VITE_SSL_CERT_PATH,
    } : false,
    strictPort: true, // Ensure the port is strictly used
    open: true, // Open browser on server start
    cors: true, // Enable CORS for better compatibility
  },

  // Plugins
  plugins: [
    react(), // React plugin for SWC
    eslint({ // ESLint plugin for development
      cache: false,
      include: ["src/**/*.ts", "src/**/*.tsx"],
      exclude: ["node_modules", "dist"],
    }),
    compression({ // Compression plugin for gzipping assets
      algorithm: "gzip",
    }),
    legacy({ // Legacy support for older browsers
      targets: ["defaults", "not IE 11"],
    }),
  ],

  // Aliases
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // Base alias for src
      "@components": path.resolve(__dirname, "./src/components"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@assets": path.resolve(__dirname, "./src/assets"),
    },
  },

  // Build Configuration
  build: {
    target: "esnext", // Target modern JavaScript
    outDir: "dist", // Output directory
    assetsDir: "assets", // Directory for compiled assets
    minify: mode === "production", // Minify for production
    sourcemap: mode === "development", // Enable source maps in development
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return id.toString().split("node_modules/")[1].split("/")[0].toString();
          }
        },
      },
    },
  },

  // Environment Variables
  define: {
    "process.env": {
      NODE_ENV: JSON.stringify(mode),
      API_URL: JSON.stringify(process.env.VITE_API_URL),
    },
  },

  // Security Headers Middleware (Example)
  serverMiddleware: [
    (req, res, next) => {
      res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self';");
      res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("X-Frame-Options", "DENY");
      next();
    },
  ],
}));
