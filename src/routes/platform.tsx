import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowUpRight, Database, FileText, Layers, MessageSquare, Search,
  Server, ThumbsUp, Upload, UserCheck, Sparkles
} from "lucide-react";

function DataPipeline3D() {
  const [step, setStep] = useState(0);
  const stages = [
    { label: "Document Ingestion", detail: "parsing HR_Handbook_2025.pdf", file: "HR_Handbook.pdf" },
    { label: "Chunk & Segment", detail: "creating semantic windows (512 tokens)", file: "512_tokens_window.json" },
    { label: "Embedding Conversion", detail: "generating 1536-dimensional vectors", file: "text-embedding-3" },
    { label: "Vector DB Storage", detail: "storing in pgvector index", file: "vector_index_table" }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setStep(s => (s + 1) % stages.length);
    }, 2200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full screen-3d-wrap max-w-[460px] mx-auto hidden lg:block">
      <div className="screen-3d screen-glow rounded-2xl border border-border/60 bg-card p-6 shadow-2xl overflow-hidden relative">
        {/* Gloss overlay */}
        <div className="screen-gloss" />
        <div className="scan-line" />
        
        {/* Terminal Header */}
        <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
            <span className="ml-2 font-mono text-[9px] text-muted-foreground">ingest-pipeline-telemetry</span>
          </div>
          <span className="font-mono text-[9px] uppercase tracking-widest text-primary font-semibold">LIVE ACTIVE</span>
        </div>

        {/* Live visualization stages */}
        <div className="space-y-4 font-mono text-xs text-left">
          {stages.map((stage, i) => {
            const isActive = i === step;
            return (
              <div 
                key={stage.label}
                className={`p-3 rounded-xl border transition-all duration-500 ${
                  isActive 
                    ? "border-primary bg-primary/10 shadow-md shadow-primary/10 scale-[1.02]" 
                    : "border-border/40 opacity-40 bg-background/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${isActive ? "bg-primary animate-ping" : "bg-muted-foreground"}`} />
                    <span className="font-semibold text-foreground">{stage.label}</span>
                  </div>
                  <span className="text-[9px] text-muted-foreground">STAGE 0{i + 1}</span>
                </div>
                {isActive && (
                  <div className="mt-2 text-[10px] text-muted-foreground leading-relaxed animate-fade-in pl-4 border-l border-primary/30 space-y-1">
                    <div>&gt; {stage.detail}</div>
                    <div className="text-[8px] text-primary/80 font-mono">FILE REF: {stage.file}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


export const Route = createFileRoute("/platform")({
  head: () => ({
    meta: [
      { title: "Platform — EKABA" },
      { name: "description", content: "How EKABA ingests, indexes, and retrieves enterprise knowledge — from document upload to cited response." },
      { property: "og:title", content: "Platform — EKABA" },
      { property: "og:description", content: "Functional and architectural overview of the Enterprise Knowledge Base Assistant." },
    ],
  }),
  component: Platform,
});

function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
    );
    document.querySelectorAll(".reveal, .reveal-left, .reveal-right, .reveal-scale").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

function Platform() {
  useScrollReveal();
  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-border/60 min-h-[55vh] flex items-center">
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="absolute -right-60 top-0 h-[600px] w-[600px] rounded-full hero-orb-1 blur-3xl opacity-50" />
        <div className="absolute -left-40 bottom-0 h-[500px] w-[500px] rounded-full hero-orb-2 blur-3xl opacity-40" />
        <div className="absolute right-1/4 top-1/3 h-[200px] w-[200px] rounded-full"
          style={{ background: "radial-gradient(circle, oklch(0.62 0.16 40 / 12%), transparent 70%)", animation: "orb-drift 15s ease-in-out infinite" }} />

        <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-28 w-full">
          <div className="grid lg:grid-cols-12 gap-16 items-center">
            {/* Left Hand: copy */}
            <div className="lg:col-span-7">
              <div className="reveal inline-flex items-center gap-2 rounded-full badge-glow px-4 py-2 mb-6">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary">The platform</span>
              </div>
              <h1 className="reveal delay-100 mt-4 max-w-4xl font-display text-7xl leading-[0.95] md:text-8xl">
                Documents in.{" "}
                <span className="shimmer-text">Answers out.</span>
              </h1>
              <p className="reveal delay-200 mt-8 max-w-2xl text-lg text-muted-foreground leading-relaxed">
                EKABA is a four-layer system: ingestion, intelligence, retrieval, and interface. Each
                layer is modular, replaceable, and built for enterprise scale.
              </p>
            </div>

            {/* Right Hand: 3D Data Pipeline animation */}
            <div className="lg:col-span-5">
              <DataPipeline3D />
            </div>
          </div>

          {/* Quick stat row */}
          <div className="reveal delay-300 mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border/60 bg-border/40 md:grid-cols-4 shadow-xl">
            {[["< 3s", "Response time"], ["99.9%", "Uptime SLA"], ["10K+", "Concurrent users"], ["AES-256", "Encryption"]].map(([n, l]) => (
              <div key={l} className="bg-background/80 backdrop-blur-sm p-6 group hover:bg-secondary/30 transition-colors">
                <div className="stat-number font-display text-3xl">{n}</div>
                <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Capabilities />
      <Architecture />
      <ApiSection />
      <CTA />
    </div>
  );
}

function Capabilities() {
  const caps = [
    { id: "FR-01", icon: UserCheck, t: "Authentication", d: "OAuth 2.0, SAML SSO, multi-factor auth, and role-based scope from day one." },
    { id: "FR-02", icon: Search, t: "Knowledge search", d: "Hybrid keyword + semantic ranking. Search by phrase, question, or vague intent." },
    { id: "FR-03", icon: MessageSquare, t: "Conversational assistant", d: "Multi-turn context, follow-ups, and conversational memory scoped to your role." },
    { id: "FR-04", icon: Upload, t: "Document ingestion", d: "Drop in PDFs, DOCX, PPTX, TXT. Chunked, embedded, and indexed automatically." },
    { id: "FR-05", icon: FileText, t: "Source citation", d: "Every answer is anchored to a document, page, and section. Auditable by design." },
    { id: "FR-06", icon: ThumbsUp, t: "Feedback loop", d: "Thumbs, reports, and review queues feed back into ranking and fine-tuning." },
  ];
  return (
    <section className="border-b border-border/60">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="reveal flex items-end justify-between gap-8">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">01 — Capabilities</p>
            <h2 className="mt-6 max-w-2xl font-display text-5xl leading-tight">Functional requirements, productized.</h2>
          </div>
          <span className="hidden font-mono text-xs text-muted-foreground md:inline">6 capabilities · MVP scope</span>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {caps.map(({ id, icon: Icon, t, d }, i) => (
            <div
              key={id}
              className="reveal card-3d spotlight group flex gap-6 rounded-xl border border-border/60 bg-card p-8 transition-all hover:border-primary/30 hover:shadow-xl relative overflow-hidden"
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/3 to-transparent pointer-events-none" />
              <div className="relative flex-shrink-0">
                <div className="icon-ring grid h-12 w-12 place-items-center rounded-xl border border-primary/20 bg-primary/8 group-hover:bg-primary/15 transition-colors">
                  <Icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
                </div>
              </div>
              <div className="relative flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{id}</span>
                  <span className="rounded border border-primary/30 bg-primary/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-primary">High</span>
                </div>
                <h3 className="mt-3 font-display text-3xl group-hover:text-primary transition-colors">{t}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{d}</p>
                <div className="mt-4 h-px w-0 bg-gradient-to-r from-primary/60 to-accent/60 group-hover:w-full transition-all duration-500" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Architecture() {
  const layers = [
    { icon: Layers, n: "Frontend", t: ["React.js", "Next.js"], d: "Chat interface, dashboard, admin panel. Fast, accessible, mobile-ready." },
    { icon: Server, n: "Backend", t: ["Python", "FastAPI"], d: "API gateway, authentication, orchestration. Modular service boundaries." },
    { icon: MessageSquare, n: "AI Layer", t: ["LLM", "Embeddings", "RAG engine"], d: "Retrieval-augmented generation with grounded context and source attribution." },
    { icon: Database, n: "Database", t: ["PostgreSQL", "Vector DB"], d: "Structured records, embeddings, audit logs, and granular access policies." },
  ];

  return (
    <section className="border-b border-border/60 bg-secondary/20">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="reveal">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">02 — Architecture</p>
          <h2 className="mt-6 max-w-3xl font-display text-5xl leading-tight">Four layers. Clean contracts. Independently scalable.</h2>
        </div>

        <div className="mt-14 space-y-px overflow-hidden rounded-xl border border-border/60 bg-border/40 shadow-xl">
          {layers.map(({ icon: Icon, n, t, d }, i) => (
            <div
              key={n}
              className="reveal group grid grid-cols-12 gap-6 bg-background p-8 md:p-10 hover:bg-secondary/20 transition-colors"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div className="col-span-12 flex items-center gap-4 md:col-span-3">
                <span className="font-mono text-xs text-muted-foreground">L0{i + 1}</span>
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 border border-primary/20 group-hover:bg-primary/15 transition-colors">
                  <Icon className="h-4.5 w-4.5 text-primary" strokeWidth={1.5} />
                </div>
                <h3 className="font-display text-3xl group-hover:text-primary transition-colors">{n}</h3>
              </div>
              <div className="col-span-12 md:col-span-3">
                <div className="flex flex-wrap gap-1.5">
                  {t.map((tech) => (
                    <span key={tech} className="rounded-md border border-border/60 bg-secondary/60 px-2 py-1 font-mono text-xs text-muted-foreground">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
              <p className="col-span-12 text-muted-foreground leading-relaxed md:col-span-6">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ApiSection() {
  const eps = [
    ["POST", "/search", "Hybrid keyword + semantic search across the knowledge corpus."],
    ["POST", "/chat", "Multi-turn conversational endpoint with grounded citations."],
    ["POST", "/upload", "Ingest a document, chunk, embed, and index in one call."],
    ["POST", "/feedback", "Capture user signal — likes, dislikes, and issue reports."],
  ];
  return (
    <section className="border-b border-border/60">
      <div className="mx-auto grid max-w-7xl gap-16 px-6 py-24 md:grid-cols-12">
        <div className="md:col-span-5 reveal-left">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">03 — REST API</p>
          <h2 className="mt-6 font-display text-5xl leading-tight">Four endpoints. Everything else is implementation detail.</h2>
          <p className="mt-6 text-muted-foreground leading-relaxed">
            Plug EKABA into your existing intranet, Slack workspace, or internal tools. The same
            primitives that power our UI are available to you.
          </p>
          <Link to="/contact" className="mt-8 inline-flex items-center gap-2 btn-gradient rounded-lg px-6 py-3 text-sm font-semibold text-white">
            Get API access <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="md:col-span-7 reveal-right">
          <div className="card-3d overflow-hidden rounded-xl border border-border/60 bg-card font-mono text-sm shadow-2xl">
            {/* Terminal header */}
            <div className="flex items-center gap-2 border-b border-border/60 bg-secondary/50 px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
              <span className="ml-3 font-mono text-[10px] text-muted-foreground">api.ekaba.ai · REST v1</span>
            </div>
            {eps.map(([m, p, d], i) => (
              <div
                key={p}
                className="reveal group grid grid-cols-12 items-start gap-4 border-b border-border/50 p-5 last:border-b-0 hover:bg-secondary/20 transition-colors"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <span className="col-span-2 rounded-md bg-primary/15 px-2 py-1 text-center text-xs text-primary font-semibold">{m}</span>
                <code className="col-span-3 text-foreground group-hover:text-primary transition-colors">{p}</code>
                <p className="col-span-7 text-xs text-muted-foreground leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full hero-orb-1 blur-3xl opacity-40" />
      <div className="relative mx-auto max-w-4xl px-6 py-32 text-center">
        <div className="reveal inline-flex items-center gap-2 rounded-full badge-glow px-4 py-2 mb-8">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary">Deep dive available</span>
        </div>
        <h2 className="reveal delay-100 font-display text-5xl leading-tight md:text-6xl">
          Want a deeper{" "}
          <span className="shimmer-text">technical walkthrough?</span>
        </h2>
        <p className="reveal delay-200 mx-auto mt-6 max-w-xl text-muted-foreground leading-relaxed">
          Our solution engineers will run through the architecture, security model, and ingestion pipeline against your own stack.
        </p>
        <div className="reveal delay-300 mt-8 flex flex-wrap justify-center gap-4">
          <Link to="/contact" className="btn-gradient inline-flex items-center gap-2 rounded-lg px-8 py-4 text-sm font-semibold text-white shadow-xl">
            Book a technical demo <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link to="/security" className="inline-flex items-center gap-2 rounded-lg border border-border px-8 py-4 text-sm font-medium hover:bg-secondary transition-all hover:shadow-md">
            Review our security
          </Link>
        </div>
      </div>
    </section>
  );
}
