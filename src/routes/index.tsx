import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, FileText, MessageSquare, Search, Shield, Sparkles, Zap } from "lucide-react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/")({
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
});

function Home() {
  return (
    <div>
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
    <section className="relative overflow-hidden border-b border-border/60">
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div className="absolute -right-40 top-20 h-[500px] w-[500px] rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -left-40 bottom-0 h-[400px] w-[400px] rounded-full bg-accent/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6 pb-28 pt-24 md:pt-32">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
          Now generally available · Enterprise tier
        </div>

        <h1 className="mt-8 max-w-5xl text-balance font-display text-6xl leading-[0.95] md:text-8xl">
          The answer is already <em className="text-primary">inside</em> your company.
          <br />
          <span className="text-muted-foreground">We just help you find it.</span>
        </h1>

        <p className="mt-8 max-w-xl text-lg text-muted-foreground">
          EKABA is a retrieval-augmented assistant that reads every PDF, wiki, deck, and policy your
          organization owns — then answers in plain language, with citations.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link
            to="/contact"
            className="group inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Request a demo
            <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
          <Link
            to="/portal"
            className="inline-flex items-center gap-2 rounded-md border border-primary bg-primary/5 px-6 py-3 text-sm font-medium hover:bg-primary/10 text-primary transition"
          >
            Login to Portal
          </Link>
          <Link
            to="/platform"
            className="inline-flex items-center gap-2 rounded-md border border-border px-6 py-3 text-sm font-medium hover:bg-secondary"
          >
            See how it works
          </Link>
        </div>

        <div className="mt-20 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border/60 bg-border/60 md:grid-cols-4">
          {[
            ["80%", "Faster retrieval"],
            ["90%", "Search accuracy"],
            ["< 3s", "Response time"],
            ["10K+", "Concurrent users"],
          ].map(([n, l]) => (
            <div key={l} className="bg-background p-6">
              <div className="font-display text-4xl text-primary">{n}</div>
              <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                {l}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stats() {
  return (
    <section className="border-b border-border/60 bg-secondary/30">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <p className="text-center font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          Designed for the enterprises that already trust
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-12 gap-y-4 font-display text-2xl text-muted-foreground/70">
          <span>Microsoft 365</span>
          <span>·</span>
          <span>SharePoint</span>
          <span>·</span>
          <span>Confluence</span>
          <span>·</span>
          <span>Notion</span>
          <span>·</span>
          <span>Google Workspace</span>
          <span>·</span>
          <span>Slack</span>
        </div>
      </div>
    </section>
  );
}

function Problem() {
  return (
    <section className="border-b border-border/60">
      <div className="mx-auto grid max-w-7xl gap-16 px-6 py-28 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            01 — The problem
          </p>
          <h2 className="mt-6 font-display text-5xl leading-tight">
            Your company doesn't have a knowledge problem. It has a{" "}
            <em className="text-primary">retrieval</em> problem.
          </h2>
        </div>
        <div className="md:col-span-7">
          <p className="text-lg text-muted-foreground">
            Critical information lives in PDFs, SharePoint folders, Confluence wikis, Slack threads,
            and the heads of senior staff. Employees spend an average of 2.5 hours a day looking for
            it.
          </p>
          <div className="mt-10 space-y-px">
            {[
              ["Knowledge silos", "Departments hoard expertise in tools no one else opens."],
              ["Duplicate work", "Teams rebuild documents that already exist three folders away."],
              ["Slow onboarding", "New hires take weeks to learn what veterans answer in seconds."],
              ["Inconsistent answers", "Two employees, same question, two different policies."],
              ["Lost expertise", "When people leave, their knowledge leaves with them."],
            ].map(([t, d]) => (
              <div key={t} className="group flex gap-6 border-b border-border/60 py-5">
                <span className="font-mono text-xs text-muted-foreground">→</span>
                <div className="flex-1">
                  <h3 className="font-display text-2xl">{t}</h3>
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
    <section className="border-b border-border/60 bg-secondary/30">
      <div className="mx-auto grid max-w-7xl gap-16 px-6 py-28 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            02 — The interface
          </p>
          <h2 className="mt-6 font-display text-5xl leading-tight">
            Ask in English. Get answers with receipts.
          </h2>
          <p className="mt-6 text-muted-foreground">
            Every response is grounded in your documents and cites the exact source — file, page,
            and section. No hallucinations. No "I'm not sure."
          </p>
        </div>
        <div className="md:col-span-7">
          <div className="rounded-xl border border-border bg-card p-2 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rust/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
                <span className="h-2.5 w-2.5 rounded-full bg-lime/60" />
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                ekaba · live
              </span>
            </div>

            <div className="space-y-5 p-6">
              <div className="flex justify-end">
                <div className="max-w-md rounded-2xl rounded-br-sm border border-border bg-background px-4 py-3 text-sm">
                  What is the leave approval process for new employees?
                </div>
              </div>

              <div className="flex gap-3">
                <div className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
                <div className="max-w-xl space-y-3 text-sm">
                  <p className="text-foreground">
                    The leave approval process requires three steps:
                  </p>
                  <ol className="space-y-1.5 pl-5 text-muted-foreground">
                    <li>1. Submit a request through the HRMS portal.</li>
                    <li>2. Receive manager approval within 48 hours.</li>
                    <li>3. HR verifies eligibility and confirms balance.</li>
                  </ol>
                  <div className="!mt-4 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 font-mono text-[10px] text-muted-foreground">
                      <FileText className="h-3 w-3" />
                      Employee Handbook · §4.2
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 font-mono text-[10px] text-muted-foreground">
                      <FileText className="h-3 w-3" />
                      HRMS_Guide_2025.pdf · p.12
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 border-t border-border bg-background/50 px-4 py-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <span className="flex-1 text-sm text-muted-foreground">
                Ask EKABA anything about your company…
              </span>
              <kbd className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px]">
                ⌘ K
              </kbd>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Pillars() {
  const items = [
    {
      icon: Search,
      t: "Semantic search",
      d: "Vector embeddings understand intent, not just keywords.",
    },
    {
      icon: MessageSquare,
      t: "Conversational UI",
      d: "Natural follow-ups. Context carries across the thread.",
    },
    {
      icon: FileText,
      t: "Document intelligence",
      d: "Ingest PDFs, DOCX, PPTX, and TXT. We handle the rest.",
    },
    {
      icon: Shield,
      t: "Source citations",
      d: "Every answer links back to the file, page, and section.",
    },
    {
      icon: Zap,
      t: "Sub-3-second answers",
      d: "Engineered for retrieval at enterprise volume and latency.",
    },
    {
      icon: Sparkles,
      t: "Feedback learning",
      d: "Thumbs up, thumbs down, reports. Quality compounds.",
    },
  ];
  return (
    <section className="border-b border-border/60">
      <div className="mx-auto max-w-7xl px-6 py-28">
        <div className="flex items-end justify-between gap-8">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              03 — What's inside
            </p>
            <h2 className="mt-6 max-w-2xl font-display text-5xl leading-tight">
              Six things every enterprise assistant should do. Most don't.
            </h2>
          </div>
          <Link
            to="/platform"
            className="hidden shrink-0 items-center gap-1.5 text-sm text-muted-foreground hover:text-primary md:inline-flex"
          >
            All capabilities <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-14 grid gap-px overflow-hidden rounded-lg border border-border/60 bg-border/60 md:grid-cols-3">
          {items.map(({ icon: Icon, t, d }) => (
            <div key={t} className="group bg-background p-8 transition hover:bg-secondary/40">
              <Icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
              <h3 className="mt-6 font-display text-2xl">{t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{d}</p>
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
    ["Retrieve", "Most relevant chunks pulled from the vector store."],
    ["Context", "Passages and metadata fed to the LLM."],
    ["Generate", "Grounded response composed."],
    ["Cite", "Sources attached to every claim."],
  ];
  return (
    <section className="border-b border-border/60 bg-secondary/30">
      <div className="mx-auto max-w-7xl px-6 py-28">
        <div className="max-w-2xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            04 — Architecture
          </p>
          <h2 className="mt-6 font-display text-5xl leading-tight">
            Retrieval-augmented generation, end to end.
          </h2>
          <p className="mt-6 text-muted-foreground">
            RAG keeps answers tied to source material. No fabricated quotes, no out-of-date policies
            — just the document, retrieved.
          </p>
        </div>

        <div className="mt-16 grid gap-px overflow-hidden rounded-lg border border-border/60 bg-border/60 md:grid-cols-6">
          {steps.map(([t, d], i) => (
            <div key={t} className="relative bg-background p-6">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Step {String(i + 1).padStart(2, "0")}
              </div>
              <h3 className="mt-4 font-display text-2xl text-primary">{t}</h3>
              <p className="mt-2 text-xs text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Personas() {
  const people = [
    { r: "Employees", n: "Get answers without pinging five people on Slack." },
    { r: "Managers", n: "Pull team processes and historical context in seconds." },
    { r: "HR officers", n: "Stop re-explaining policy. Let EKABA handle the FAQs." },
    { r: "IT admins", n: "Granular roles, audit logs, and SSO control on day one." },
  ];
  return (
    <section className="border-b border-border/60">
      <div className="mx-auto max-w-7xl px-6 py-28">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          05 — Built for everyone
        </p>
        <h2 className="mt-6 max-w-3xl font-display text-5xl leading-tight">
          One assistant. Every role.
        </h2>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {people.map(({ r, n }, i) => (
            <div key={r} className="rounded-lg border border-border bg-card p-6">
              <span className="font-mono text-[10px] text-muted-foreground">0{i + 1}</span>
              <h3 className="mt-6 font-display text-3xl">{r}</h3>
              <p className="mt-3 text-sm text-muted-foreground">{n}</p>
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
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative mx-auto max-w-4xl px-6 py-32 text-center">
        <h2 className="font-display text-6xl leading-[1] md:text-7xl">
          Stop searching.
          <br />
          <em className="text-primary">Start asking.</em>
        </h2>
        <p className="mx-auto mt-8 max-w-xl text-muted-foreground">
          Book a 30-minute demo and see EKABA answer questions about your own documents within the
          call.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Request demo <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link
            to="/security"
            className="inline-flex items-center gap-2 rounded-md border border-border px-6 py-3 text-sm hover:bg-secondary"
          >
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
    <section className="border-b border-border/60 bg-secondary/30">
      <div className="mx-auto max-w-4xl px-6 py-28">
        <div className="text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            06 — F.A.Q.
          </p>
          <h2 className="mt-6 font-display text-5xl leading-tight">
            Frequently asked <em className="text-primary">questions</em>
          </h2>
          <p className="mt-4 text-sm text-muted-foreground">
            Have questions about security, setup, or accuracy? We've got you covered.
          </p>
        </div>

        <div className="mt-16">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="border border-border bg-card px-6 py-1 rounded-lg"
              >
                <AccordionTrigger className="font-display text-2xl hover:text-primary hover:no-underline py-4">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pt-2 pb-6">
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
