import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/advertising-region")({
  server: { handlers: {
    GET: async ({ request }) => {
      const country = request.headers.get("x-vercel-ip-country") ?? request.headers.get("cf-ipcountry") ?? "XX";
      return Response.json({ country: /^[A-Z]{2}$/.test(country) ? country : "XX" }, {
        headers: { "Cache-Control": "no-store" },
      });
    },
  } },
});
