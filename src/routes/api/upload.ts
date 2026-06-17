import { createFileRoute } from "@tanstack/react-router";
import { documents } from "../../server/db";
import { Document } from "../../types";

export const Route = createFileRoute("/api/upload")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const { name, category, content, fileType, uploadedBy } = body;

          if (!name || !content || !fileType) {
            return new Response(
              JSON.stringify({ error: "Missing required fields: name, content, fileType." }),
              { status: 400, headers: { "Content-Type": "application/json" } },
            );
          }

          const newDoc: Document = {
            id: `doc-${Date.now()}`,
            name,
            category: category || "General",
            content,
            uploadedBy: uploadedBy || "Enterprise User",
            dateUploaded: new Date().toISOString().split("T")[0],
            fileType: fileType.toLowerCase(),
            size: `${Math.round((content.length / 1024) * 10) / 10 || 0.1} KB`,
          };

          documents.push(newDoc);

          return new Response(JSON.stringify(newDoc), {
            status: 201,
            headers: { "Content-Type": "application/json" },
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          return new Response(JSON.stringify({ error: errorMessage || "Failed to parse body" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
