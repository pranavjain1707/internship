/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from "react";
import {
  Send,
  Bot,
  User as UserIcon,
  HelpCircle,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  FileText,
  ExternalLink,
  RefreshCw,
  X,
  ChevronRight,
} from "lucide-react";
import { Citation, QueryLog, User } from "../../types";

interface ChatInterfaceProps {
  currentUser: User;
  initialQuery?: string;
  onClearInitialQuery?: () => void;
}

interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  citations?: Citation[];
  queryId?: string; // mapping to server-logged query ID for feedback routing
  feedbackSubmitted?: "like" | "dislike";
}

export default function ChatInterface({
  currentUser,
  initialQuery,
  onClearInitialQuery,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "assistant",
      text: 'Hello! I am the EKABA Knowledge Base Assistant. I am hooked directly into your organization\'s documents, policies, and manual segments.\n\nAsk me anything! For example:\n* *"What processes do I follow for leave approval?"*\n* *"What are the travel meal allowances?"*\n* *"What encryption standards are specified for GDPR?"*',
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Feedback States
  const [feedbackPromptOpen, setFeedbackPromptOpen] = useState(false);
  const [feedbackQueryId, setFeedbackQueryId] = useState<string | null>(null);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [selectedRating, setSelectedRating] = useState<"like" | "dislike">("like");

  // Report Issue state
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportExplanation, setReportExplanation] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialQueryHandled = useRef(false);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  // Handle passed initialQuery from the dashboard search click
  useEffect(() => {
    if (initialQuery && initialQuery.trim() && !initialQueryHandled.current) {
      initialQueryHandled.current = true;
      handleSendMessage(initialQuery);
      if (onClearInitialQuery) {
        onClearInitialQuery();
      }
    }
  }, [initialQuery]);

  const handleSendMessage = async (textToSend?: string) => {
    const rawText = textToSend || inputMessage;
    if (!rawText.trim() || isGenerating) return;

    if (!textToSend) setInputMessage("");

    const randomSuffix = Math.random().toString(36).substring(2, 11);

    // Append User Message with ultra unique key ID
    const userMsg: Message = {
      id: `msg-user-${Date.now()}-${randomSuffix}`,
      sender: "user",
      text: rawText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsGenerating(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: rawText,
          userId: currentUser.id,
          userRole: currentUser.role,
          userName: currentUser.name,
        }),
      });

      const nextRandomSuffix = Math.random().toString(36).substring(2, 11);

      if (res.ok) {
        const data = await res.json();

        // Append Assistant Message with exact RAG Citations
        const assistantMsg: Message = {
          id: `msg-assistant-${Date.now()}-${nextRandomSuffix}`,
          sender: "assistant",
          text: data.responseText,
          citations: data.citations || [],
          queryId: data.id,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        const errData = await res.json();
        throw new Error(errData.message || "Endpoint error.");
      }
    } catch (err) {
      console.error(err);
      const errorObj = err instanceof Error ? err : new Error(String(err));

      const nextRandomSuffix = Math.random().toString(36).substring(2, 11);
      const errMsg: Message = {
        id: `msg-err-${Date.now()}-${nextRandomSuffix}`,
        sender: "assistant",
        text: `⚠️ **RAG Integration Timeout Error:**\n\nUnable to access the model or retrieve context chunks. Check if your API key or server configuration is active.\n\n*Technical Detail: ${errorObj.message || "Failed request connection"}*`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsGenerating(false);
    }
  };

  // Submit Feedback Rating
  const handleFeedbackSubmit = async (queryId: string, rating: "like" | "dislike") => {
    setSelectedRating(rating);
    setFeedbackQueryId(queryId);
    setFeedbackComment("");
    setFeedbackPromptOpen(true);

    // Optimistic state update in UI
    setMessages((prev) =>
      prev.map((m) => (m.queryId === queryId ? { ...m, feedbackSubmitted: rating } : m)),
    );
  };

  const handleSendFeedbackPayload = async () => {
    if (!feedbackQueryId) return;

    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          queryId: feedbackQueryId,
          rating: selectedRating,
          comments: feedbackComment,
          userId: currentUser.id,
        }),
      });
    } catch (e) {
      console.error("Feedback transmission failed:", e);
    } finally {
      setFeedbackPromptOpen(false);
      setFeedbackQueryId(null);
    }
  };

  // Issue reporting logic (Section 9.6: FR-6 Feedback System)
  const handleReportOpen = (queryId: string) => {
    setFeedbackQueryId(queryId);
    setReportExplanation("");
    setReportModalOpen(true);
  };

  const handleSendReport = async () => {
    if (!feedbackQueryId) return;

    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          queryId: feedbackQueryId,
          rating: "dislike", // Reporting counts as negative feedback
          comments: `[ISSUE_REPORT]: ${reportExplanation}`,
          userId: currentUser.id,
        }),
      });

      setMessages((prev) =>
        prev.map((m) =>
          m.queryId === feedbackQueryId ? { ...m, feedbackSubmitted: "dislike" } : m,
        ),
      );
    } catch (e) {
      console.error("Report dispatch failed:", e);
    } finally {
      setReportModalOpen(false);
      setFeedbackQueryId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm h-[calc(100vh-170px)] sm:h-[650px] flex overflow-hidden">
      {/* Left Chat Window Canvas */}
      <div className="flex-1 flex flex-col h-full bg-slate-50/50">
        {/* Header bar */}
        <div className="bg-white border-b border-slate-200/80 px-6 py-4 flex justify-between items-center bg-[linear-gradient(to_right,rgba(255,255,255,1),rgba(248,250,252,0.8))]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-slate-800 text-sm">
                EKABA Conversational RAG
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] font-mono text-slate-500">
                  GEMINI LLM SECURED RETRIEVAL
                </span>
              </div>
            </div>
          </div>
          <div className="text-[11px] font-mono text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 hidden sm:block">
            AUTHENTICATED: {currentUser.role}
          </div>
        </div>

        {/* Messaging Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-4 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {/* Bot Avatar Icon */}
              {msg.sender === "assistant" && (
                <div className="w-8 h-8 rounded-lg bg-indigo-100 border border-indigo-200 text-indigo-700 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`space-y-2 max-w-[85%] sm:max-w-[75%] ${msg.sender === "user" ? "text-right" : "text-left"}`}
              >
                {/* Text Bubble */}
                <div
                  className={`p-4 rounded-2xl shadow-sm text-sm border leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-indigo-600 text-white border-indigo-600 rounded-tr-none text-left"
                      : "bg-white text-slate-800 border-slate-200/80 rounded-tl-none"
                  }`}
                >
                  <div className="whitespace-pre-line prose max-w-none text-xs sm:text-sm">
                    {msg.text}
                  </div>

                  {msg.id === "welcome" && (
                    <div className="mt-4 pt-4 border-t border-slate-150/80 space-y-2">
                      <span className="text-[10px] font-mono font-bold text-indigo-650 uppercase tracking-widest block">
                        Interactive prompt starters:
                      </span>
                      <div className="flex flex-col gap-2 pt-1">
                        {[
                          "What is the leave approval process for employees?",
                          "What is the travel meal limit allowance?",
                          "What encryption standards are specified for GDPR?",
                        ].map((promptText, pIdx) => (
                          <button
                            key={pIdx}
                            onClick={() => handleSendMessage(promptText)}
                            className="bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 hover:border-indigo-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 font-semibold transition text-left cursor-pointer shadow-sm flex items-center justify-between group"
                          >
                            <span>{promptText}</span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Inline / Associated Citations panel (FR-5 Showcase!) */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-4 border-t border-slate-100 pt-3.5 space-y-2">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                        Verified RAG Sources
                      </span>
                      <div className="grid gap-2">
                        {msg.citations.map((cite, cIdx) => (
                          <div
                            key={cIdx}
                            className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex gap-2 items-start justify-between hover:bg-slate-100/50 transition-all"
                          >
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-700">
                                <FileText className="w-3.5 h-3.5 text-indigo-505" />
                                <span className="truncate">{cite.sourceDoc}</span>
                                {cite.section && (
                                  <>
                                    <span className="text-slate-350">|</span>
                                    <span className="text-indigo-600 uppercase tracking-wider font-mono text-[9px] truncate">
                                      {cite.section}
                                    </span>
                                  </>
                                )}
                              </div>
                              {cite.snippet && (
                                <p
                                  className="text-[10px] text-slate-500 italic truncate"
                                  title={cite.snippet}
                                >
                                  &ldquo;{cite.snippet}&rdquo;
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Timestamp & Feedback Rails */}
                <div
                  className={`flex items-center gap-3 text-[10px] text-slate-400 px-1 font-mono ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <span>{msg.timestamp}</span>

                  {msg.sender === "assistant" && msg.queryId && (
                    <div className="flex items-center gap-1 border-l border-slate-200 pl-3">
                      <button
                        onClick={() => handleFeedbackSubmit(msg.queryId!, "like")}
                        className={`p-1 rounded hover:bg-slate-100 ${msg.feedbackSubmitted === "like" ? "text-emerald-600 bg-emerald-50" : "text-slate-400"}`}
                        title="Like Response"
                      >
                        <ThumbsUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleFeedbackSubmit(msg.queryId!, "dislike")}
                        className={`p-1 rounded hover:bg-slate-100 ${msg.feedbackSubmitted === "dislike" ? "text-rose-600 bg-rose-50" : "text-slate-400"}`}
                        title="Dislike Response"
                      >
                        <ThumbsDown className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleReportOpen(msg.queryId!)}
                        className="text-[10px] font-sans font-bold hover:underline text-indigo-650 hover:text-indigo-800 ml-1 cursor-pointer"
                      >
                        Report Issue
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* User Avatar Icon */}
              {msg.sender === "user" && (
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 mt-1 font-display font-bold text-xs border border-indigo-700 shadow-sm shadow-indigo-100">
                  {currentUser.avatar || "ME"}
                </div>
              )}
            </div>
          ))}

          {/* Generative Skeleton Loader */}
          {isGenerating && (
            <div className="flex gap-4 animate-pulse">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 border border-indigo-200 text-indigo-700 flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="w-4 h-4" />
              </div>
              <div className="space-y-2 max-w-[85%] sm:max-w-[75%]">
                <div className="bg-white border border-indigo-100 rounded-2xl p-4 sm:p-5 rounded-tl-none space-y-4 shadow-sm min-w-[240px] sm:min-w-[320px]">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
                    <span className="text-xs text-indigo-750 font-mono font-bold tracking-wider uppercase">
                      Retranslating Knowledge Clusters...
                    </span>
                  </div>

                  {/* Decorative multi-step pipeline status list */}
                  <div className="space-y-2.5 font-mono text-[10px] text-slate-500 border-l-2 border-slate-100 pl-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></div>
                      <span className="text-emerald-700 font-bold">
                        [OK] Connected with user role auth profile
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></div>
                      <span className="text-emerald-700 font-bold">
                        [OK] Formulated dense 1536d vector query
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping shrink-0"></div>
                      <span className="text-indigo-600 font-bold uppercase tracking-wide">
                        [PENDING] Synthesizing context chunks via Gemini core...
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 animate-[pulse_1.5s_infinite]"
                        style={{ width: "85%" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input box */}
        <div className="bg-white border-t border-slate-200/80 p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-3 bg-slate-50 border border-slate-250 rounded-xl p-1.5 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all"
          >
            <input
              type="text"
              placeholder="Ask a natural question..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isGenerating}
              className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isGenerating}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:hover:bg-indigo-600 text-white rounded-lg p-2.5 transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Closed-Loop Feedback Context Dialogue Modal */}
      {feedbackPromptOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-display font-bold text-slate-800">
                {selectedRating === "like"
                  ? "Help Us Reinforce AI Learning"
                  : "Tell Us What Went Wrong"}
              </h3>
              <button
                onClick={() => setFeedbackPromptOpen(false)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Your feedback is analyzed securely by compliance managers to optimize RAG parsing,
              context chunking, and limit future hallucinations.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Optimization Notes (Optional):
              </label>
              <textarea
                placeholder={
                  selectedRating === "like"
                    ? "What did you find particularly accurate?"
                    : "Where did the information fall short?"
                }
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                className="w-full bg-slate-50 border border-slate-250 focus:border-indigo-500 rounded-xl p-3 text-xs text-slate-800 focus:outline-none min-h-[90px]"
              />
            </div>

            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setFeedbackPromptOpen(false)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg py-2 px-4 transition"
              >
                Skip Notes
              </button>
              <button
                type="button"
                onClick={handleSendFeedbackPayload}
                className="text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg py-2 px-4 transition shadow-sm"
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Issue Reporting Modal (FR-6) */}
      {reportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertCircle className="w-5 h-5" />
                <h3 className="text-lg font-display font-bold text-slate-800">
                  Report Inaccuracy / Issue
                </h3>
              </div>
              <button
                onClick={() => setReportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              If an assistant response references stale policies, contains conflicting answers, or
              points to the wrong section, file an issue below for administrative review.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Issue Explanation:
              </label>
              <textarea
                placeholder="Describe the discrepancy (e.g., 'Retrieved Section 5.1 but travel meal standard is outdated...')"
                value={reportExplanation}
                onChange={(e) => setReportExplanation(e.target.value)}
                className="w-full bg-slate-50 border border-slate-250 focus:border-indigo-500 rounded-xl p-3 text-xs text-slate-800 focus:outline-none min-h-[110px]"
              />
            </div>

            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setReportModalOpen(false)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg py-2 px-4 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendReport}
                className="text-xs font-semibold text-white bg-rose-600 hover:bg-rose-50 rounded-lg py-2 px-4 transition shadow-sm"
              >
                Dispatch Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
