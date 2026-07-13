import { createFileRoute } from "@tanstack/react-router";
import { getSupabaseServerClient } from "../../../lib/supabase-server";
import { demoRequests } from "../../../server/db";

export const Route = createFileRoute("/api/demo-request/verify")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const { company, name, email } = body;

          if (!company || !name || !email) {
            return new Response(
              JSON.stringify({ error: "Missing required fields: company, name, email." }),
              {
                status: 400,
                headers: { "Content-Type": "application/json" },
              },
            );
          }

          const normalizedCompany = company.toLowerCase().trim();
          const normalizedName = name.toLowerCase().trim();
          const normalizedEmail = email.toLowerCase().trim();

          // 1. Try to fetch from Supabase
          try {
            const supabase = getSupabaseServerClient();
            const { data, error } = await supabase
              .from("demo_requests")
              .select("*")
              .neq("status", "ended");

            if (error) throw error;

            const matched = (data || []).find((row: any) => {
              return (
                row.company.toLowerCase().trim() === normalizedCompany &&
                row.name.toLowerCase().trim() === normalizedName &&
                row.email.toLowerCase().trim() === normalizedEmail
              );
            });

            if (matched) {
              return new Response(JSON.stringify({ verified: true, demoRequest: matched }), {
                headers: { "Content-Type": "application/json" },
              });
            }
          } catch (dbError: any) {
            console.warn(
              "[demo-request-verify] Supabase verification failed, checking in-memory fallback:",
              dbError.message || dbError,
            );
          }

          // 2. Fallback to check in-memory list
          const matchedInMem = demoRequests.find((row) => {
            return (
              row.company.toLowerCase().trim() === normalizedCompany &&
              row.name.toLowerCase().trim() === normalizedName &&
              row.email.toLowerCase().trim() === normalizedEmail &&
              row.status !== "ended"
            );
          });

          return new Response(
            JSON.stringify({ verified: !!matchedInMem, demoRequest: matchedInMem || null }),
            {
              headers: { "Content-Type": "application/json" },
            },
          );
        } catch (error: any) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          return new Response(
            JSON.stringify({ error: errorMessage || "Failed to verify demo request credentials" }),
            {
              status: 500,
              headers: { "Content-Type": "application/json" },
            },
          );
        }
      },
    },
  },
});
