import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowUpRight, CheckCircle2, Fingerprint, Key, Lock, Network, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/security")({
  head: () => ({
    meta: [
      { title: "Security & Compliance — EKABA" },
      { name: "description", content: "OAuth 2.0, AES-256, TLS 1.3, role-based access, and compliance with GDPR, SOC 2, ISO 27001, and HIPAA." },
      { property: "og:title", content: "Security & Compliance — EKABA" },
      { property: "og:description", content: "Enterprise-grade controls, audit-ready compliance, and on-prem deployment options." },
    ],
  }),
  component: Security,
});

function ComplianceScanner3D() {
  const [scanStep, setScanStep] = useState(0);
  const checks = [
    { name: "AES-256 Storage Cipher", status: "VALID", info: "row-level disk storage encrypted" },
    { name: "SSO Handshake Security", status: "SECURED", info: "authorized via Okta IDP" },
    { name: "Audit Logging Stream", status: "SYNCED", info: "FIPS 140-2 logging node connected" },
    { name: "SOC 2 Type II Policies", status: "COMPLIANT", info: "integrity validation complete" }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setScanStep(s => (s + 1) % checks.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full screen-3d-wrap max-w-[460px] mx-auto hidden lg:block">
      <div className="screen-3d screen-glow rounded-2xl border border-border/60 bg-card p-6 shadow-2xl overflow-hidden relative">
        <div className="screen-gloss" />
        <div className="scan-line" />
        
        {/* Terminal Header */}
        <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
            <span className="ml-2 font-mono text-[9px] text-muted-foreground">security-compliance-telemetry</span>
          </div>
          <span className="font-mono text-[9px] text-primary font-bold animate-pulse">MONITORING</span>
        </div>

        {/* Live scanning visualization */}
        <div className="space-y-4 font-mono text-xs text-left">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground pb-1">
            <span>COMPLIANCE RULESET</span>
            <span>STATUS</span>
          </div>
          {checks.map((check, i) => {
            const isScanning = i === scanStep;
            return (
              <div 
                key={check.name}
                className={`p-3 rounded-xl border transition-all duration-500 ${
                  isScanning 
                    ? "border-primary bg-primary/10 shadow-md shadow-primary/10 scale-[1.02]" 
                    : "border-border/40 opacity-40 bg-background/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground truncate">{check.name}</span>
                  <span className={`text-[9px] px-2 py-0.5 rounded font-bold ${
                    isScanning ? "bg-emerald-500/20 text-emerald-400 animate-pulse" : "bg-muted text-muted-foreground"
                  }`}>
                    {check.status}
                  </span>
                </div>
                {isScanning && (
                  <div className="mt-2 text-[9px] text-muted-foreground leading-relaxed animate-fade-in pl-4 border-l border-primary/30">
                    &gt; {check.info}
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
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
    );
    document.querySelectorAll(".reveal, .reveal-left, .reveal-right, .reveal-scale").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

function Security() {
  useScrollReveal();

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
      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-border/60 min-h-[60vh] flex items-center">
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="absolute -right-60 top-0 h-[600px] w-[600px] rounded-full hero-orb-1 blur-3xl opacity-50" />
        <div className="absolute -left-40 bottom-0 h-[500px] w-[500px] rounded-full hero-orb-2 blur-3xl opacity-40" />

        <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-28 w-full">
          <div className="grid lg:grid-cols-12 gap-16 items-center">
            {/* Left Hand: copy */}
            <div className="lg:col-span-7">
              <div className="reveal inline-flex items-center gap-2 rounded-full badge-glow px-4 py-2 mb-6">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary">Security & compliance</span>
              </div>
              <h1 className="reveal delay-100 mt-4 max-w-4xl font-display text-7xl leading-[0.95] md:text-8xl">
                Built for the{" "}
                <span className="shimmer-text">regulated</span>{" "}
                enterprise.
              </h1>
              <p className="reveal delay-200 mt-8 max-w-2xl text-lg text-muted-foreground leading-relaxed mb-8">
                EKABA was designed to pass the same procurement and security reviews you put your core systems through. Here's exactly how.
              </p>

              {/* Compliance badges */}
              <div className="reveal delay-300 flex flex-wrap gap-3">
                {["GDPR", "SOC 2 Type II", "ISO 27001", "HIPAA"].map((badge) => (
                  <span key={badge} className="glass-card inline-flex items-center gap-2 rounded-full border border-primary/20 px-4 py-2 text-sm font-mono text-primary">
                    <ShieldCheck className="h-3.5 w-3.5" />{badge}
                  </span>
                ))}
              </div>
            </div>

            {/* Right Hand: 3D Compliance Scanner simulation */}
            <div className="lg:col-span-5">
              <ComplianceScanner3D />
            </div>
          </div>

          {/* Security pillars */}
          <div className="reveal delay-400 mt-16 grid gap-px overflow-hidden rounded-xl border border-border/60 bg-border/40 md:grid-cols-4 shadow-xl">
            {pillars.map(({ icon: Icon, t, d }, i) => (
              <div
                key={t}
                className="card-3d group bg-background/80 backdrop-blur-sm p-8 hover:bg-secondary/30 transition-all relative overflow-hidden"
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/0 via-primary/60 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="icon-ring grid h-10 w-10 place-items-center rounded-lg border border-primary/20 bg-primary/10 group-hover:bg-primary/20 transition-colors mb-6">
                  <Icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
                </div>
                <h3 className="font-display text-2xl group-hover:text-primary transition-colors">{t}</h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Compliance ── */}
      <section className="border-b border-border/60 bg-secondary/20">
        <div className="mx-auto grid max-w-7xl gap-16 px-6 py-24 md:grid-cols-12">
          <div className="md:col-span-5 reveal-left">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">01 — Compliance</p>
            <h2 className="mt-6 font-display text-5xl leading-tight">Frameworks we already pass.</h2>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              Audit reports and DPAs available under NDA to qualified prospects.
            </p>
            <Link to="/contact" className="mt-8 btn-gradient inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-white">
              Request security pack <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="md:col-span-7 space-y-px overflow-hidden rounded-xl border border-border/60 bg-border/40 shadow-xl reveal-right">
            {compliance.map(([t, d], i) => (
              <div
                key={t}
                className="reveal group flex items-start gap-5 bg-background/80 p-6 hover:bg-secondary/30 transition-colors"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="mt-0.5 grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors">
                  <ShieldCheck className="h-4 w-4 text-primary" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-display text-2xl group-hover:text-primary transition-colors">{t}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Risk Register ── */}
      <section className="border-b border-border/60">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="reveal">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">02 — Risk register</p>
            <h2 className="mt-6 max-w-2xl font-display text-5xl leading-tight">
              The risks we worry about — and what we do about them.
            </h2>
          </div>

          <div className="mt-14 overflow-hidden rounded-xl border border-border/60 shadow-xl">
            <div className="grid grid-cols-12 gap-4 border-b border-border bg-secondary/50 px-6 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              <div className="col-span-4">Risk</div>
              <div className="col-span-2">Impact</div>
              <div className="col-span-6">Mitigation</div>
            </div>
            {risks.map(([r, m], i) => (
              <div
                key={r}
                className="reveal group grid grid-cols-12 items-center gap-4 border-b border-border/60 bg-background px-6 py-5 text-sm last:border-b-0 hover:bg-secondary/20 transition-colors"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="col-span-4 font-display text-xl group-hover:text-primary transition-colors">{r}</div>
                <div className="col-span-2">
                  <span className={`rounded-md px-2 py-1 font-mono text-[10px] uppercase ${i === 2 ? "bg-amber-500/15 text-amber-400" : "bg-primary/15 text-primary"}`}>
                    {i === 2 ? "Medium" : "High"}
                  </span>
                </div>
                <div className="col-span-6 flex items-start gap-2 text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                  {m}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full hero-orb-1 blur-3xl opacity-40" />
        <div className="relative mx-auto max-w-4xl px-6 py-32 text-center">
          <div className="reveal inline-flex items-center gap-2 rounded-full badge-glow px-4 py-2 mb-8">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary">Audit docs available</span>
          </div>
          <h2 className="reveal delay-100 font-display text-5xl leading-tight md:text-6xl">
            Need our{" "}
            <span className="shimmer-text">SOC 2 report?</span>
          </h2>
          <p className="reveal delay-200 mx-auto mt-6 max-w-xl text-muted-foreground leading-relaxed">
            Tell us a bit about your environment and we'll send the relevant documentation and an NDA.
          </p>
          <div className="reveal delay-300 mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/contact" className="btn-gradient inline-flex items-center gap-2 rounded-lg px-8 py-4 text-sm font-semibold text-white shadow-xl">
              Request security pack <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link to="/platform" className="inline-flex items-center gap-2 rounded-lg border border-border px-8 py-4 text-sm font-medium hover:bg-secondary transition-all hover:shadow-md">
              View platform details
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
