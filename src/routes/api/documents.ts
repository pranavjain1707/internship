import { createFileRoute } from "@tanstack/react-router";
import { documents, loadDocumentsFromSupabase } from "../../server/db";
import { deleteDocumentFromSupabase } from "../../lib/supabase-server";

// Lazy-load documents from Supabase on first request
let docsLoaded = false;
async function ensureDocsLoaded() {
  if (!docsLoaded) {
    docsLoaded = true;
    await loadDocumentsFromSupabase();
  }
}

export const Route = createFileRoute("/api/documents")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        await ensureDocsLoaded();
        const url = new URL(request.url);
        const company = url.searchParams.get("company");

        let filtered = documents;
        if (company) {
          const normalized = company.toLowerCase().trim();
          filtered = documents.filter(
            (d) => (d.company || "ekaba").toLowerCase().trim() === normalized,
          );
        }

        return new Response(JSON.stringify(filtered), {
          headers: { "Content-Type": "application/json" },
        });
      },
      DELETE: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const id = url.searchParams.get("id");
          if (!id) {
            return new Response(JSON.stringify({ error: "Missing document id." }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }

          // 1. Delete from Supabase (table and storage)
          await deleteDocumentFromSupabase(id);

          // 2. Remove from local in-memory cache
          const index = documents.findIndex((d) => d.id === id);
          if (index !== -1) {
            documents.splice(index, 1);
          }

          return new Response(
            JSON.stringify({ success: true, message: `Document ${id} deleted.` }),
            {
              headers: { "Content-Type": "application/json" },
            },
          );
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error("[delete-document] Delete failed:", errorMessage);
          return new Response(
            JSON.stringify({ error: errorMessage || "Failed to delete document" }),
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
