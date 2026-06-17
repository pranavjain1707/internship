import { createFileRoute } from "@tanstack/react-router";
import { getCompanyUsers } from "../../../server/db";

export const Route = createFileRoute("/api/users/")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const company = url.searchParams.get("company") || "ekaba";
        return new Response(JSON.stringify(getCompanyUsers(company)), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
