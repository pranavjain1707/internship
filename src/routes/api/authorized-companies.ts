import { createFileRoute } from "@tanstack/react-router";
import { getSupabaseServerClient } from "../../lib/supabase-server";

// Fallback in-memory database of authorized client IDs and their plans
const DEFAULT_AUTHORIZED_COMPANIES: Record<string, any> = {
  "ekaba": { authorizedClientId: "EKABA-TEAM-2026" },
  "ekaba internal": { authorizedClientId: "EKABA-TEAM-2026" },
  "google": { authorizedClientId: "GOOG-EKABA-99" },
  "acme corp": { authorizedClientId: "ACME-EKABA-12" },
  "microsoft": { authorizedClientId: "MSFT-EKABA-88" },
  "apple": { authorizedClientId: "AAPL-EKABA-77" },
};

export const Route = createFileRoute("/api/authorized-companies")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const supabase = getSupabaseServerClient();
          let data: any[] | null = null;
          let error = null;

          try {
            const res = await supabase
              .from("authorized_companies")
              .select("company_name, authorized_client_id, plan_months, plan_starts_at, plan_expires_at, demo_expires_at, employee_id, employee_name, employee_email");
            if (res.error) throw res.error;
            data = res.data;
          } catch (e) {
            // Fallback for missing columns in database
            console.warn("[authorized-companies] Failed to query plan columns. Falling back to basic query.");
            const res = await supabase
              .from("authorized_companies")
              .select("company_name, authorized_client_id");
            data = res.data;
            error = res.error;
          }

          if (error) {
            throw error;
          }

          const mapped: Record<string, any> = {};

          // Seed default configurations
          Object.keys(DEFAULT_AUTHORIZED_COMPANIES).forEach((key) => {
            mapped[key] = {
              authorizedClientId: DEFAULT_AUTHORIZED_COMPANIES[key].authorizedClientId,
              planMonths: null,
              planStartsAt: null,
              planExpiresAt: null,
              demoExpiresAt: null,
              employeeId: null,
              employeeName: null,
              employeeEmail: null,
            };
          });

          if (data && data.length > 0) {
            data.forEach((row) => {
              mapped[row.company_name.toLowerCase().trim()] = {
                authorizedClientId: row.authorized_client_id.trim(),
                planMonths: row.plan_months || null,
                planStartsAt: row.plan_starts_at || null,
                planExpiresAt: row.plan_expires_at || null,
                demoExpiresAt: row.demo_expires_at || null,
                employeeId: row.employee_id || null,
                employeeName: row.employee_name || null,
                employeeEmail: row.employee_email || null,
              };
            });
          }

          return new Response(JSON.stringify(mapped), {
            headers: { "Content-Type": "application/json" },
          });
        } catch (error) {
          console.warn("[authorized-companies] Supabase fetch failed, falling back to mock:", error);
          
          // Format fallback to return formatted default records
          const mapped: Record<string, any> = {};
          Object.keys(DEFAULT_AUTHORIZED_COMPANIES).forEach((key) => {
            mapped[key] = {
              authorizedClientId: DEFAULT_AUTHORIZED_COMPANIES[key].authorizedClientId,
              planMonths: DEFAULT_AUTHORIZED_COMPANIES[key].planMonths || null,
              planStartsAt: DEFAULT_AUTHORIZED_COMPANIES[key].planStartsAt || null,
              planExpiresAt: DEFAULT_AUTHORIZED_COMPANIES[key].planExpiresAt || null,
              demoExpiresAt: DEFAULT_AUTHORIZED_COMPANIES[key].demoExpiresAt || null,
              employeeId: DEFAULT_AUTHORIZED_COMPANIES[key].employeeId || null,
              employeeName: DEFAULT_AUTHORIZED_COMPANIES[key].employeeName || null,
              employeeEmail: DEFAULT_AUTHORIZED_COMPANIES[key].employeeEmail || null,
            };
          });

          return new Response(JSON.stringify(mapped), {
            headers: { "Content-Type": "application/json" },
          });
        }
      },
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const { companyName, authorizedClientId, planMonths, employeeId, employeeName, employeeEmail } = body;

          if (!companyName) {
            return new Response(JSON.stringify({ error: "Missing required field: companyName." }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }

          const normalizedCompany = companyName.toLowerCase().trim();
          const existing = DEFAULT_AUTHORIZED_COMPANIES[normalizedCompany] || {};
          const cleanId = (authorizedClientId || existing.authorizedClientId || `AUTH-${Math.random().toString(36).substring(2, 9).toUpperCase()}`).trim();

          // Set 7 day demo limit by default on creation
          const demoExpiresAt = existing.demoExpiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
          let planStartsAt = existing.planStartsAt || null;
          let planExpiresAt = existing.planExpiresAt || null;
          let currentPlanMonths = existing.planMonths || null;

          if (planMonths) {
            currentPlanMonths = planMonths;
            planStartsAt = new Date().toISOString();
            const expires = new Date();
            expires.setMonth(expires.getMonth() + planMonths);
            planExpiresAt = expires.toISOString();
          }

          // 1. Update in-memory database
          DEFAULT_AUTHORIZED_COMPANIES[normalizedCompany] = {
            authorizedClientId: cleanId,
            planMonths: currentPlanMonths,
            planStartsAt,
            planExpiresAt,
            demoExpiresAt,
            employeeId: employeeId || existing.employeeId || null,
            employeeName: employeeName || existing.employeeName || null,
            employeeEmail: employeeEmail || existing.employeeEmail || null,
          };

          // 2. Save in Supabase
          try {
            const supabase = getSupabaseServerClient();
            const { error } = await supabase
              .from("authorized_companies")
              .upsert({
                company_name: normalizedCompany,
                authorized_client_id: cleanId,
                plan_months: currentPlanMonths,
                plan_starts_at: planStartsAt,
                plan_expires_at: planExpiresAt,
                demo_expires_at: demoExpiresAt,
                employee_id: employeeId || existing.employeeId || null,
                employee_name: employeeName || existing.employeeName || null,
                employee_email: employeeEmail || existing.employeeEmail || null,
              });

            if (error) {
              console.warn("[authorized-companies] Full upsert failed, attempting basic fallback upsert:", error.message);
              const { error: fallbackError } = await supabase
                .from("authorized_companies")
                .upsert({
                  company_name: normalizedCompany,
                  authorized_client_id: cleanId,
                });
              if (fallbackError) throw fallbackError;
            }
          } catch (dbError: any) {
            console.warn("[authorized-companies] Supabase upsert failed:", dbError.message || dbError);
          }

          return new Response(JSON.stringify({ 
            success: true, 
            companyName: normalizedCompany, 
            authorizedClientId: cleanId,
            planMonths: currentPlanMonths,
            planStartsAt,
            planExpiresAt,
            demoExpiresAt,
          }), {
            headers: { "Content-Type": "application/json" },
          });
        } catch (error: any) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          return new Response(JSON.stringify({ error: errorMessage || "Failed to authorize company" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
