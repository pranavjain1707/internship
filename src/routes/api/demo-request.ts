import { createFileRoute } from "@tanstack/react-router";
import { getSupabaseServerClient } from "../../lib/supabase-server";
import { demoRequests } from "../../server/db";
import { DemoRequest } from "../../types";

export const Route = createFileRoute("/api/demo-request")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const supabase = getSupabaseServerClient();

          // 1. Delete ended demo requests older than 7 days in Supabase
          const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
          try {
            await supabase
              .from("demo_requests")
              .delete()
              .eq("status", "ended")
              .lt("ended_at", sevenDaysAgo);
          } catch (dbError: any) {
            console.warn("[demo-request] Supabase 7-day auto-delete failed:", dbError.message || dbError);
          }

          // 2. Delete ended demo requests older than 7 days in-memory fallback
          const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
          const nowMs = Date.now();
          const activeInMem = demoRequests.filter((r) => {
            if (r.status === "ended" && r.endedAt) {
              return nowMs - new Date(r.endedAt).getTime() < sevenDaysMs;
            }
            return true;
          });
          demoRequests.length = 0;
          demoRequests.push(...activeInMem);

          const { data, error } = await supabase
            .from("demo_requests")
            .select("*")
            .order("created_at", { ascending: false });

          if (error) {
            if (error.message.includes("relation") && error.message.includes("does not exist")) {
              console.warn("[demo-request] demo_requests table not found. Returning in-memory fallback.");
              return new Response(JSON.stringify(demoRequests), {
                headers: { "Content-Type": "application/json" },
              });
            }
            throw error;
          }

          // Convert DB columns to JS camelCase
          const formatted = (data || []).map((row: any) => ({
            id: row.id,
            name: row.name,
            email: row.email,
            company: row.company,
            role: row.role,
            size: row.size,
            message: row.message,
            status: row.status,
            acceptedBy: row.accepted_by,
            acceptedByName: row.accepted_by_name,
            assignedTo: row.assigned_to,
            assignedToName: row.assigned_to_name,
            createdAt: row.created_at,
            endedAt: row.ended_at,
          }));

          return new Response(JSON.stringify(formatted), {
            headers: { "Content-Type": "application/json" },
          });
        } catch (error) {
          console.warn("[demo-request] GET error, falling back to in-memory:", error);
          return new Response(JSON.stringify(demoRequests), {
            headers: { "Content-Type": "application/json" },
          });
        }
      },
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const { name, email, company, role, size, message } = body;

          if (!name || !email || !company) {
            return new Response(JSON.stringify({ error: "Missing required fields: name, email, company." }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }

          const id = `demo-${Date.now()}`;
          const newRequest: DemoRequest = {
            id,
            name,
            email,
            company,
            role: role || "General",
            size: size || "1–50",
            message: message || "",
            status: "pending",
            createdAt: new Date().toISOString(),
          };

          // 1. Log / Simulate Email
          console.log(`\n============================================================`);
          console.log(`[EMAIL SIMULATOR] TO: ${email}`);
          console.log(`[EMAIL SIMULATOR] SUBJECT: Demo Request Received - EKABA`);
          console.log(`[EMAIL SIMULATOR] BODY:`);
          console.log(`Hello ${name},`);
          console.log(`We got your demo request for ${company}. Our team will communicate with you in 24 hours.`);
          console.log(`Best regards,\nEKABA Team`);
          console.log(`============================================================\n`);

          // 2. Store in Supabase or in-memory
          try {
            const supabase = getSupabaseServerClient();
            const { error } = await supabase.from("demo_requests").insert({
              id,
              name,
              email,
              company,
              role: newRequest.role,
              size: newRequest.size,
              message: newRequest.message,
              status: newRequest.status,
              created_at: newRequest.createdAt,
            });

            if (error) throw error;
          } catch (dbError: any) {
            console.warn("[demo-request] Supabase insert failed, caching in-memory:", dbError.message || dbError);
            demoRequests.push(newRequest);
          }

          return new Response(JSON.stringify({ success: true, request: newRequest }), {
            status: 201,
            headers: { "Content-Type": "application/json" },
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          return new Response(JSON.stringify({ error: errorMessage || "Failed to submit demo request" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
      PUT: async ({ request }) => {
        try {
          const body = await request.json();
          const { id, status, acceptedBy, acceptedByName, assignedTo, assignedToName, endedAt } = body;

          if (!id || !status) {
            return new Response(JSON.stringify({ error: "Missing required fields: id, status." }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }

          // 1. Update in Supabase or in-memory
          try {
            const supabase = getSupabaseServerClient();
            const updatePayload: any = {
              status,
              accepted_by: acceptedBy,
              accepted_by_name: acceptedByName,
              assigned_to: assignedTo,
              assigned_to_name: assignedToName,
            };
            if (status === "ended") {
              updatePayload.ended_at = endedAt || new Date().toISOString();
            }
            const { error } = await supabase
              .from("demo_requests")
              .update(updatePayload)
              .eq("id", id);

            if (error) throw error;
          } catch (dbError: any) {
            console.warn("[demo-request] Supabase update failed, updating in-memory:", dbError.message || dbError);
            const req = demoRequests.find((r) => r.id === id);
            if (req) {
              req.status = status;
              if (acceptedBy !== undefined) req.acceptedBy = acceptedBy;
              if (acceptedByName !== undefined) req.acceptedByName = acceptedByName;
              if (assignedTo !== undefined) req.assignedTo = assignedTo;
              if (assignedToName !== undefined) req.assignedToName = assignedToName;
              if (status === "ended") {
                req.endedAt = endedAt || new Date().toISOString();
              }
            }
          }

          return new Response(JSON.stringify({ success: true }), {
            headers: { "Content-Type": "application/json" },
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          return new Response(JSON.stringify({ error: errorMessage || "Failed to update demo request" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
