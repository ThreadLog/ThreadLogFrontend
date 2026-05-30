import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { nitro } from "nitro/vite";

const RAILWAY_API = "https://threadlogbackend-production.up.railway.app";

export default defineConfig({
  cloudflare: false,
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    plugins: [
      nitro({
        preset: "vercel",
        routeRules: {
          "/api/**": { proxy: `${RAILWAY_API}/api/**` },
        },
      }),
    ],
  },
});
