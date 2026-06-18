import { createFileRoute } from "@tanstack/react-router";
import { getCompanyUsers, getCompanyUsersDb, persistDb } from "../../../server/db";
import { UserRole } from "../../../types";
import { supabase, isSupabaseConfigured } from "../../../lib/supabase";

export const Route = createFileRoute("/api/users/update-role")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const { userId, role, company } = body;
          const companyKey = company || "ekaba";
          const usersList = getCompanyUsers(companyKey);
          const usersCredentialsDb = getCompanyUsersDb(companyKey);

          if (isSupabaseConfigured) {
            try {
              const { data, error } = await supabase
                .from("users")
                .update({ role })
                .eq("id", userId)
                .eq("company", companyKey.toLowerCase().trim())
                .select()
                .single();

              if (error) throw error;
              return new Response(JSON.stringify(data), {
                headers: { "Content-Type": "application/json" },
              });
            } catch (err) {
              console.error("Supabase update role failed, falling back:", err);
            }
          }

          const user = usersList.find((u) => u.id === userId);
          if (!user) {
            return new Response(JSON.stringify({ error: "User not found." }), {
              status: 404,
              headers: { "Content-Type": "application/json" },
            });
          }

          user.role = role as UserRole;

          const userKey = user.name.toLowerCase().trim();
          if (usersCredentialsDb[userKey]) {
            usersCredentialsDb[userKey].role = role;
          }
          persistDb();


          return new Response(JSON.stringify(user), {
            headers: { "Content-Type": "application/json" },
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          return new Response(
            JSON.stringify({ error: errorMessage || "Failed to process role update" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
