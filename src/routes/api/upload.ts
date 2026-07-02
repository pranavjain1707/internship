import { createFileRoute } from "@tanstack/react-router";
import { documents } from "../../server/db";
import { Document } from "../../types";
import { saveDocumentToSupabase, uploadFileToSupabaseStorage } from "../../lib/supabase-server";

export const Route = createFileRoute("/api/upload")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const { name, category, content, fileType, uploadedBy, company } = body;

          if (!name || !content || !fileType) {
            return new Response(
              JSON.stringify({ error: "Missing required fields: name, content, fileType." }),
              { status: 400, headers: { "Content-Type": "application/json" } },
            );
          }

          const docId = `doc-${Date.now()}`;
          const dateUploaded = new Date().toISOString().split("T")[0];
          const sizeKb = `${Math.round((content.length / 1024) * 10) / 10 || 0.1} KB`;
          const safeFileType = fileType.toLowerCase() as Document["fileType"];

          // ── 1. Upload file content to Supabase Storage ──────────────────
          const fileName = `${docId}.txt`;
          let storagePath: string;

          try {
            storagePath = await uploadFileToSupabaseStorage({
              fileName,
              content,
              contentType: "text/plain",
            });
          } catch (storageError) {
            console.error("[upload] Supabase Storage upload failed:", storageError);
            // Fallback: store content directly in the database row
            storagePath = "";
          }

          // ── 2. Save metadata + storage path to Supabase ─────────────────
          await saveDocumentToSupabase({
            id: docId,
            name,
            category: category || "General",
            content,           // keep content in Supabase for search fallback
            filePath: storagePath,
            uploadedBy: uploadedBy || "Enterprise User",
            dateUploaded,
            fileType: safeFileType,
            size: sizeKb,
            company: company || "ekaba",
          });
          console.log(`[upload] Saved document metadata to Supabase (storage path: ${storagePath})`);

          // ── 3. Add to in-memory documents array (for current session) ────
          const newDoc: Document = {
            id: docId,
            name,
            category: category || "General",
            content,
            filePath: storagePath,
            uploadedBy: uploadedBy || "Enterprise User",
            dateUploaded,
            fileType: safeFileType,
            size: sizeKb,
            company: company || "ekaba",
          };

          documents.push(newDoc);

          return new Response(JSON.stringify(newDoc), {
            status: 201,
            headers: { "Content-Type": "application/json" },
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error("[upload] Upload failed:", errorMessage);
          return new Response(JSON.stringify({ error: errorMessage || "Failed to process upload" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
