import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

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
        "/ministry": {
          target: backendUrl,
          changeOrigin: true,
        },
        "/center-onboarding": {
          target: backendUrl,
          changeOrigin: true,
        },
        // Committee-member, Director-of-Operations, and shared-comment API routes all live
        // under this one backend-only prefix — deliberately not "/committee" or
        // "/director-operations" directly, since those are ALSO frontend page routes
        // (/committee/history, /director-operations/applications, ...) and a prefix match
        // there would swallow the page loads themselves. Same reasoning as
        // "/apply-center" vs "/center-onboarding" below.
        "/internal": {
          target: backendUrl,
          changeOrigin: true,
        },
      },
    },
    plugins: [react()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
