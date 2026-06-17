import { createFileRoute } from "@tanstack/react-router";
import { queryLogs } from "../../server/db";

export const Route = createFileRoute("/api/feedback")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const { queryId, rating, comments, userId } = body;

          if (!queryId || !rating) {
            return new Response(JSON.stringify({ error: "Missing queryId or rating." }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }

          const log = queryLogs.find((q) => q.id === queryId);
          if (log) {
            log.feedback = { rating, comments };
          }

          return new Response(
            JSON.stringify({ success: true, message: "Feedback submitted successfully." }),
            { headers: { "Content-Type": "application/json" } },
          );
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          return new Response(
            JSON.stringify({ error: errorMessage || "Failed to process feedback" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
