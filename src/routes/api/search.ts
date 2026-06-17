import { createFileRoute } from "@tanstack/react-router";
import { findRelevantChunks } from "../../server/db";

export const Route = createFileRoute("/api/search")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const { query } = body;

          if (!query) {
            return new Response(JSON.stringify({ error: "Missing query parameter." }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }

          const relevant = findRelevantChunks(query, 5);
          const results = relevant.map((r) => ({
            documentId: r.docId,
            documentName: r.docName,
            section: r.section,
            snippet: r.content,
          }));

          return new Response(JSON.stringify({ query, results }), {
            headers: { "Content-Type": "application/json" },
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          return new Response(
            JSON.stringify({ error: errorMessage || "Failed to process search query" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
