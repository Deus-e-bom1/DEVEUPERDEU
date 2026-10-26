import { createFileRoute } from "@tanstack/react-router";

/**
 * Temporary read/write health check for Preview only.
 * Does not create an order, a Pix charge, or an advertising event.
 * Keep Vercel Deployment Protection enabled.
 */
export const Route = createFileRoute("/api/health/redis")({
  server: {
    handlers: {
      GET: async () => {
        const responseHeaders = {
          "Cache-Control": "no-store",
          "X-Robots-Tag": "noindex, nofollow",
        };

        if (process.env.VERCEL_ENV !== "preview") {
          return Response.json({ error: "Not found" }, { status: 404, headers: responseHeaders });
        }

        try {
          const { redis } = await import("@/lib/order-store.server");
          const key = `deveu:preview-health:${crypto.randomUUID()}`;
          const marker = crypto.randomUUID();
          const wrote = await redis(["SET", key, marker, "EX", 60]);
          if (wrote !== "OK") throw new Error("Redis did not confirm the write");

          const readBack = await redis(["GET", key]);
          try {
            await redis(["DEL", key]);
          } catch (error) {
            console.warn("Redis health check: cleanup failed", error);
          }

          if (readBack !== marker) throw new Error("Redis read-back mismatch");
          return Response.json({ redis: "ok", read: true, write: true }, { headers: responseHeaders });
        } catch (error) {
          console.error("Redis preview health check failed", error);
          return Response.json({ redis: "error" }, { status: 503, headers: responseHeaders });
        }
      },
    },
  },
});
