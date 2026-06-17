import { createFileRoute } from "@tanstack/react-router";
import { documents } from "../../server/db";

export const Route = createFileRoute("/api/documents")({
  server: {
    handlers: {
      GET: async () => {
        return new Response(JSON.stringify(documents), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
