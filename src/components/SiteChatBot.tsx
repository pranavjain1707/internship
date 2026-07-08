import { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, LogOut, Bot, Sparkles, Loader2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  text: string;
  timestamp?: string;
}

export default function SiteChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState("");
  
  // Session state
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  
  // Chat input state
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isSending, isOpen]);

  // Load session from localStorage on mount
  useEffect(() => {
    const savedUserId = localStorage.getItem("public_chat_userId");
    const savedEmail = localStorage.getItem("public_chat_email");
    const savedMessages = localStorage.getItem("public_chat_messages");

    if (savedUserId && savedEmail) {
      setUserId(savedUserId);
      setUserEmail(savedEmail);
      if (savedMessages) {
        try {
          setMessages(JSON.parse(savedMessages));
        } catch (e) {
          console.error("Failed to parse saved chat messages:", e);
        }
      }
    }
  }, []);

  // Save messages to localStorage when updated
  useEffect(() => {
    if (userId) {
      localStorage.setItem("public_chat_messages", JSON.stringify(messages));
    }
  }, [messages, userId]);

  // Handle Login submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setLoginError("Please enter a valid email address.");
      return;
    }

    setIsLoggingIn(true);
    setLoginError("");

    try {
      const response = await fetch("/api/public-chat/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      setUserId(data.userId);
      setUserEmail(data.email);
      
      // If user has previous logs returned, load them. Else show welcoming message.
      if (data.messages && data.messages.length > 0) {
        setMessages(data.messages);
      } else {
        setMessages([
          {
            role: "assistant",
            text: `Hi there! 👋 I am the EKABA Assistant.
            
I can answer your questions about our site and platform, including:
* **What is EKABA?** (Enterprise Knowledge Base Assistant)
* **Our features** (Ingestion, semantic search, citations, analytics)
* **Security controls** (AES-256 encryption, SSO integration, compliance standards like SOC 2, GDPR, HIPAA)
* **How to book a demo**

Ask me anything!`,
          },
        ]);
      }

      // Persist session
      localStorage.setItem("public_chat_userId", data.userId);
      localStorage.setItem("public_chat_email", data.email);
    } catch (err: any) {
      setLoginError(err.message || "An unexpected error occurred during login.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Send Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isSending || !userId) return;

    const userText = inputValue;
    setInputValue("");
    setSendError("");

    // Append user message local state
    const userMsg: Message = {
      role: "user",
      text: userText,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsSending(true);

    try {
      const response = await fetch("/api/public-chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          message: userText,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get AI response");
      }

      // Append assistant message local state
      const assistantMsg: Message = {
        role: "assistant",
        text: data.responseText,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setSendError(err.message || "Could not retrieve response.");
      // Rollback last message or display error notice
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `⚠️ **Error:** ${err.message || "Failed to communicate with AI server. Please verify your connection."}`,
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    setUserId(null);
    setUserEmail(null);
    setMessages([]);
    setEmail("");
    localStorage.removeItem("public_chat_userId");
    localStorage.removeItem("public_chat_email");
    localStorage.removeItem("public_chat_messages");
  };

  // Clean formatted rendering helper for basic Markdown
  const formatMessageText = (text: string) => {
    if (!text) return "";
    
    const lines = text.split("\n");
    const formattedHtml = lines
      .map((line) => {
        let formattedLine = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
        formattedLine = formattedLine.replace(/\*(.*?)\*/g, "<em>$1</em>");

        // Lists: * item or - item
        if (line.trim().startsWith("* ") || line.trim().startsWith("- ")) {
          const listContent = line.trim().substring(2);
          const innerFormatted = listContent
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
            .replace(/\*(.*?)\*/g, "<em>$1</em>");
          return `<li class="ml-4 list-disc mb-1">${innerFormatted}</li>`;
        }

        // Numbered lists: 1. item
        const numListMatch = line.trim().match(/^(\d+)\.\s(.*)/);
        if (numListMatch) {
          const listContent = numListMatch[2];
          const innerFormatted = listContent
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
            .replace(/\*(.*?)\*/g, "<em>$1</em>");
          return `<li class="ml-4 list-decimal mb-1">${innerFormatted}</li>`;
        }

        return formattedLine;
      })
      .join("\n");

    // Convert line breaks to <br /> (but skip list items to prevent weird spacing)
    const finalHtml = formattedHtml
      .split("\n")
      .map((line) => {
        if (line.startsWith("<li")) return line;
        return line + "<br />";
      })
      .join("");

    return <span className="leading-relaxed" dangerouslySetInnerHTML={{ __html: finalHtml }} />;
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      {/* ─── Chat Window ─── */}
      {isOpen && (
        <div className="mb-4 w-[360px] sm:w-[400px] h-[520px] max-h-[calc(100vh-120px)] rounded-2xl border border-border/80 bg-background/95 backdrop-blur-md shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/60 bg-secondary/35 px-4 py-3.5">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-md">
                <Bot className="h-4.5 w-4.5" />
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-emerald-500" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-foreground">EKABA Guide</p>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <span>AI Agent</span>
                  <span>•</span>
                  <span>Online</span>
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              {userId && (
                <button
                  onClick={handleLogout}
                  className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition cursor-pointer"
                  title="Logout Session"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            {!userId ? (
              /* Onboarding / Login Form */
              <div className="flex-1 flex flex-col items-center justify-center text-center px-4 animate-in fade-in duration-300">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary mb-4">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-lg text-foreground mb-2">Learn about EKABA</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Have questions about our security, documents indexing, or platform features? 
                  Log in below to start chatting with our AI guide.
                </p>
                
                <form onSubmit={handleLogin} className="w-full flex flex-col gap-3">
                  <div className="text-left">
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoggingIn}
                      className="w-full rounded-md border border-border bg-background/50 px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                    />
                  </div>
                  
                  {loginError && (
                    <p className="text-xs text-rose-500 font-medium text-left">{loginError}</p>
                  )}

                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-full flex items-center justify-center gap-2 rounded-md bg-primary hover:opacity-90 active:scale-[0.98] py-2 text-sm font-semibold text-primary-foreground transition cursor-pointer disabled:opacity-50"
                  >
                    {isLoggingIn ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Logging in...</span>
                      </>
                    ) : (
                      <span>Start Chatting</span>
                    )}
                  </button>
                  <p className="text-[10px] text-muted-foreground mt-2">
                    * By logging in, your email and chat history are saved for 7 days.
                  </p>
                </form>
              </div>
            ) : (
              /* Message History View */
              <>
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex flex-col max-w-[85%] ${
                      msg.role === "user" ? "self-end items-end animate-in slide-in-from-right-2 duration-200" : "self-start items-start animate-in slide-in-from-left-2 duration-200"
                    }`}
                  >
                    <div
                      className={`rounded-2xl px-3.5 py-2.5 text-sm ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-tr-none shadow-md"
                          : "bg-secondary/60 text-secondary-foreground border border-border/30 rounded-tl-none shadow-sm"
                      }`}
                    >
                      {formatMessageText(msg.text)}
                    </div>
                  </div>
                ))}
                
                {isSending && (
                  <div className="self-start flex flex-col items-start gap-1 max-w-[85%] animate-in fade-in duration-200">
                    <div className="rounded-2xl rounded-tl-none bg-secondary/40 border border-border/20 px-4 py-3 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Footer Input Form */}
          {userId && (
            <div className="border-t border-border/60 bg-background/55 p-3 flex flex-col gap-1.5">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="Ask a question about EKABA..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={isSending}
                  className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition placeholder:text-muted-foreground"
                />
                <button
                  type="submit"
                  disabled={isSending || !inputValue.trim()}
                  className="grid h-9 w-9 place-items-center rounded-md bg-primary hover:opacity-90 active:scale-95 text-primary-foreground transition cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
              <div className="flex justify-between items-center text-[9px] text-muted-foreground px-1 font-mono">
                <span>Session: {userEmail}</span>
                <span>Records stored for 7 days</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── Trigger Button ─── */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative h-14 w-14 rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-xl shadow-primary/30 flex items-center justify-center cursor-pointer transition-transform duration-300 hover:scale-110 active:scale-95 group focus:outline-none"
          aria-label="Open support chat"
        >
          {/* Ripple effects */}
          <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping opacity-75" />
          <MessageSquare className="h-6 w-6 group-hover:rotate-6 transition-transform relative z-10" />
        </button>
      )}
    </div>
  );
}
