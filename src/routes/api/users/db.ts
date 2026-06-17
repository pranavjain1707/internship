import { createFileRoute } from "@tanstack/react-router";
import { getCompanyUsersDb } from "../../../server/db";

export const Route = createFileRoute("/api/users/db")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const company = url.searchParams.get("company") || "ekaba";
        return new Response(JSON.stringify(getCompanyUsersDb(company)), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
