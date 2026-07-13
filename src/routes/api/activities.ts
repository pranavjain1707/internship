import { createFileRoute } from "@tanstack/react-router";
import { getSupabaseServerClient } from "../../lib/supabase-server";

export const Route = createFileRoute("/api/activities")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const userId = url.searchParams.get("userId");
          if (!userId) {
            return new Response(JSON.stringify({ error: "Missing required parameter: userId." }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }

          const supabase = getSupabaseServerClient();

          // 1. Automatically delete records older than 2 days (48 hours)
          const cutoffDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
          try {
            await supabase.from("user_activities").delete().lt("created_at", cutoffDate);
          } catch (cleanupErr) {
            console.error("[activities] Cleanup failed:", cleanupErr);
          }

          // 2. Fetch the user's activities
          const { data, error } = await supabase
            .from("user_activities")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

          if (error) {
            if (error.message.includes("relation") && error.message.includes("does not exist")) {
              console.warn(
                "[activities] user_activities table not found in Supabase. Running fallback mockup.",
              );
              return new Response(JSON.stringify([]), {
                headers: { "Content-Type": "application/json" },
              });
            }
            throw error;
          }

          return new Response(JSON.stringify(data || []), {
            headers: { "Content-Type": "application/json" },
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error("[activities] GET failed:", errorMessage);
          return new Response(
            JSON.stringify({ error: errorMessage || "Failed to fetch activities" }),
            {
              status: 500,
              headers: { "Content-Type": "application/json" },
            },
          );
        }
      },
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const { userId, userName, action } = body;

          if (!userId || !action) {
            return new Response(
              JSON.stringify({ error: "Missing required fields: userId, action." }),
              {
                status: 400,
                headers: { "Content-Type": "application/json" },
              },
            );
          }

          const supabase = getSupabaseServerClient();

          // 1. Clean up old records on insertion too
          const cutoffDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
          try {
            await supabase.from("user_activities").delete().lt("created_at", cutoffDate);
          } catch (cleanupErr) {
            console.error("[activities] Cleanup failed:", cleanupErr);
          }

          // 2. Insert new activity log
          const { data, error } = await supabase.from("user_activities").insert({
            user_id: userId,
            user_name: userName || "Visitor",
            action,
            created_at: new Date().toISOString(),
          });

          if (error) {
            if (error.message.includes("relation") && error.message.includes("does not exist")) {
              console.warn(
                "[activities] user_activities table not found. Run SQL script to initialize.",
              );
              return new Response(
                JSON.stringify({ success: true, warning: "Database table not initialized." }),
                {
                  headers: { "Content-Type": "application/json" },
                },
              );
            }
            throw error;
          }

          return new Response(JSON.stringify({ success: true }), {
            headers: { "Content-Type": "application/json" },
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error("[activities] POST failed:", errorMessage);
          return new Response(JSON.stringify({ error: errorMessage || "Failed to log activity" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
