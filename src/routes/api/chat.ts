import { createFileRoute } from "@tanstack/react-router";
import { GoogleGenAI, Type } from "@google/genai";
import { findRelevantChunks, queryLogs, users, loadDocumentsFromSupabase } from "../../server/db";
import { Citation, QueryLog, UserRole } from "../../types";
import { saveQueryLogToSupabase } from "../../lib/supabase-server";

// Language code to name mapping for Gemini instruction
const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  hi: "Hindi",
  bn: "Bengali",
  te: "Telugu",
  mr: "Marathi",
  ta: "Tamil",
  ur: "Urdu",
  gu: "Gujarati",
  kn: "Kannada",
  ml: "Malayalam",
  or: "Odia",
  pa: "Punjabi",
  as: "Assamese",
  mai: "Maithili",
  sa: "Sanskrit",
  kok: "Konkani",
  ne: "Nepali",
  doi: "Dogri",
  ks: "Kashmiri",
  mni: "Manipuri",
  sat: "Santali",
  sd: "Sindhi",
  brx: "Bodo",
};

// Load documents from Supabase once per server process (lazy singleton).
// This ensures that any previously uploaded docs (with file_path) are
// available for RAG before the first chat request is processed.
let docsLoaded = false;
async function ensureDocsLoaded() {
  if (!docsLoaded) {
    docsLoaded = true; // set early to prevent concurrent duplicate loads
    await loadDocumentsFromSupabase();
  }
}

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

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          // Ensure docs from Supabase (with file_path) are loaded into memory
          await ensureDocsLoaded();

          const body = await request.json();
          const { message, userId, userRole, userName, language, company } = body;

          // Resolve language name for prompt
          const langCode = language || "en";
          const langName = LANGUAGE_NAMES[langCode] || "English";

          if (!message) {
            return new Response(JSON.stringify({ error: "Missing message text." }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }

          const activeUser = users.find((u) => u.id === userId) || {
            id: userId || "anonymous",
            name: userName || "Visitor",
            role: (userRole as UserRole) || "Employee",
          };

          // 1. Retrieve the top relevant local material chunks
          const matchedChunks = findRelevantChunks(message, company, 3);

          const contextBlocks = matchedChunks
            .map(
              (chunk) =>
                `Source Document: "${chunk.docName}"\nSection Name: "${chunk.section}"\nContent Snippet:\n"""\n${chunk.content}\n"""`,
            )
            .join("\n\n---\n\n");

          const isApiKeyAvailable = !!process.env.GEMINI_API_KEY;

          if (!isApiKeyAvailable) {
            // Fallback RAG mockup response when there's no API key configured.
            const bestSection = matchedChunks[0];
            const simulatedAnswer = `⚠️ **[No API Key Configured]** Real-time AI response is offline. Generating high-relevance retrieval block below:\n\nBased on your query and **${bestSection.docName}** (${bestSection.section}):\n\n${bestSection.content}`;
            const simulatedCitations: Citation[] = matchedChunks.map((chunk) => ({
              sourceDoc: chunk.docName,
              section: chunk.section,
              snippet: chunk.content.substring(0, 150) + "...",
            }));

            const newLog: QueryLog = {
              id: `q-${Date.now()}`,
              userId: activeUser.id,
              userName: activeUser.name,
              userRole: activeUser.role,
              queryText: message,
              responseText: simulatedAnswer,
              citations: simulatedCitations,
              timestamp: new Date().toISOString(),
              status: "success",
            };
            queryLogs.push(newLog);
            await saveQueryLogToSupabase(newLog);

            return new Response(
              JSON.stringify({
                id: newLog.id,
                responseText: simulatedAnswer,
                citations: simulatedCitations,
                warning: "No Gemini API key found. Default simulated context matching triggered.",
              }),
              { headers: { "Content-Type": "application/json" } },
            );
          }

          // 2. Call Gemini RAG pipeline from Server-side with multi-model fallback
          const ai = getGeminiClient();
          const prompt = `Enterprise Document Context:\n${contextBlocks}\n\nUser Question:\n"${message}"`;

          const modelsToTry = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-3.5-flash"];
          let responseText = "";
          let successModel = "";

          for (const modelName of modelsToTry) {
            try {
              console.log(`[Gemini RAG] Attempting generation with ${modelName}...`);
              const response = await ai.models.generateContent({
                model: modelName,
                contents: prompt,
                config: {
                  systemInstruction: `You are the Enterprise Knowledge Base Assistant (EKBA).
Answer the user's question accurately using ONLY the provided Enterprise Document Context.
If the answer cannot be found in the context, do not make assumptions or default to general knowledge. Instead, politely state that the information was not found.
You must construct the response to match the exact JSON schema provided: provide the 'answer' in markdown format, and structure high-accuracy 'citations' pointing directly to the utilized source documents, sections, and snippets.

IMPORTANT LANGUAGE INSTRUCTION: You MUST respond in ${langName} language. The 'answer' field must be written entirely in ${langName}. The citations (sourceDoc, section, snippet) should remain in their original language as they reference document names and sections. Only the 'answer' text should be in ${langName}.`,
                  responseMimeType: "application/json",
                  responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                      answer: {
                        type: Type.STRING,
                        description: "The complete markdown formatted answer response.",
                      },
                      citations: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            sourceDoc: { type: Type.STRING },
                            section: { type: Type.STRING },
                            snippet: { type: Type.STRING },
                          },
                          required: ["sourceDoc"],
                        },
                      },
                    },
                    required: ["answer", "citations"],
                  },
                },
              });

              if (response.text) {
                responseText = response.text;
                successModel = modelName;
                break;
              }
            } catch (err: unknown) {
              const errMsg = err instanceof Error ? err.message : String(err);
              console.warn(`[Gemini RAG] ${modelName} failed or was overloaded:`, errMsg);
            }
          }

          if (!responseText) {
            throw new Error("All Gemini models in fallback chain failed to generate a response.");
          }

          console.log(`[Gemini RAG] Generation successful using model: ${successModel}`);

          const parsedResult = JSON.parse(responseText.trim());
          const markdownAnswer = parsedResult.answer || "No response text found.";
          const responseCitations: Citation[] = parsedResult.citations || [];

          // Save Query to memory / database for analytics reporting
          const newLog: QueryLog = {
            id: `q-${Date.now()}`,
            userId: activeUser.id,
            userName: activeUser.name,
            userRole: activeUser.role,
            queryText: message,
            responseText: markdownAnswer,
            citations: responseCitations,
            timestamp: new Date().toISOString(),
            status: "success",
          };
          queryLogs.push(newLog);
          await saveQueryLogToSupabase(newLog);

          return new Response(
            JSON.stringify({
              id: newLog.id,
              responseText: markdownAnswer,
              citations: responseCitations,
            }),
            { headers: { "Content-Type": "application/json" } },
          );
        } catch (error) {
          console.error("Gemini RAG Pipeline failed:", error);
          const errorMessage = error instanceof Error ? error.message : String(error);
          return new Response(
            JSON.stringify({
              error: "RAG generation failed",
              message: errorMessage || "An unexpected error occurred in Gemini processing.",
            }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
