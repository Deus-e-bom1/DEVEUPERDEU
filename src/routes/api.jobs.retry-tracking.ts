import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/jobs/retry-tracking")({
  server: { handlers: {
    GET: async ({ request }) => {
      const secret = process.env.CRON_SECRET;
      if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`)
        return Response.json({ error: "unauthorized" }, { status: 401 });
      try {
        const { retryPendingOrders } = await import("@/lib/purchase-tracking.server");
        return Response.json(await retryPendingOrders(), { headers: { "Cache-Control": "no-store" } });
      } catch (e) { console.error("Retry job error", e); return Response.json({ error: "retry failed" }, { status: 503 }); }
    },
  } },
});
