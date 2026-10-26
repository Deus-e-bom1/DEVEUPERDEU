import { createFileRoute } from "@tanstack/react-router";

// Never trust the webhook payload: re-fetch and verify the transaction at Skale's API.
export const Route = createFileRoute("/api/webhooks/skale")({
  server: { handlers: {
    POST: async ({ request }) => {
      try {
        if (Number(request.headers.get("content-length") ?? 0) > 32_768)
          return Response.json({ error: "payload too large" }, { status: 413 });
        const payload: unknown = await request.json();
        if (!payload || typeof payload !== "object" || !("id" in payload))
          return Response.json({ error: "invalid payload" }, { status: 400 });
        const txId = (payload as Record<string, unknown>).id;
        if (typeof txId !== "string" || !/^[\w-]{1,100}$/.test(txId))
          return Response.json({ error: "invalid ID" }, { status: 400 });
        const { processSkalePayment } = await import("@/lib/purchase-tracking.server");
        const result = await processSkalePayment(txId);
        // status is verified with Skale itself. A retry job handles temporary downstream failures.
        return Response.json({ ok: true, status: result.status, reported: result.processed });
      } catch (error) {
        console.error("Skale webhook error", error);
        return Response.json({ error: "temporary failure" }, { status: 503 });
      }
    },
  } },
});
