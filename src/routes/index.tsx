import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, FileText, MessageSquare, Search, Shield, Sparkles, Zap, ChevronRight, Brain, Lock, Users } from "lucide-react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/")(({
  head: () => ({
    meta: [
      { title: "EKABA — Conversational access to company knowledge" },
      {
        name: "description",
        content:
          "Reduce information retrieval time by 80%. EKABA turns PDFs, wikis, and SharePoint into a single AI assistant employees actually use.",
      },
      { property: "og:title", content: "EKABA — Conversational access to company knowledge" },
      {
        property: "og:description",
        content:
          "Retrieval-augmented intelligence for every document, policy, and procedure inside your organization.",
      },
    ],
  }),
  component: Home,
} as any));

/* ─── Scroll-reveal hook ─────────────────────────────────── */
function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
    );
    document.querySelectorAll(".reveal, .reveal-scale, .reveal-left, .reveal-right").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

/* ─── 3-D card tilt hook ─────────────────────────────────── */
function useCardTilt(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const cards = el.querySelectorAll<HTMLElement>(".card-3d");
    const handlers: Array<{ card: HTMLElement; move: (e: MouseEvent) => void; leave: () => void }> = [];
    cards.forEach((card) => {
      const move = (e: MouseEvent) => {
        const rect = card.getBoundingClientRect();
        const dx = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
        const dy = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
        card.style.transform = `perspective(1000px) rotateY(${dx * 8}deg) rotateX(${-dy * 8}deg) translateZ(4px)`;
      };
      const leave = () => { card.style.transform = "perspective(1000px) rotateY(0deg) rotateX(0deg) translateZ(0)"; };
      card.addEventListener("mousemove", move);
      card.addEventListener("mouseleave", leave);
      handlers.push({ card, move, leave });
    });
    return () => handlers.forEach(({ card, move, leave }) => { card.removeEventListener("mousemove", move); card.removeEventListener("mouseleave", leave); });
  }, [ref]);
}

/* ─── Spotlight mouse tracker ───────────────────────────── */
function useSpotlight(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const items = el.querySelectorAll<HTMLElement>(".spotlight");
    const handlers: Array<{ el: HTMLElement; fn: (e: MouseEvent) => void }> = [];
    items.forEach((item) => {
      const fn = (e: MouseEvent) => {
        const rect = item.getBoundingClientRect();
        item.style.setProperty("--mouse-x", `${((e.clientX - rect.left) / rect.width) * 100}%`);
        item.style.setProperty("--mouse-y", `${((e.clientY - rect.top) / rect.height) * 100}%`);
      };
      item.addEventListener("mousemove", fn);
      handlers.push({ el: item, fn });
    });
    return () => handlers.forEach(({ el: item, fn }) => item.removeEventListener("mousemove", fn));
  }, [ref]);
}

/* ─── Streaming words ───────────────────────────────────── */
function AnimatedWords({ text, startDelay = 0 }: { text: string; startDelay?: number }) {
  const words = text.split(" ");
  return (
    <span>
      {words.map((word, i) => (
        <span
          key={i}
          className="inline-block opacity-0"
          style={{ animation: "fade-in-word 0.25s ease forwards", animationDelay: `${startDelay + i * 0.07}s` }}
        >
          {word}&nbsp;
        </span>
      ))}
    </span>
  );
}

/* ─── Cycling demo data ─────────────────────────────────── */
const DEMO_CYCLES = [
  {
    question: "What is our parental leave policy?",
    answer: "Employees receive 16 weeks paid parental leave. Secondary caregivers get 6 weeks. Eligibility requires 6+ months of tenure.",
    docs: ["HR_Policy_v3.pdf · §8.1", "Benefits_Guide_2025.pdf · p.22"],
    searching: "Searching 847 documents…",
    workspace: 0,
  },
  {
    question: "How do I request VPN access?",
    answer: "Submit an IT access request via the ServiceDesk portal. Your manager must approve within 24 hours. IT provisions access same day.",
    docs: ["IT_Handbook.pdf · §3.4", "Access_Control_Policy.pdf · p.8"],
    searching: "Scanning IT knowledge base…",
    workspace: 1,
  },
  {
    question: "What is the expense reimbursement limit?",
    answer: "Individual expenses up to $250 require only a receipt. Above $250 requires manager sign-off. Travel capped at $500/day.",
    docs: ["Finance_Policy_2025.pdf · §5", "Travel_Guidelines.pdf · p.4"],
    searching: "Retrieving finance policies…",
    workspace: 2,
  },
];

/* ─── 3D Animated Product Demo ─────────────────────────── */
function ProductDemo3D() {
  const [cycle, setCycle] = useState(0);
  const [phase, setPhase] = useState<"question" | "searching" | "answer">("question");

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setPhase("searching"), 1500));
    timers.push(setTimeout(() => setPhase("answer"), 4000));
    timers.push(setTimeout(() => { setCycle((c) => (c + 1) % DEMO_CYCLES.length); setPhase("question"); }, 9000));
    return () => timers.forEach(clearTimeout);
  }, [cycle]);

  const demo = DEMO_CYCLES[cycle];
  const workspaces = ["HR Policies", "IT Handbook", "Finance", "Onboarding", "Legal Docs"];

  return (
    <div className="relative hidden lg:block">
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 70% 60% at 55% 50%, oklch(0.48 0.14 120 / 22%), transparent 70%)", animation: "orb-drift 12s ease-in-out infinite" }}
      />

      {/* 3D Screen */}
      <div className="screen-3d-wrap relative">
        <div className="screen-3d screen-glow relative rounded-2xl border border-border/60 bg-card shadow-2xl overflow-hidden" style={{ width: "520px" }}>
          {/* Glass gloss */}
          <div className="screen-gloss" />
          {/* Scan line */}
          <div className="scan-line" />

          {/* Browser chrome */}
          <div className="flex items-center gap-2 border-b border-border/60 bg-secondary/50 backdrop-blur-sm px-4 py-3">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
            </div>
            <div className="flex-1 mx-3 flex items-center gap-2 rounded-md bg-background/70 px-3 py-1 border border-border/40">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
              <span className="font-mono text-[10px] text-muted-foreground">app.ekaba.ai/chat</span>
            </div>
            <div className="font-mono text-[9px] uppercase tracking-widest text-primary font-semibold">LIVE</div>
          </div>

          {/* App layout */}
          <div className="flex" style={{ height: "380px" }}>

            {/* Sidebar */}
            <div className="w-44 flex-shrink-0 border-r border-border/50 bg-secondary/20 p-3 flex flex-col gap-0.5 overflow-hidden">
              <p className="px-2 pb-2 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Workspaces</p>
              {workspaces.map((item, i) => (
                <div
                  key={item}
                  className={`px-2 py-1.5 rounded text-[11px] transition-all duration-500 ${
                    i === demo.workspace
                      ? "bg-primary/10 text-primary font-medium border border-primary/20"
                      : "text-muted-foreground"
                  }`}
                >
                  {item}
                </div>
              ))}
              <div className="mt-auto pt-3 border-t border-border/40">
                <div className="flex items-center gap-2 px-2 py-1.5 rounded text-[10px] text-muted-foreground">
                  <div className="h-5 w-5 rounded-full bg-primary/20 grid place-items-center">
                    <Users className="h-3 w-3 text-primary" />
                  </div>
                  <span>12 active users</span>
                </div>
              </div>
            </div>

            {/* Chat area */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 p-4 space-y-4 overflow-hidden">

                {/* User question */}
                <div className="flex justify-end">
                  <div
                    key={`q-${cycle}`}
                    className="max-w-[75%] rounded-2xl rounded-br-sm bg-secondary/80 px-3 py-2 text-[12px] leading-relaxed border border-border/40"
                    style={{ animation: "slide-in-right 0.4s ease both" }}
                  >
                    {demo.question}
                  </div>
                </div>

                {/* AI response */}
                <div className="flex gap-2.5 items-start">
                  <div className="h-7 w-7 rounded-lg bg-primary flex-shrink-0 grid place-items-center shadow-md shadow-primary/30">
                    <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
                  </div>
                  <div className="flex-1 space-y-2.5 min-w-0">

                    {/* Searching + progress */}
                    {(phase === "searching" || phase === "answer") && (
                      <div key={`s-${cycle}`} style={{ animation: "fade-in-word 0.3s ease both" }}>
                        <p className="text-[10px] text-muted-foreground mb-1.5">{demo.searching}</p>
                        <div className="h-1 w-full rounded-full bg-secondary overflow-hidden">
                          <div
                            className="progress-bar-fill"
                            style={{
                              animationDuration: phase === "answer" ? "0s" : "2.5s",
                              width: phase === "answer" ? "100%" : undefined,
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Typing dots */}
                    {phase === "searching" && (
                      <div className="flex items-center gap-1 text-muted-foreground pt-1">
                        <span className="typing-dot" />
                        <span className="typing-dot" />
                        <span className="typing-dot" />
                      </div>
                    )}

                    {/* Streamed answer */}
                    {phase === "answer" && (
                      <div key={`a-${cycle}`} className="text-[12px] leading-relaxed text-foreground">
                        <AnimatedWords text={demo.answer} startDelay={0.1} />
                      </div>
                    )}

                    {/* Citations */}
                    {phase === "answer" && (
                      <div key={`c-${cycle}`} className="flex flex-wrap gap-1.5 pt-1">
                        {demo.docs.map((doc, i) => (
                          <span
                            key={doc}
                            className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-background/80 px-2 py-0.5 font-mono text-[9px] text-muted-foreground"
                            style={{ animation: "fade-in-word 0.3s ease both", animationDelay: `${1.2 + i * 0.15}s`, opacity: 0 }}
                          >
                            <FileText className="h-2.5 w-2.5" />
                            {doc}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Input bar */}
              <div className="border-t border-border/50 bg-background/60 backdrop-blur-sm px-4 py-2.5 flex items-center gap-2">
                <Search className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                <span className="flex-1 text-[11px] text-muted-foreground">Ask anything about your company…</span>
                <kbd className="rounded border border-border bg-background/70 px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground">⌘K</kbd>
              </div>
            </div>
          </div>
        </div>

        {/* Drop shadow */}
        <div className="screen-shadow" />
      </div>

      {/* Floating badges */}
      <div className="demo-badge glass-card absolute -top-6 -left-10 rounded-xl px-4 py-3 shadow-xl z-20" style={{ animationDelay: "0.3s" }}>
        <div className="stat-number font-display text-2xl font-bold">80%</div>
        <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground mt-0.5">Faster retrieval</div>
      </div>

      <div className="demo-badge glass-card absolute -bottom-4 -right-8 rounded-xl px-4 py-3 shadow-xl z-20" style={{ animationDelay: "0.5s" }}>
        <div className="stat-number font-display text-2xl font-bold">&lt;3s</div>
        <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground mt-0.5">Response time</div>
      </div>

      <div className="demo-badge glass-card absolute top-1/2 -right-14 -translate-y-1/2 rounded-xl px-3 py-2.5 shadow-xl z-20" style={{ animationDelay: "0.7s" }}>
        <div className="flex items-center gap-2">
          <Lock className="h-3.5 w-3.5 text-primary" />
          <div>
            <div className="text-[11px] font-semibold">SOC 2</div>
            <div className="font-mono text-[9px] text-muted-foreground">Certified</div>
          </div>
        </div>
      </div>

      <div className="demo-badge glass-card absolute -top-3 right-10 rounded-xl px-3 py-2 shadow-xl z-20" style={{ animationDelay: "0.9s" }}>
        <div className="flex items-center gap-1.5">
          <Brain className="h-3.5 w-3.5 text-primary" />
          <span className="text-[11px] font-medium">RAG · Live</span>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

/* ─── Home ──────────────────────────────────────────────── */
function Home() {
  const rootRef = useRef<HTMLDivElement>(null);
  useScrollReveal();
  useCardTilt(rootRef);
  useSpotlight(rootRef);
  return (
    <div ref={rootRef}>
      <Hero />
      <Stats />
      <Problem />
      <Chat />
      <Pillars />
      <RagFlow />
      <Personas />
      <FAQ />
      <CTA />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border/60 min-h-[92vh] flex items-center">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="absolute -right-60 top-10 h-[700px] w-[700px] rounded-full hero-orb-1 blur-3xl opacity-60" />
      <div className="absolute -left-60 bottom-0 h-[600px] w-[600px] rounded-full hero-orb-2 blur-3xl opacity-50" />
      <div className="absolute right-1/3 top-1/2 h-[300px] w-[300px] rounded-full"
        style={{ background: "radial-gradient(circle, oklch(0.62 0.16 40 / 15%), transparent 70%)", animation: "orb-drift 20s ease-in-out infinite" }} />

      <div className="relative mx-auto max-w-7xl px-6 pb-28 pt-24 md:pt-20 w-full">
        <div className="reveal inline-flex items-center gap-2.5 rounded-full badge-glow px-4 py-2 mb-8">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary">Now generally available · Enterprise tier</span>
          <ChevronRight className="h-3 w-3 text-primary opacity-60" />
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: copy */}
          <div>
            <h1 className="reveal delay-100 mt-4 font-display text-6xl leading-[0.95] md:text-7xl lg:text-8xl">
              The answer is already{" "}
              <span className="shimmer-text">inside</span> your company.
              <br />
              <span className="text-muted-foreground">We just help you find it.</span>
            </h1>

            <p className="reveal delay-200 mt-8 max-w-xl text-lg text-muted-foreground leading-relaxed">
              EKABA is a retrieval-augmented assistant that reads every PDF, wiki, deck, and policy
              your organization owns — then answers in plain language, with citations.
            </p>

            <div className="reveal delay-300 mt-10 flex flex-wrap items-center gap-3">
              <Link to="/contact" className="btn-gradient group inline-flex items-center gap-2 rounded-lg px-7 py-3.5 text-sm font-semibold text-white shadow-lg">
                Request a demo
                <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              <Link to="/portal" className="inline-flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/5 px-7 py-3.5 text-sm font-medium hover:bg-primary/10 text-primary transition-all hover:border-primary/60 hover:shadow-md">
                Login to Portal
              </Link>
              <Link to="/platform" className="inline-flex items-center gap-2 rounded-lg border border-border px-7 py-3.5 text-sm font-medium hover:bg-secondary transition-all hover:shadow-md">
                See how it works
              </Link>
            </div>
          </div>

          {/* Right: 3D animated product demo */}
          <ProductDemo3D />
        </div>

        {/* Bottom stats bar */}
        <div className="reveal delay-400 mt-20 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border/60 bg-border/40 md:grid-cols-4 shadow-lg">
          {[["80%", "Faster retrieval"], ["90%", "Search accuracy"], ["< 3s", "Response time"], ["10K+", "Concurrent users"]].map(([n, l]) => (
            <div key={l} className="bg-background/80 backdrop-blur-sm p-7 group hover:bg-secondary/30 transition-colors">
              <div className="stat-number font-display text-4xl">{n}</div>
              <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stats() {
  return (
    <section className="border-b border-border/60 bg-secondary/20">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <p className="reveal text-center font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          Designed for the enterprises that already trust
        </p>
        <div className="reveal delay-100 mt-6 flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
          {["Microsoft 365", "SharePoint", "Confluence", "Notion", "Google Workspace", "Slack"].map((name, i) => (
            <span key={name} className="font-display text-2xl text-muted-foreground/60 hover:text-muted-foreground transition-colors cursor-default" style={{ transitionDelay: `${i * 60}ms` }}>
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Problem() {
  return (
    <section className="border-b border-border/60">
      <div className="mx-auto grid max-w-7xl gap-16 px-6 py-28 md:grid-cols-12">
        <div className="md:col-span-5 reveal-left">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">01 — The problem</p>
          <h2 className="mt-6 font-display text-5xl leading-tight">
            Your company doesn't have a knowledge problem. It has a{" "}
            <em className="text-primary">retrieval</em> problem.
          </h2>
        </div>
        <div className="md:col-span-7 reveal-right">
          <p className="text-lg text-muted-foreground">
            Critical information lives in PDFs, SharePoint folders, Confluence wikis, Slack threads,
            and the heads of senior staff. Employees spend an average of 2.5 hours a day looking for it.
          </p>
          <div className="mt-10 space-y-px">
            {[
              ["Knowledge silos", "Departments hoard expertise in tools no one else opens."],
              ["Duplicate work", "Teams rebuild documents that already exist three folders away."],
              ["Slow onboarding", "New hires take weeks to learn what veterans answer in seconds."],
              ["Inconsistent answers", "Two employees, same question, two different policies."],
              ["Lost expertise", "When people leave, their knowledge leaves with them."],
            ].map(([t, d], i) => (
              <div key={t} className="group flex gap-6 border-b border-border/60 py-5 hover:border-primary/30 transition-colors" style={{ transitionDelay: `${i * 60}ms` }}>
                <span className="font-mono text-xs text-primary/60 group-hover:text-primary transition-colors mt-1">→</span>
                <div className="flex-1">
                  <h3 className="font-display text-2xl group-hover:text-primary transition-colors">{t}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Chat() {
  return (
    <section className="border-b border-border/60 bg-secondary/20">
      <div className="mx-auto grid max-w-7xl gap-16 px-6 py-28 md:grid-cols-12">
        <div className="md:col-span-5 reveal-left">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">02 — The interface</p>
          <h2 className="mt-6 font-display text-5xl leading-tight">Ask in English. Get answers with receipts.</h2>
          <p className="mt-6 text-muted-foreground">
            Every response is grounded in your documents and cites the exact source — file, page, and section. No hallucinations. No "I'm not sure."
          </p>
          <div className="mt-8 space-y-3">
            {["Instant citations on every answer", "Semantic search across all formats", "Works with your existing tools"].map((feat) => (
              <div key={feat} className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                {feat}
              </div>
            ))}
          </div>
        </div>
        <div className="md:col-span-7 reveal-right">
          <div className="card-3d rounded-2xl border border-border bg-card p-2 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400/50" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/60" />
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">ekaba · live</span>
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            </div>
            <div className="space-y-5 p-6">
              <div className="flex justify-end">
                <div className="max-w-md rounded-2xl rounded-br-sm border border-border bg-background px-4 py-3 text-sm shadow-sm">
                  What is the leave approval process for new employees?
                </div>
              </div>
              <div className="flex gap-3">
                <div className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground shadow-md shadow-primary/30">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
                <div className="max-w-xl space-y-3 text-sm">
                  <p className="text-foreground">The leave approval process requires three steps:</p>
                  <ol className="space-y-1.5 pl-5 text-muted-foreground">
                    <li>1. Submit a request through the HRMS portal.</li>
                    <li>2. Receive manager approval within 48 hours.</li>
                    <li>3. HR verifies eligibility and confirms balance.</li>
                  </ol>
                  <div className="!mt-4 flex flex-wrap gap-2">
                    {["Employee Handbook · §4.2", "HRMS_Guide_2025.pdf · p.12"].map((doc) => (
                      <span key={doc} className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 font-mono text-[10px] text-muted-foreground hover:border-primary/40 transition-colors">
                        <FileText className="h-3 w-3" />{doc}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 border-t border-border bg-background/50 px-4 py-3 rounded-b-2xl">
              <Search className="h-4 w-4 text-muted-foreground" />
              <span className="flex-1 text-sm text-muted-foreground">Ask EKABA anything about your company…</span>
              <kbd className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px]">⌘ K</kbd>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Pillars() {
  const items = [
    { icon: Search, t: "Semantic search", d: "Vector embeddings understand intent, not just keywords." },
    { icon: MessageSquare, t: "Conversational UI", d: "Natural follow-ups. Context carries across the thread." },
    { icon: FileText, t: "Document intelligence", d: "Ingest PDFs, DOCX, PPTX, and TXT. We handle the rest." },
    { icon: Shield, t: "Source citations", d: "Every answer links back to the file, page, and section." },
    { icon: Zap, t: "Sub-3-second answers", d: "Engineered for retrieval at enterprise volume and latency." },
    { icon: Sparkles, t: "Feedback learning", d: "Thumbs up, thumbs down, reports. Quality compounds." },
  ];
  return (
    <section className="border-b border-border/60">
      <div className="mx-auto max-w-7xl px-6 py-28">
        <div className="reveal flex items-end justify-between gap-8">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">03 — What's inside</p>
            <h2 className="mt-6 max-w-2xl font-display text-5xl leading-tight">Six things every enterprise assistant should do. Most don't.</h2>
          </div>
          <Link to="/platform" className="hidden shrink-0 items-center gap-1.5 text-sm text-muted-foreground hover:text-primary md:inline-flex transition-colors">
            All capabilities <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="mt-14 grid gap-px overflow-hidden rounded-xl border border-border/60 bg-border/40 md:grid-cols-3 shadow-lg">
          {items.map(({ icon: Icon, t, d }, i) => (
            <div key={t} className="group card-3d spotlight bg-background p-8 transition-colors hover:bg-secondary/30 relative" style={{ transitionDelay: `${i * 50}ms` }}>
              <div className="relative z-10">
                <div className="icon-ring inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 group-hover:bg-primary/15 transition-colors">
                  <Icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
                </div>
                <h3 className="mt-6 font-display text-2xl group-hover:text-primary transition-colors">{t}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function RagFlow() {
  const steps = [
    ["Query", "User asks in natural language."],
    ["Embed", "Question converted to a vector."],
    ["Retrieve", "Relevant chunks pulled from vector store."],
    ["Context", "Passages and metadata fed to the LLM."],
    ["Generate", "Grounded response composed."],
    ["Cite", "Sources attached to every claim."],
  ];
  return (
    <section className="border-b border-border/60 bg-secondary/20">
      <div className="mx-auto max-w-7xl px-6 py-28">
        <div className="reveal max-w-2xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">04 — Architecture</p>
          <h2 className="mt-6 font-display text-5xl leading-tight">Retrieval-augmented generation, end to end.</h2>
          <p className="mt-6 text-muted-foreground">RAG keeps answers tied to source material. No fabricated quotes, no out-of-date policies — just the document, retrieved.</p>
        </div>
        <div className="mt-16 grid gap-px overflow-hidden rounded-xl border border-border/60 bg-border/40 md:grid-cols-6 shadow-lg">
          {steps.map(([t, d], i) => (
            <div key={t} className="reveal group relative bg-background p-6 hover:bg-secondary/30 transition-colors" style={{ transitionDelay: `${i * 80}ms` }}>
              <div className="absolute top-0 left-0 h-0.5 bg-gradient-to-r from-primary/60 to-accent/60 transition-all duration-500" style={{ width: `${((i + 1) / steps.length) * 100}%` }} />
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Step {String(i + 1).padStart(2, "0")}</div>
              <h3 className="mt-4 font-display text-2xl text-primary group-hover:scale-105 transition-transform origin-left">{t}</h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Personas() {
  const people = [
    { r: "Employees", n: "Get answers without pinging five people on Slack.", emoji: "👤" },
    { r: "Managers", n: "Pull team processes and historical context in seconds.", emoji: "📊" },
    { r: "HR officers", n: "Stop re-explaining policy. Let EKABA handle the FAQs.", emoji: "📋" },
    { r: "IT admins", n: "Granular roles, audit logs, and SSO control on day one.", emoji: "🔐" },
  ];
  return (
    <section className="border-b border-border/60">
      <div className="mx-auto max-w-7xl px-6 py-28">
        <p className="reveal font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">05 — Built for everyone</p>
        <h2 className="reveal delay-100 mt-6 max-w-3xl font-display text-5xl leading-tight">One assistant. Every role.</h2>
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {people.map(({ r, n, emoji }, i) => (
            <div key={r} className="reveal card-3d rounded-xl border border-border bg-card p-7 group hover:border-primary/30 transition-all" style={{ transitionDelay: `${i * 100}ms` }}>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-muted-foreground">0{i + 1}</span>
                <span className="text-2xl">{emoji}</span>
              </div>
              <h3 className="mt-6 font-display text-3xl group-hover:text-primary transition-colors">{r}</h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{n}</p>
              <div className="mt-5 h-px w-0 bg-gradient-to-r from-primary/60 to-accent/60 group-hover:w-full transition-all duration-500" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full hero-orb-1 blur-3xl opacity-50" />
      <div className="absolute right-0 bottom-0 h-[400px] w-[400px] rounded-full hero-orb-2 blur-3xl opacity-40" />
      <div className="relative mx-auto max-w-4xl px-6 py-36 text-center">
        <div className="reveal inline-flex items-center gap-2 rounded-full badge-glow px-4 py-2 mb-8">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary">Book a 30-min demo</span>
        </div>
        <h2 className="reveal delay-100 font-display text-6xl leading-[1] md:text-8xl">
          Stop searching.
          <br />
          <em className="shimmer-text">Start asking.</em>
        </h2>
        <p className="reveal delay-200 mx-auto mt-8 max-w-xl text-lg text-muted-foreground">
          Book a 30-minute demo and see EKABA answer questions about your own documents within the call.
        </p>
        <div className="reveal delay-300 mt-10 flex flex-wrap justify-center gap-4">
          <Link to="/contact" className="btn-gradient inline-flex items-center gap-2 rounded-lg px-8 py-4 text-sm font-semibold text-white shadow-xl">
            Request demo <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link to="/security" className="inline-flex items-center gap-2 rounded-lg border border-border px-8 py-4 text-sm font-medium hover:bg-secondary transition-all hover:shadow-md">
            Review our security
          </Link>
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const faqs = [
    {
      q: "How does EKABA prevent LLM hallucinations?",
      a: "EKABA uses Retrieval-Augmented Generation (RAG). Instead of relying on the LLM's static training data, we query your company's vector index to pull relevant text chunks, present them to the LLM, and instruct it to answer only based on the provided context. Every statement is backed by a clickable citation (file name, page, and section).",
    },
    {
      q: "What document types and integrations do you support?",
      a: "Out of the box, we support PDF, DOCX, PPTX, and TXT files. Through our custom connectors SDK, we integrate with SharePoint, Confluence, Microsoft Teams, Slack, Google Drive, and Notion to index your data where it already lives.",
    },
    {
      q: "Is our data secure with EKABA?",
      a: "Absolutely. EKABA supports enterprise security standards like SAML SSO and OAuth 2.0. All data is encrypted using AES-256 at rest and TLS 1.3 in transit. For highly regulated clients, we offer customer-managed encryption keys, single-tenant private cloud deployments, and strict role-based access control (RBAC).",
    },
    {
      q: "How long does it take to ingest and set up our knowledge base?",
      a: "For standard file shares and cloud storage, setup takes less than an hour. Our ingestion engine processes and indexes documents in real-time, meaning new uploads are searchable within seconds.",
    },
    {
      q: "Does EKABA support multilingual search and translation?",
      a: "Yes. EKABA leverages semantic embeddings that align concepts across different languages. Users can ask questions in Spanish, Japanese, or French, and retrieve answers from documents originally written in English, complete with translated explanations and reference notes.",
    },
  ];
  return (
    <section className="border-b border-border/60 bg-secondary/20">
      <div className="mx-auto max-w-4xl px-6 py-28">
        <div className="reveal text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">06 — F.A.Q.</p>
          <h2 className="mt-6 font-display text-5xl leading-tight">Frequently asked <em className="text-primary">questions</em></h2>
          <p className="mt-4 text-sm text-muted-foreground">Have questions about security, setup, or accuracy? We've got you covered.</p>
        </div>
        <div className="mt-16">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="reveal card-3d border border-border bg-card px-6 py-1 rounded-xl hover:border-primary/30 transition-colors"
                style={{ transitionDelay: `${i * 80}ms` } as React.CSSProperties}
              >
                <AccordionTrigger className="font-display text-xl hover:text-primary hover:no-underline py-4 text-left">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pt-2 pb-6 text-sm">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
