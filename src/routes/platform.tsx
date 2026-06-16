import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Database, FileText, Layers, MessageSquare, Search, Server, ThumbsUp, Upload, UserCheck } from "lucide-react";

export const Route = createFileRoute("/platform")({
  head: () => ({
    meta: [
      { title: "Platform — EKBA" },
      { name: "description", content: "How EKBA ingests, indexes, and retrieves enterprise knowledge — from document upload to cited response." },
      { property: "og:title", content: "Platform — EKBA" },
      { property: "og:description", content: "Functional and architectural overview of the Enterprise Knowledge Base Assistant." },
    ],
  }),
  component: Platform,
});

function Platform() {
  return (
    <div>
      <section className="border-b border-border/60">
        <div className="mx-auto max-w-7xl px-6 pb-20 pt-24">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">The platform</p>
          <h1 className="mt-6 max-w-4xl font-display text-7xl leading-[0.95]">Documents in. <em className="text-primary">Answers out.</em></h1>
          <p className="mt-8 max-w-2xl text-lg text-muted-foreground">
            EKBA is a four-layer system: ingestion, intelligence, retrieval, and interface. Each layer is modular, replaceable, and built for enterprise scale.
          </p>
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
        <div className="flex items-end justify-between gap-8">
          <h2 className="max-w-2xl font-display text-5xl leading-tight">Functional requirements, productized.</h2>
          <span className="hidden font-mono text-xs text-muted-foreground md:inline">6 capabilities · MVP scope</span>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {caps.map(({ id, icon: Icon, t, d }) => (
            <div key={id} className="group flex gap-6 rounded-lg border border-border bg-card p-8 transition hover:border-primary/40">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-md border border-border bg-background">
                <Icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{id}</span>
                  <span className="rounded border border-primary/30 bg-primary/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-primary">High</span>
                </div>
                <h3 className="mt-3 font-display text-3xl">{t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{d}</p>
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
    <section className="border-b border-border/60 bg-secondary/30">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">System architecture</p>
        <h2 className="mt-6 max-w-3xl font-display text-5xl leading-tight">Four layers. Clean contracts. Independently scalable.</h2>

        <div className="mt-14 space-y-px overflow-hidden rounded-lg border border-border/60 bg-border/60">
          {layers.map(({ icon: Icon, n, t, d }, i) => (
            <div key={n} className="grid grid-cols-12 gap-6 bg-background p-8 md:p-10">
              <div className="col-span-12 flex items-center gap-4 md:col-span-3">
                <span className="font-mono text-xs text-muted-foreground">L0{i + 1}</span>
                <Icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
                <h3 className="font-display text-3xl">{n}</h3>
              </div>
              <div className="col-span-12 md:col-span-3">
                <div className="flex flex-wrap gap-1.5">
                  {t.map(tech => (
                    <span key={tech} className="rounded border border-border bg-secondary/50 px-2 py-1 font-mono text-xs text-muted-foreground">{tech}</span>
                  ))}
                </div>
              </div>
              <p className="col-span-12 text-muted-foreground md:col-span-6">{d}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-px overflow-hidden rounded-lg border border-border/60 bg-border/60 md:grid-cols-4">
          {[
            ["< 3s", "Response time"],
            ["99.9%", "Uptime SLA"],
            ["10K+", "Concurrent users"],
            ["AES-256", "At-rest encryption"],
          ].map(([n, l]) => (
            <div key={l} className="bg-background p-6">
              <div className="font-display text-3xl text-primary">{n}</div>
              <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{l}</div>
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
        <div className="md:col-span-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">REST API</p>
          <h2 className="mt-6 font-display text-5xl leading-tight">Four endpoints. Everything else is implementation detail.</h2>
          <p className="mt-6 text-muted-foreground">
            Plug EKBA into your existing intranet, Slack workspace, or internal tools. The same primitives that power our UI are available to you.
          </p>
        </div>
        <div className="md:col-span-7">
          <div className="overflow-hidden rounded-lg border border-border bg-card font-mono text-sm">
            {eps.map(([m, p, d]) => (
              <div key={p} className="grid grid-cols-12 items-start gap-4 border-b border-border p-5 last:border-b-0">
                <span className="col-span-2 rounded bg-primary/15 px-2 py-1 text-center text-xs text-primary">{m}</span>
                <code className="col-span-3 text-foreground">{p}</code>
                <p className="col-span-7 text-xs text-muted-foreground">{d}</p>
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
    <section className="relative overflow-hidden border-b border-border/60">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="relative mx-auto max-w-4xl px-6 py-24 text-center">
        <h2 className="font-display text-5xl">Want a deeper technical walkthrough?</h2>
        <p className="mx-auto mt-6 max-w-xl text-muted-foreground">
          Our solution engineers will run through the architecture, security model, and ingestion pipeline against your own stack.
        </p>
        <Link to="/contact" className="mt-8 inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90">
          Book a technical demo <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
