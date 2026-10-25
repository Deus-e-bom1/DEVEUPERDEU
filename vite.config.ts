import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  // Build para a Vercel (gera .vercel/output automaticamente)
  nitro: { preset: "vercel" },
});
