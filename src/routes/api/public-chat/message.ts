import { createFileRoute } from "@tanstack/react-router";
import { GoogleGenAI } from "@google/genai";
import { getSupabaseServerClient } from "../../../lib/supabase-server";

let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required but not set in server.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Clean up visitor records and query logs older than 7 days
async function cleanupOldRecords(supabase: any) {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    await supabase.from("query_logs").delete().lt("timestamp", sevenDaysAgo).like("user_id", "v-%");

    await supabase.from("users").delete().eq("company", "visitor").lt("created_at", sevenDaysAgo);
  } catch (err) {
    console.error("[message-cleanup] Exception during old records cleanup:", err);
  }
}

// SYSTEM INSTRUCTION for the Public AI Agent about EKABA
const SYSTEM_INSTRUCTION = `You are the EKABA Public Site Assistant, an intelligent AI agent designed to engage with viewers and help them explore our platform. Your goal is to answer questions about the EKABA site, its features, compliance, and capabilities.

About EKABA:
EKABA (Enterprise Knowledge Base Assistant) is an AI-powered conversational search platform for organizations. It cuts employee information retrieval times by 80% by connecting scattered PDFs, DOCX, PPTX, TXT files, wikis, and SharePoint portals into a single, secure, cited AI assistant.

Website Pages & Capabilities:
- **Home**: Explains our value proposition (reducing retrieval time by 80%). Shows how we ingest, scan, and retrieve documents with inline citations.
- **Platform**: Deep dive into the data pipeline (document ingestion -> chunking with 512-token semantic windows -> 1536-dimensional vector embedding generation -> pgvector storage for semantic search). Explains audit trails and the analytics dashboard for tracking usage statistics and feedback.
- **Security & Compliance**: Detail-oriented security including OAuth 2.0/Okta SSO, AES-256 encryption at rest, TLS 1.3 in transit, role-based access controls, and compliance targets (SOC 2 Type II, ISO 27001, GDPR, and HIPAA). Features secure domain isolation ensuring companies cannot see each other's data.
- **Roadmap**: Mentions features like multi-modal chat, custom LLMs, integrations with Jira/Slack/Notion, and self-hosted deployment.
- **Contact**: Allows visitors to request a demo by submitting a form.

Agent Guidelines:
- Act as an expert representative for EKABA. Be professional, welcoming, helpful, and highly conversational.
- You have access to general knowledge about artificial intelligence, database indexing, vector search, compliance standards, and enterprise software. Use this knowledge to explain the tech stack and benefits of EKABA in detail (e.g., explaining how pgvector, RAG, or SOC 2 compliance works).
- Do not limit yourself strictly to the bullet points above. Use them as the core context, but use your full intelligence as an AI agent to elaborate, answer follow-up questions, and help the user understand the benefits of our site.
- If the user asks about something completely unrelated (like general trivia, math equations, or code for other projects), answer briefly or politely pivot back to how EKABA can help them or how it relates to their question.
- Always respond in clean markdown format.`;

export const Route = createFileRoute("/api/public-chat/message")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const { userId, userName, message } = body;

          if (!userId || !userId.startsWith("v-")) {
            return new Response(
              JSON.stringify({ error: "Unauthorized. Please login with your email first." }),
              {
                status: 401,
                headers: { "Content-Type": "application/json" },
              },
            );
          }

          if (!message || !message.trim()) {
            return new Response(JSON.stringify({ error: "Message text cannot be empty." }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }

          const supabase = getSupabaseServerClient();

          // 1. Run cleanup task
          await cleanupOldRecords(supabase);

          // 2. Query Gemini API
          let aiResponseText = "";
          const isApiKeyAvailable = !!process.env.GEMINI_API_KEY;

          if (isApiKeyAvailable) {
            const ai = getGeminiClient();

            // Multi-model fallback chain to ensure maximum reliability and availability
            try {
              console.log("[Gemini] Attempting generation with gemini-2.5-flash...");
              const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: message,
                config: {
                  systemInstruction: SYSTEM_INSTRUCTION,
                },
              });
              aiResponseText =
                response.text || "I apologize, I could not generate a response. Please try again.";
            } catch (err25: any) {
              console.warn(
                "[Gemini] gemini-2.5-flash failed or was overloaded. Trying gemini-1.5-flash...",
                err25.message || err25,
              );
              try {
                const response = await ai.models.generateContent({
                  model: "gemini-1.5-flash",
                  contents: message,
                  config: {
                    systemInstruction: SYSTEM_INSTRUCTION,
                  },
                });
                aiResponseText =
                  response.text ||
                  "I apologize, I could not generate a response. Please try again.";
              } catch (err15: any) {
                console.warn(
                  "[Gemini] gemini-1.5-flash failed. Trying gemini-3.5-flash...",
                  err15.message || err15,
                );
                const response = await ai.models.generateContent({
                  model: "gemini-3.5-flash",
                  contents: message,
                  config: {
                    systemInstruction: SYSTEM_INSTRUCTION,
                  },
                });
                aiResponseText =
                  response.text ||
                  "I apologize, I could not generate a response. Please try again.";
              }
            }
          } else {
            // Mock response if Gemini API key is missing
            aiResponseText = `⚠️ **[No API Key Configured]** Real-time AI response is offline.\n\nEKABA is an Enterprise Knowledge Base Assistant. It turns documents into a conversational search tool. To try it out or request a live demo, visit our Contact page.`;
          }

          // 3. Log query to Supabase query_logs
          const queryId = `q-visitor-${Date.now()}`;
          const newLog = {
            id: queryId,
            user_id: userId,
            user_name: userName || "Visitor",
            user_role: "Employee",
            query_text: message,
            response_text: aiResponseText,
            timestamp: new Date().toISOString(),
            status: "success",
          };

          const { error: insertError } = await supabase.from("query_logs").insert(newLog);

          if (insertError) {
            console.error("[public-chat/message] Logging query failed:", insertError.message);
          }

          return new Response(
            JSON.stringify({
              responseText: aiResponseText,
            }),
            {
              headers: { "Content-Type": "application/json" },
            },
          );
        } catch (error) {
          const errMsg = error instanceof Error ? error.message : String(error);
          console.error("Public chat message endpoint error:", errMsg);
          return new Response(
            JSON.stringify({
              error: "Failed to generate AI response",
              message: errMsg,
            }),
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
