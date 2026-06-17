import { createFileRoute } from "@tanstack/react-router";
import { GoogleGenAI, Type } from "@google/genai";
import { findRelevantChunks, queryLogs, users } from "../../server/db";
import { Citation, QueryLog, UserRole } from "../../types";

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
          const body = await request.json();
          const { message, userId, userRole, userName } = body;

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
          const matchedChunks = findRelevantChunks(message, 3);

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

          // 2. Call Gemini-3.5-flash RAG pipeline from Server-side
          const ai = getGeminiClient();
          const prompt = `Enterprise Document Context:\n${contextBlocks}\n\nUser Question:\n"${message}"`;

          const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: prompt,
            config: {
              systemInstruction: `You are the Enterprise Knowledge Base Assistant (EKBA).
Answer the user's question accurately using ONLY the provided Enterprise Document Context.
If the answer cannot be found in the context, do not make assumptions or default to general knowledge. Instead, politely state that the information was not found.
You must construct the response to match the exact JSON schema provided: provide the 'answer' in markdown format, and structure high-accuracy 'citations' pointing directly to the utilized source documents, sections, and snippets.`,
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

          const responseText = response.text;
          if (!responseText) {
            throw new Error("Empty response returned from Gemini.");
          }

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
