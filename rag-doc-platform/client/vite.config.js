import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const apiTarget =
  process.env.VITE_API_URL ||
  process.env.VITE_API_TARGET ||
  "http://localhost:5000";

const allowedHosts = [
  ".onrender.com",
  "localhost",
  "127.0.0.1",
];

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    allowedHosts,
    proxy: {
      "/api": {
        target: apiTarget,
        changeOrigin: true,
      },
    },
  },
  define: {
    "process.env.VITE_API_URL": JSON.stringify(apiTarget),
  },
});
