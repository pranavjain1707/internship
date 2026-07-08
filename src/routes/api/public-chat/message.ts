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
    
    await supabase
      .from("query_logs")
      .delete()
      .lt("timestamp", sevenDaysAgo)
      .like("user_id", "v-%");

    await supabase
      .from("users")
      .delete()
      .eq("company", "visitor")
      .lt("created_at", sevenDaysAgo);
  } catch (err) {
    console.error("[message-cleanup] Exception during old records cleanup:", err);
  }
}

// SYSTEM INSTRUCTION for the Public AI Agent about EKABA
const SYSTEM_INSTRUCTION = `You are the EKABA Public Site Assistant, an AI agent designed to help viewers understand our platform.
Your goal is to answer questions about the EKABA site, its features, compliance, and capabilities.

Here is the essential information about EKABA:
1. **What is EKABA?**
   - EKABA stands for Enterprise Knowledge Base Assistant.
   - It is an AI-powered enterprise assistant that retrieves your organization's knowledge through natural conversation, cutting employee information retrieval time by 80%.
   - It turns PDFs, DOCX, PPTX, TXT files, wikis, and SharePoint into a single AI assistant that employees actually use.

2. **Key Platform Features**:
   - **Document Ingestion**: Upload documents easily. It parses files, segments them into semantic windows (512 tokens), generates 1536-dimensional vector embeddings, and stores them in a vector database (using pgvector).
   - **Citations & Audit**: Every answer includes exact page numbers, sections, and snippets of source documents so employees can verify and audit responses.
   - **Analytics & Dashboard**: IT administrators and managers get full analytics on query volume, feedback (likes/dislikes), active users, and document coverage.

3. **Security & Compliance**:
   - Multi-tenant enterprise isolation: Secure company-domain fencing ensures one company can never access another company's documents or search history.
   - Corporate SSO integration (Active Directory, Google Workspace, Okta).
   - Encryption: AES-256 at rest, TLS 1.3 in transit.
   - Compliance-ready: Designed for SOC 2 Type II, ISO 27001, GDPR, and HIPAA.

4. **Pricing, Demos, and Contact**:
   - Viewers can request a live product demo through the "Request demo" form on our Contact page (/contact).
   - Custom self-hosted and on-premise deployments are available for large Enterprise tiers.

Guidelines for your responses:
- Be highly professional, helpful, and concise.
- Answer questions using ONLY the facts listed above.
- If a user asks about something unrelated to EKABA or general knowledge (e.g. "tell me a joke" or "who was the 1st president of the US"), politely pivot back to explaining EKABA.
- Respond in clean markdown format.`;

export const Route = createFileRoute("/api/public-chat/message")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const { userId, message } = body;

          if (!userId || !userId.startsWith("v-")) {
            return new Response(
              JSON.stringify({ error: "Unauthorized. Please login with your email first." }),
              {
                status: 401,
                headers: { "Content-Type": "application/json" },
              }
            );
          }

          if (!message || !message.trim()) {
            return new Response(
              JSON.stringify({ error: "Message text cannot be empty." }),
              {
                status: 400,
                headers: { "Content-Type": "application/json" },
              }
            );
          }

          const supabase = getSupabaseServerClient();

          // 1. Run cleanup task
          await cleanupOldRecords(supabase);

          // 2. Query Gemini API
          let aiResponseText = "";
          const isApiKeyAvailable = !!process.env.GEMINI_API_KEY;

          if (isApiKeyAvailable) {
            const ai = getGeminiClient();
            const response = await ai.models.generateContent({
              model: "gemini-3.5-flash",
              contents: message,
              config: {
                systemInstruction: SYSTEM_INSTRUCTION,
              },
            });
            aiResponseText = response.text || "I apologize, I could not generate a response. Please try again.";
          } else {
            // Mock response if Gemini API key is missing
            aiResponseText = `⚠️ **[No API Key Configured]** Real-time AI response is offline.\n\nEKABA is an Enterprise Knowledge Base Assistant. It turns documents into a conversational search tool. To try it out or request a live demo, visit our Contact page.`;
          }

          // 3. Log query to Supabase query_logs
          const queryId = `q-visitor-${Date.now()}`;
          const newLog = {
            id: queryId,
            user_id: userId,
            user_name: "Visitor",
            user_role: "Employee",
            query_text: message,
            response_text: aiResponseText,
            timestamp: new Date().toISOString(),
            status: "success",
          };

          const { error: insertError } = await supabase
            .from("query_logs")
            .insert(newLog);

          if (insertError) {
            console.error("[public-chat/message] Logging query failed:", insertError.message);
          }

          return new Response(
            JSON.stringify({
              responseText: aiResponseText,
            }),
            {
              headers: { "Content-Type": "application/json" },
            }
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
            }
          );
        }
      },
    },
  },
});
