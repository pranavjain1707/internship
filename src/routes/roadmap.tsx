import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowUpRight, Search, SlidersHorizontal } from "lucide-react";

export const Route = createFileRoute("/roadmap")({
  head: () => ({
    meta: [
      { title: "Roadmap — EKBA" },
      {
        name: "description",
        content:
          "Three phases from MVP to multilingual enterprise scale. Plus a look at what's next.",
      },
      { property: "og:title", content: "Roadmap — EKBA" },
      { property: "og:description", content: "Where EKBA is today and where it's going." },
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
  },
];

const future = [
  "Voice assistant for hands-free knowledge access",
  "Native mobile apps for iOS and Android",
  "Personalized knowledge recommendations",
  "Agentic workflows that take action, not just answer",
  "Predictive suggestions surfaced inside Office and Google Workspace",
];

function Roadmap() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<
    "All" | "Shipped" | "In progress" | "Upcoming"
  >("All");

  // Filtering phases
  const filteredPhases = phases
    .map((phase) => {
      // Check status match
      const statusMatches =
        selectedStatus === "All" ||
        (selectedStatus === "Shipped" && phase.s === "Shipped") ||
        (selectedStatus === "In progress" && phase.s === "In progress") ||
        (selectedStatus === "Upcoming" && phase.s === "Q3 2026");

      if (!statusMatches) return null;

      // Check search match
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
    // Only show future list if "All" or "Upcoming" is selected
    const statusMatches = selectedStatus === "All" || selectedStatus === "Upcoming";
    if (!statusMatches) return false;

    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    return item.toLowerCase().includes(query);
  });

  const hasAnyResults = filteredPhases.length > 0 || filteredFuture.length > 0;

  return (
    <div>
      <section className="border-b border-border/60">
        <div className="mx-auto max-w-7xl px-6 pb-20 pt-24">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            Roadmap
          </p>
          <h1 className="mt-6 max-w-4xl font-display text-7xl leading-[0.95]">
            A 22-week path to <em className="text-primary">enterprise scale.</em>
          </h1>
          <p className="mt-8 max-w-2xl text-lg text-muted-foreground">
            Three phases, opinionated scope, no roadmap theater. Each phase ships production-ready
            features your team can use the day they release.
          </p>
        </div>
      </section>

      {/* Real-time Search and Category Filter Toolbar */}
      <section className="border-b border-border/60 bg-secondary/30">
        <div className="mx-auto max-w-7xl px-6 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search features (e.g. SSO, feedback, SDK)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-border bg-background pl-10 pr-4 py-2 text-sm placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none transition duration-200"
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
                    ? "bg-primary border-primary text-primary-foreground font-semibold"
                    : "border-border bg-background hover:bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Phases List */}
      <section className="border-b border-border/60">
        <div className="mx-auto max-w-7xl px-6 py-24">
          {!hasAnyResults ? (
            <div className="text-center py-16 border border-dashed border-border rounded-lg bg-card/40 max-w-xl mx-auto">
              <p className="font-mono text-sm text-muted-foreground">
                No features matched your search parameters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedStatus("All");
                }}
                className="mt-4 rounded bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition cursor-pointer"
              >
                Reset search filters
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredPhases.map((ph) => {
                const isShipped = ph.s === "Shipped";
                const isInProgress = ph.s === "In progress";

                return (
                  <div
                    key={ph.p}
                    className="grid grid-cols-12 gap-6 rounded-lg border border-border bg-card p-8 transition-all hover:shadow-md duration-300"
                  >
                    <div className="col-span-12 md:col-span-3">
                      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                        {ph.p}
                      </span>
                      <h2 className="mt-3 font-display text-5xl text-primary">{ph.n}</h2>
                      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                        <span className="rounded border border-border bg-secondary/50 px-2 py-1 font-mono text-muted-foreground">
                          {ph.w}
                        </span>
                        <span
                          className={`rounded px-2 py-1 font-mono ${
                            isShipped
                              ? "bg-primary/15 text-primary"
                              : isInProgress
                                ? "bg-accent/20 text-accent-foreground animate-pulse"
                                : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {ph.s}
                        </span>
                      </div>
                    </div>
                    <div className="col-span-12 md:col-span-9">
                      <ul className="grid gap-3 md:grid-cols-2">
                        {ph.items.map((it) => {
                          const isMatch =
                            searchQuery &&
                            it.toLowerCase().includes(searchQuery.toLowerCase().trim());
                          return (
                            <li
                              key={it}
                              className={`flex items-start gap-3 border-l-2 py-1.5 pl-4 text-sm transition duration-300 ${
                                isMatch
                                  ? "border-primary bg-primary/5 font-medium"
                                  : "border-primary/40 text-foreground"
                              }`}
                            >
                              {it}
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

      {/* Future Section (Only if status filter matches or results exist) */}
      {selectedStatus !== "Shipped" &&
        selectedStatus !== "In progress" &&
        filteredFuture.length > 0 && (
          <section className="border-b border-border/60 bg-secondary/30">
            <div className="mx-auto grid max-w-7xl gap-16 px-6 py-24 md:grid-cols-12">
              <div className="md:col-span-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                  Future enhancements
                </p>
                <h2 className="mt-6 font-display text-5xl leading-tight font-light">
                  What we're <em className="text-primary">excited</em> about next.
                </h2>
              </div>
              <div className="md:col-span-7">
                <ul className="space-y-px overflow-hidden rounded-lg border border-border/60 bg-border/60">
                  {filteredFuture.map((f, i) => {
                    const isMatch =
                      searchQuery && f.toLowerCase().includes(searchQuery.toLowerCase().trim());
                    return (
                      <li
                        key={f}
                        className={`flex items-baseline gap-5 p-5 transition duration-300 ${
                          isMatch ? "bg-primary/5 font-medium" : "bg-background"
                        }`}
                      >
                        <span className="font-mono text-xs text-muted-foreground">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="font-display text-2xl">{f}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </section>
        )}

      <section className="border-b border-border/60">
        <div className="mx-auto max-w-4xl px-6 py-24 text-center">
          <h2 className="font-display text-5xl">Have something we should build?</h2>
          <p className="mx-auto mt-6 max-w-xl text-muted-foreground">
            Design partners shape the next quarter of EKBA. We listen carefully.
          </p>
          <Link
            to="/contact"
            className="mt-8 inline-flex items-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Become a design partner
          </Link>
        </div>
      </section>
    </div>
  );
}
