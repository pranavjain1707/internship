import { createFileRoute } from "@tanstack/react-router";
import { isSupabaseConfigured, supabase } from "../../lib/supabase";

export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: async () => {
        let dbStatus = "not_configured";
        let dbError = null;
        let userCount = 0;

        if (isSupabaseConfigured) {
          try {
            const { data, error } = await supabase
              .from("users")
              .select("*", { count: "exact", head: true });
            
            if (error) {
              dbStatus = "error";
              dbError = error.message;
            } else {
              dbStatus = "connected";
              userCount = data ? data.length : 0;
            }
          } catch (e: any) {
            dbStatus = "exception";
            dbError = e.message || String(e);
          }
        }

        return new Response(
          JSON.stringify({
            status: "healthy",
            timestamp: new Date().toISOString(),
            supabase: {
              configured: isSupabaseConfigured,
              status: dbStatus,
              error: dbError,
              urlPrefix: typeof process !== "undefined" && process.env.VITE_SUPABASE_URL ? process.env.VITE_SUPABASE_URL.substring(0, 15) : "none",
              keyPrefix: typeof process !== "undefined" && process.env.VITE_SUPABASE_ANON_KEY ? process.env.VITE_SUPABASE_ANON_KEY.substring(0, 15) : "none",
            }
          }),
          {
            headers: { "Content-Type": "application/json" },
          },
        );
      },
    },
  },
});

