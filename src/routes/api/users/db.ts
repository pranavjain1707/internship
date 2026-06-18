import { createFileRoute } from "@tanstack/react-router";
import { getCompanyUsersDb } from "../../../server/db";
import { supabase, isSupabaseConfigured } from "../../../lib/supabase";

export const Route = createFileRoute("/api/users/db")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const company = url.searchParams.get("company") || "ekaba";

        if (isSupabaseConfigured) {
          try {
            const { data, error } = await supabase
              .from("users")
              .select("name, domain, password, role, email")
              .eq("company", company.toLowerCase().trim());
            
            if (error) throw error;

            // If Supabase returned rows, build and return the credentials map
            if (data && data.length > 0) {
              const credentialsDb: Record<string, any> = {};
              for (const u of data) {
                credentialsDb[u.name.toLowerCase().trim()] = {
                  name: u.name,
                  domain: u.domain,
                  password: u.password,
                  role: u.role,
                  email: u.email,
                };
              }
              return new Response(JSON.stringify(credentialsDb), {
                headers: { "Content-Type": "application/json" },
              });
            }
            // data is empty array — RLS blocking SELECT, fall through to local DB
            console.warn("Supabase returned 0 users (possible RLS policy block), using local DB fallback.");
          } catch (err) {
            console.error("Supabase credentials fetch failed, falling back:", err);
          }
        }

        return new Response(JSON.stringify(getCompanyUsersDb(company)), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
