import { createFileRoute } from "@tanstack/react-router";
import { getSupabaseServerClient } from "../../../lib/supabase-server";

// Clean up visitor records and query logs older than 7 days
async function cleanupOldRecords(supabase: any) {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    
    // Delete expired query logs
    const { error: logError } = await supabase
      .from("query_logs")
      .delete()
      .lt("timestamp", sevenDaysAgo)
      .like("user_id", "v-%");
      
    if (logError) {
      console.error("[cleanup] Error deleting old query logs:", logError.message);
    }

    // Delete expired visitor users
    const { error: userError } = await supabase
      .from("users")
      .delete()
      .eq("company", "visitor")
      .lt("created_at", sevenDaysAgo);

    if (userError) {
      console.error("[cleanup] Error deleting old visitors:", userError.message);
    }
  } catch (err) {
    console.error("[cleanup] Exception during old records cleanup:", err);
  }
}

export const Route = createFileRoute("/api/public-chat/login")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const { email, name } = body;

          if (!name || !name.trim()) {
            return new Response(
              JSON.stringify({ error: "Your name is required." }),
              {
                status: 400,
                headers: { "Content-Type": "application/json" },
              }
            );
          }

          if (!email || !email.includes("@")) {
            return new Response(
              JSON.stringify({ error: "A valid email address is required." }),
              {
                status: 400,
                headers: { "Content-Type": "application/json" },
              }
            );
          }

          const supabase = getSupabaseServerClient();

          // 1. Run cleanup task first
          await cleanupOldRecords(supabase);

          const userId = `v-${email.toLowerCase().trim()}`;
          const formattedName = name.trim();
          
          // Generate 2-letter avatar initials (e.g. John Doe -> JD)
          const initials = formattedName
            .split(/\s+/)
            .map((word) => word[0])
            .join("")
            .substring(0, 2)
            .toUpperCase() || "VI";

          const visitorUser = {
            id: userId,
            name: formattedName,
            email: email.toLowerCase().trim(),
            role: "Employee", // fits check constraint (Employee, Manager, HR Officer, IT Administrator, Owner)
            avatar: initials,
            password: "Visitor@123",
            domain: "public",
            company: "visitor",
            created_at: new Date().toISOString(),
          };

          // 2. Save visitor to Supabase
          const { error: upsertError } = await supabase
            .from("users")
            .upsert(visitorUser);

          if (upsertError) {
            console.error("[public-chat/login] Upsert visitor failed:", upsertError.message);
            throw new Error(`Failed to save visitor profile: ${upsertError.message}`);
          }

          // 3. Retrieve non-expired query logs for this visitor
          const { data: logs, error: logsError } = await supabase
            .from("query_logs")
            .select("query_text, response_text, timestamp")
            .eq("user_id", userId)
            .order("timestamp", { ascending: true });

          if (logsError) {
            console.error("[public-chat/login] Fetching query logs failed:", logsError.message);
          }

          const messages = (logs || []).flatMap((log: any) => [
            { role: "user", text: log.query_text, timestamp: log.timestamp },
            { role: "assistant", text: log.response_text, timestamp: log.timestamp },
          ]);

          return new Response(
            JSON.stringify({
              userId,
              email: email.toLowerCase().trim(),
              name: formattedName,
              messages,
            }),
            {
              headers: { "Content-Type": "application/json" },
            }
          );
        } catch (error) {
          const errMsg = error instanceof Error ? error.message : String(error);
          console.error("Public chat login endpoint error:", errMsg);
          return new Response(
            JSON.stringify({
              error: "Login failed",
              message: errMsg,
            }),
            {
              status: 500,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
      },
    },
  },
});
