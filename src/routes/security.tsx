import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Fingerprint, Key, Lock, Network, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/security")({
  head: () => ({
    meta: [
      { title: "Security & Compliance — EKBA" },
      { name: "description", content: "OAuth 2.0, AES-256, TLS 1.3, role-based access, and compliance with GDPR, SOC 2, ISO 27001, and HIPAA." },
      { property: "og:title", content: "Security & Compliance — EKBA" },
      { property: "og:description", content: "Enterprise-grade controls, audit-ready compliance, and on-prem deployment options." },
    ],
  }),
  component: Security,
});

function Security() {
  const pillars = [
    { icon: Key, t: "Authentication", d: "OAuth 2.0, SAML SSO, OIDC, and multi-factor authentication out of the box." },
    { icon: Fingerprint, t: "Authorization", d: "Role-based access control scoped to documents, folders, and individual passages." },
    { icon: Lock, t: "Data encryption", d: "AES-256 at rest, TLS 1.3 in transit, customer-managed keys on enterprise tier." },
    { icon: Network, t: "Network security", d: "Private VPC, IP allow-listing, VPN tunneling, and on-prem deployment available." },
  ];

  const compliance = [
    ["GDPR", "EU data residency, right-to-erasure, and processor agreements in place."],
    ["SOC 2 Type II", "Annual audit covering security, availability, and confidentiality."],
    ["ISO 27001", "Certified information security management system."],
    ["HIPAA", "Available as an add-on for regulated healthcare environments."],
  ];

  const risks = [
    ["Hallucination", "Retrieval-augmented generation grounds every response in your documents."],
    ["Data leakage", "End-to-end encryption with row-level access control and full audit trail."],
    ["Low adoption", "Embeddable widgets and Slack/Teams integration meet users where they work."],
    ["Poor results", "Continuous feedback loop and domain-specific fine-tuning."],
  ];

  return (
    <div>
      <section className="border-b border-border/60">
        <div className="mx-auto max-w-7xl px-6 pb-20 pt-24">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Security & compliance</p>
          <h1 className="mt-6 max-w-4xl font-display text-7xl leading-[0.95]">Built for the <em className="text-primary">regulated</em> enterprise.</h1>
          <p className="mt-8 max-w-2xl text-lg text-muted-foreground">
            EKBA was designed to pass the same procurement and security reviews you put your core systems through. Here's exactly how.
          </p>

          <div className="mt-16 grid gap-px overflow-hidden rounded-lg border border-border/60 bg-border/60 md:grid-cols-4">
            {pillars.map(({ icon: Icon, t, d }) => (
              <div key={t} className="bg-background p-8">
                <Icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
                <h3 className="mt-6 font-display text-2xl">{t}</h3>
                <p className="mt-3 text-sm text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border/60 bg-secondary/30">
        <div className="mx-auto grid max-w-7xl gap-16 px-6 py-24 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Compliance</p>
            <h2 className="mt-6 font-display text-5xl leading-tight">Frameworks we already pass.</h2>
            <p className="mt-6 text-muted-foreground">Audit reports and DPAs available under NDA to qualified prospects.</p>
          </div>
          <div className="md:col-span-7 space-y-px overflow-hidden rounded-lg border border-border/60 bg-border/60">
            {compliance.map(([t, d]) => (
              <div key={t} className="flex items-start gap-5 bg-background p-6">
                <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-primary" strokeWidth={1.5} />
                <div>
                  <h3 className="font-display text-2xl">{t}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border/60">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Risk register</p>
          <h2 className="mt-6 max-w-2xl font-display text-5xl leading-tight">The risks we worry about — and what we do about them.</h2>

          <div className="mt-14 overflow-hidden rounded-lg border border-border">
            <div className="grid grid-cols-12 gap-4 border-b border-border bg-secondary/50 px-6 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              <div className="col-span-4">Risk</div>
              <div className="col-span-2">Impact</div>
              <div className="col-span-6">Mitigation</div>
            </div>
            {risks.map(([r, m], i) => (
              <div key={r} className="grid grid-cols-12 items-center gap-4 border-b border-border bg-background px-6 py-5 text-sm last:border-b-0">
                <div className="col-span-4 font-display text-xl">{r}</div>
                <div className="col-span-2">
                  <span className={`rounded px-2 py-1 font-mono text-[10px] uppercase ${i === 2 ? "bg-rust/15 text-rust" : "bg-primary/15 text-primary"}`}>
                    {i === 2 ? "Medium" : "High"}
                  </span>
                </div>
                <div className="col-span-6 flex items-start gap-2 text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {m}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="relative mx-auto max-w-4xl px-6 py-24 text-center">
          <h2 className="font-display text-5xl">Need our SOC 2 report?</h2>
          <p className="mx-auto mt-6 max-w-xl text-muted-foreground">
            Tell us a bit about your environment and we'll send the relevant documentation and an NDA.
          </p>
          <Link to="/contact" className="mt-8 inline-flex items-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90">
            Request security pack
          </Link>
        </div>
      </section>
    </div>
  );
}
