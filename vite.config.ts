import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const backendUrl = env.VITE_BACKEND_URL || "http://localhost:3001";

  return {
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
      proxy: {
        "/auth": {
          target: backendUrl,
          changeOrigin: true,
        },
        "/super-admin": {
          target: backendUrl,
          changeOrigin: true,
        },
        "/candidates": {
          target: backendUrl,
          changeOrigin: true,
        },
        "/center-admin": {
          target: backendUrl,
          changeOrigin: true,
        },
      },
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
