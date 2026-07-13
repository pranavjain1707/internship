import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  ArrowUpRight,
  Search,
  SlidersHorizontal,
  ChevronRight,
  Calendar,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/roadmap")({
  head: () => ({
    meta: [
      { title: "Roadmap — EKABA" },
      {
        name: "description",
        content:
          "Three phases from MVP to multilingual enterprise scale. Plus a look at what's next.",
      },
      { property: "og:title", content: "Roadmap — EKABA" },
      { property: "og:description", content: "Where EKABA is today and where it's going." },
    ],
  }),
  component: Roadmap,
});

const phases = [
  {
    p: "Phase 01",
    n: "MVP",
    w: "8 weeks",
    s: "Shipped",
    items: [
      "Knowledge search",
      "Conversational chat",
      "Document upload (PDF / DOCX / PPTX / TXT)",
      "OAuth + SSO",
      "Source citations",
    ],
    details: "Core framework for retrieval-augmented generation and corporate document ingestion.",
  },
  {
    p: "Phase 02",
    n: "Advanced AI",
    w: "6 weeks",
    s: "In progress",
    items: [
      "Feedback-driven re-ranking",
      "Per-team fine-tuning",
      "Analytics dashboard",
      "Slack & Teams integration",
    ],
    details: "Model compounds based on user feedback cycles, integrating where teams already work.",
  },
  {
    p: "Phase 03",
    n: "Enterprise Scale",
    w: "8 weeks",
    s: "Q3 2026",
    items: [
      "Multi-language support",
      "Advanced governance & DLP",
      "On-prem & air-gapped deployment",
      "Custom connectors SDK",
    ],
    details: "Unlocking hybrid deployment, regulatory protection, and deep custom storage links.",
  },
];

const future = [
  "Voice assistant for hands-free knowledge access",
  "Native mobile apps for iOS and Android",
  "Personalized knowledge recommendations",
  "Agentic workflows that take action, not just answer",
  "Predictive suggestions surfaced inside Office and Google Workspace",
];

function RoadmapTimeline3D() {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const items = [
    {
      name: "Phase 1: MVP Core",
      status: "100%",
      detail: "RAG engine, SSO link, PDF upload",
      color: "bg-emerald-500/20 text-emerald-400",
    },
    {
      name: "Phase 2: RAG Fine-tuning",
      status: "45%",
      detail: "Feedback rerank, Slack connector",
      color: "bg-amber-500/20 text-amber-400 animate-pulse",
    },
    {
      name: "Phase 3: Hybrid Deployment",
      status: "0%",
      detail: "Air-gap security, custom API SDK",
      color: "bg-muted text-muted-foreground",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setPhaseIndex((p) => (p + 1) % items.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full screen-3d-wrap max-w-[460px] mx-auto hidden lg:block">
      <div className="screen-3d screen-glow rounded-2xl border border-border/60 bg-card p-6 shadow-2xl overflow-hidden relative">
        <div className="screen-gloss" />
        <div className="scan-line" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
          <div className="flex items-center gap-1.5 font-mono text-[9px] text-muted-foreground">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
            <span className="ml-2">roadmap-delivery-dashboard</span>
          </div>
          <span className="font-mono text-[9px] text-primary font-bold animate-pulse">
            LIVE TRACKER
          </span>
        </div>

        {/* Live checklist items */}
        <div className="space-y-4 font-mono text-xs text-left">
          {items.map((item, i) => {
            const isActive = i === phaseIndex;
            return (
              <div
                key={item.name}
                className={`p-3 rounded-xl border transition-all duration-500 ${
                  isActive
                    ? "border-primary bg-primary/10 shadow-md shadow-primary/10 scale-[1.02]"
                    : "border-border/40 opacity-40 bg-background/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground truncate">{item.name}</span>
                  <span className={`text-[9px] px-2 py-0.5 rounded font-bold ${item.color}`}>
                    {item.status}
                  </span>
                </div>
                {isActive && (
                  <div className="mt-2 text-[9px] text-muted-foreground leading-relaxed animate-fade-in pl-4 border-l border-primary/30">
                    &gt; {item.detail}
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

function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        }),
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" },
    );
    document
      .querySelectorAll(".reveal, .reveal-left, .reveal-right, .reveal-scale")
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

function Roadmap() {
  useScrollReveal();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<
    "All" | "Shipped" | "In progress" | "Upcoming"
  >("All");

  // Filtering phases
  const filteredPhases = phases
    .map((phase) => {
      const statusMatches =
        selectedStatus === "All" ||
        (selectedStatus === "Shipped" && phase.s === "Shipped") ||
        (selectedStatus === "In progress" && phase.s === "In progress") ||
        (selectedStatus === "Upcoming" && phase.s === "Q3 2026");

      if (!statusMatches) return null;

      const query = searchQuery.toLowerCase().trim();
      if (!query) return phase;

      const phaseMatches =
        phase.p.toLowerCase().includes(query) ||
        phase.n.toLowerCase().includes(query) ||
        phase.s.toLowerCase().includes(query);

      const filteredItems = phase.items.filter((item) => item.toLowerCase().includes(query));

      if (phaseMatches || filteredItems.length > 0) {
        return {
          ...phase,
          items: filteredItems.length > 0 ? filteredItems : phase.items,
        };
      }

      return null;
    })
    .filter(Boolean) as typeof phases;

  // Filtering future list
  const filteredFuture = future.filter((item) => {
    const statusMatches = selectedStatus === "All" || selectedStatus === "Upcoming";
    if (!statusMatches) return false;

    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    return item.toLowerCase().includes(query);
  });

  const hasAnyResults = filteredPhases.length > 0 || filteredFuture.length > 0;

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-border/60 min-h-[55vh] flex items-center">
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="absolute -right-60 top-0 h-[600px] w-[600px] rounded-full hero-orb-1 blur-3xl opacity-50" />
        <div className="absolute -left-40 bottom-0 h-[500px] w-[500px] rounded-full hero-orb-2 blur-3xl opacity-40" />

        <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-28 w-full">
          <div className="grid lg:grid-cols-12 gap-16 items-center">
            {/* Left Hand: copy */}
            <div className="lg:col-span-7">
              <div className="reveal inline-flex items-center gap-2 rounded-full badge-glow px-4 py-2 mb-6">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary">
                  Roadmap
                </span>
              </div>
              <h1 className="reveal delay-100 mt-4 max-w-4xl font-display text-7xl leading-[0.95] md:text-8xl">
                A 22-week path to <span className="shimmer-text">enterprise scale.</span>
              </h1>
              <p className="reveal delay-200 mt-8 max-w-2xl text-lg text-muted-foreground leading-relaxed mb-8">
                Three phases, opinionated scope, no roadmap theater. Each phase ships
                production-ready features your team can use the day they release.
              </p>

              {/* Quick links info */}
              <div className="reveal delay-300 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1.5 text-xs font-mono text-primary">
                  <Calendar className="h-3.5 w-3.5" /> 22 weeks total
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/40 px-3.5 py-1.5 text-xs font-mono text-muted-foreground">
                  3 roadmap phases
                </span>
              </div>
            </div>

            {/* Right Hand: 3D Roadmap Timeline */}
            <div className="lg:col-span-5">
              <RoadmapTimeline3D />
            </div>
          </div>
        </div>
      </section>

      {/* ── Toolbar ── */}
      <section className="border-b border-border/60 bg-secondary/20">
        <div className="mx-auto max-w-7xl px-6 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search features (e.g. SSO, feedback, SDK)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-border/60 bg-background/60 pl-10 pr-4 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none transition duration-200"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground mr-1.5">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filter:
            </span>
            {(["All", "Shipped", "In progress", "Upcoming"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium border transition cursor-pointer duration-200 ${
                  selectedStatus === status
                    ? "bg-primary border-primary text-primary-foreground font-semibold shadow-md shadow-primary/20"
                    : "border-border/60 bg-background/60 hover:bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Phases List ── */}
      <section className="border-b border-border/60">
        <div className="mx-auto max-w-7xl px-6 py-24">
          {!hasAnyResults ? (
            <div className="text-center py-16 border border-dashed border-border/60 rounded-xl bg-card/40 max-w-xl mx-auto">
              <p className="font-mono text-sm text-muted-foreground">
                No features matched your search parameters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedStatus("All");
                }}
                className="mt-4 rounded-lg bg-primary/10 px-4 py-2 text-xs font-medium text-primary hover:bg-primary/20 transition cursor-pointer"
              >
                Reset search filters
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {filteredPhases.map((ph, i) => {
                const isShipped = ph.s === "Shipped";
                const isInProgress = ph.s === "In progress";

                return (
                  <div
                    key={ph.p}
                    className="reveal card-3d grid grid-cols-12 gap-6 rounded-2xl border border-border/60 bg-card p-8 transition-all hover:border-primary/30 hover:shadow-2xl relative overflow-hidden"
                    style={{ transitionDelay: `${i * 100}ms` }}
                  >
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/3 to-transparent pointer-events-none" />

                    <div className="col-span-12 md:col-span-4 relative">
                      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                        {ph.p}
                      </span>
                      <h2 className="mt-3 font-display text-5xl text-primary font-semibold">
                        {ph.n}
                      </h2>
                      <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-xs">
                        {ph.details}
                      </p>

                      <div className="mt-6 flex flex-wrap items-center gap-2 text-xs">
                        <span className="rounded-md border border-border bg-secondary/50 px-2.5 py-1 font-mono text-muted-foreground">
                          {ph.w}
                        </span>
                        <span
                          className={`rounded-md px-2.5 py-1 font-mono font-semibold ${
                            isShipped
                              ? "bg-primary/15 text-primary"
                              : isInProgress
                                ? "bg-amber-500/15 text-amber-400 animate-pulse"
                                : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {ph.s}
                        </span>
                      </div>
                    </div>

                    <div className="col-span-12 md:col-span-8 relative">
                      <ul className="grid gap-3 sm:grid-cols-2">
                        {ph.items.map((it) => {
                          const isMatch =
                            searchQuery &&
                            it.toLowerCase().includes(searchQuery.toLowerCase().trim());
                          return (
                            <li
                              key={it}
                              className={`flex items-center gap-3 border-l-2 py-2 pl-4 text-sm rounded-r-lg transition-all duration-300 ${
                                isMatch
                                  ? "border-primary bg-primary/10 font-semibold text-primary"
                                  : "border-primary/30 hover:border-primary/60 bg-secondary/20 hover:bg-secondary/40 text-foreground"
                              }`}
                            >
                              <ChevronRight className="h-3 w-3 text-primary flex-shrink-0" />
                              <span className="truncate">{it}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── Future Section ── */}
      {selectedStatus !== "Shipped" &&
        selectedStatus !== "In progress" &&
        filteredFuture.length > 0 && (
          <section className="border-b border-border/60 bg-secondary/20">
            <div className="mx-auto grid max-w-7xl gap-16 px-6 py-24 md:grid-cols-12">
              <div className="md:col-span-5 reveal-left">
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                  Future enhancements
                </p>
                <h2 className="mt-6 font-display text-5xl leading-tight">
                  What we're <span className="shimmer-text">excited</span> about next.
                </h2>
              </div>
              <div className="md:col-span-7 reveal-right">
                <ul className="space-y-px overflow-hidden rounded-xl border border-border/60 bg-border/40 shadow-xl">
                  {filteredFuture.map((f, i) => {
                    const isMatch =
                      searchQuery && f.toLowerCase().includes(searchQuery.toLowerCase().trim());
                    return (
                      <li
                        key={f}
                        className={`flex items-center gap-5 p-5 transition duration-300 ${
                          isMatch
                            ? "bg-primary/10 font-semibold text-primary"
                            : "bg-background hover:bg-secondary/20"
                        }`}
                      >
                        <span className="font-mono text-xs text-muted-foreground">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
                          <span className="font-display text-2xl">{f}</span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </section>
        )}

      {/* ── CTA ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full hero-orb-1 blur-3xl opacity-40" />
        <div className="relative mx-auto max-w-4xl px-6 py-32 text-center">
          <div className="reveal inline-flex items-center gap-2 rounded-full badge-glow px-4 py-2 mb-8">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary">
              Co-create the future
            </span>
          </div>
          <h2 className="reveal delay-100 font-display text-5xl leading-tight md:text-6xl">
            Have something we <span className="shimmer-text">should build?</span>
          </h2>
          <p className="reveal delay-200 mx-auto mt-6 max-w-xl text-muted-foreground leading-relaxed">
            Design partners shape the next quarter of EKABA. We listen carefully to compliance,
            deployment, and security requirements.
          </p>
          <div className="reveal delay-300 mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/contact"
              className="btn-gradient inline-flex items-center gap-2 rounded-lg px-8 py-4 text-sm font-semibold text-white shadow-xl"
            >
              Become a design partner <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
