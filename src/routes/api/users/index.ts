import { createFileRoute } from "@tanstack/react-router";
import { getCompanyUsers } from "../../../server/db";
import { supabase, isSupabaseConfigured } from "../../../lib/supabase";

export const Route = createFileRoute("/api/users/")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const company = url.searchParams.get("company") || "ekaba";

        if (isSupabaseConfigured) {
          try {
            const { data, error } = await supabase
              .from("users")
              .select("id, name, email, role, avatar")
              .eq("company", company.toLowerCase().trim());
            
            if (error) throw error;
            return new Response(JSON.stringify(data || []), {
              headers: { "Content-Type": "application/json" },
            });
          } catch (err) {
            console.error("Supabase user fetch failed, falling back:", err);
          }
        }

        return new Response(JSON.stringify(getCompanyUsers(company)), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
