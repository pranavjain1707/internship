import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowUpRight, Building2, Mail, MapPin, Sparkles, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { useForm, UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — EKABA" },
      {
        name: "description",
        content:
          "Talk to our team about deploying EKABA in your organization. Demos, pricing, and procurement.",
      },
      { property: "og:title", content: "Contact — EKABA" },
      {
        property: "og:description",
        content: "Request a demo, security pack, or technical walkthrough.",
      },
    ],
  }),
  component: Contact,
});

const contactFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid work email" }),
  company: z.string().min(1, { message: "Company name is required" }),
  role: z.string().min(1, { message: "Role is required" }),
  size: z.enum(["1–50", "51–500", "501–5K", "5K+"], {
    errorMap: () => ({ message: "Please select your company size" }),
  }),
  message: z.string().min(10, { message: "Please share a bit more detail (min 10 chars)" }),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

function DemoBooking3D() {
  const [stage, setStage] = useState(0);
  const steps = [
    { title: "Select Session Date", detail: "Jul 10, 2026 at 2:00 PM EST" },
    { title: "Enter Meeting Details", detail: "Asha Mehta (Acme Corp)" },
    { title: "Confirm Calendar Invitation", detail: "Invitation sent. Check inbox." },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setStage((s) => (s + 1) % steps.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full screen-3d-wrap max-w-[460px] mx-auto hidden lg:block my-6">
      <div className="screen-3d screen-glow rounded-2xl border border-border/60 bg-card p-6 shadow-2xl overflow-hidden relative">
        <div className="screen-gloss" />
        <div className="scan-line" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
          <div className="flex items-center gap-1.5 font-mono text-[9px] text-muted-foreground">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
            <span className="ml-2">calendar-schedule-assistant</span>
          </div>
          <span className="font-mono text-[9px] text-primary font-bold animate-pulse">BOOKING</span>
        </div>

        {/* Live booking steps */}
        <div className="space-y-4 font-mono text-xs text-left">
          {steps.map((step, i) => {
            const isActive = i === stage;
            return (
              <div
                key={step.title}
                className={`p-3 rounded-xl border transition-all duration-500 ${
                  isActive
                    ? "border-primary bg-primary/10 shadow-md shadow-primary/10 scale-[1.02]"
                    : "border-border/40 opacity-40 bg-background/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground truncate">{step.title}</span>
                  <span className="text-[9px] text-muted-foreground">0{i + 1}</span>
                </div>
                {isActive && (
                  <div className="mt-2 text-[9px] text-muted-foreground leading-relaxed animate-fade-in pl-4 border-l border-primary/30">
                    &gt; {step.detail}
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

function Contact() {
  useScrollReveal();
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { name: "", email: "", company: "", role: "", size: undefined, message: "" },
  });

  const selectedSize = watch("size");

  const onSubmit = async (data: ContactFormValues) => {
    try {
      const res = await fetch("/api/demo-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setSent(true);
        toast.success(
          "Thanks, " +
            data.name +
            "! Your demo request was received. An email confirmation has been simulated.",
        );
        reset();
      } else {
        toast.error("Failed to submit demo request.");
      }
    } catch (e) {
      toast.error("Network error. Please try again.");
    }
  };

  return (
    <div>
      <Toaster />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-border/60 min-h-[50vh] flex items-center">
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="absolute -right-40 top-0 h-[500px] w-[500px] rounded-full hero-orb-1 blur-3xl opacity-40" />
        <div className="absolute -left-40 bottom-0 h-[400px] w-[400px] rounded-full hero-orb-2 blur-3xl opacity-30" />

        <div className="relative mx-auto grid max-w-7xl gap-16 px-6 pb-20 pt-24 md:grid-cols-12 w-full">
          <div className="md:col-span-5">
            <div className="reveal inline-flex items-center gap-2 rounded-full badge-glow px-4 py-2 mb-6">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary">
                Talk to us
              </span>
            </div>
            <h1 className="reveal delay-100 mt-4 font-display text-6xl leading-[0.95] md:text-7xl">
              Let's see EKABA <span className="shimmer-text">answer</span> a question about your
              documents.
            </h1>
            <p className="reveal delay-200 mt-8 max-w-md text-muted-foreground leading-relaxed">
              30-minute working session. Bring a sample document and a question. Leave with a
              working assistant.
            </p>

            <div className="reveal delay-300 mt-12 space-y-5 border-t border-border/60 pt-8">
              {[
                { icon: Mail, label: "Email", value: "hello@ekaba.ai" },
                { icon: Building2, label: "Sales", value: "enterprise@ekaba.ai" },
                { icon: MapPin, label: "HQ", value: "Bengaluru · Singapore · Remote" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-4 group">
                  <div className="mt-0.5 grid h-8 w-8 place-items-center rounded-lg bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      {label}
                    </p>
                    <p className="mt-1 text-sm">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Mini social proof */}
            <div className="reveal delay-400 mt-10 flex flex-wrap gap-3">
              {["SOC 2 Certified", "GDPR Ready", "< 3s Answers"].map((badge) => (
                <span
                  key={badge}
                  className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-mono text-primary"
                >
                  <CheckCircle2 className="h-3 w-3" />
                  {badge}
                </span>
              ))}
            </div>

            <DemoBooking3D />
          </div>

          <div className="md:col-span-7 reveal-right">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="card-3d rounded-2xl border border-border/60 bg-card p-8 shadow-2xl relative overflow-hidden"
              noValidate
            >
              {/* Form gloss */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />

              <div className="relative">
                <div className="flex items-center gap-2 mb-6">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-primary">
                    Request a Demo
                  </span>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <Field
                    label="Full name"
                    id="name"
                    placeholder="Asha Mehta"
                    error={errors.name?.message}
                    registration={register("name")}
                  />
                  <Field
                    label="Work email"
                    id="email"
                    type="email"
                    placeholder="asha@company.com"
                    error={errors.email?.message}
                    registration={register("email")}
                  />
                  <Field
                    label="Company"
                    id="company"
                    placeholder="Acme Corp"
                    error={errors.company?.message}
                    registration={register("company")}
                  />
                  <Field
                    label="Role"
                    id="role"
                    placeholder="Head of IT"
                    error={errors.role?.message}
                    registration={register("role")}
                  />
                </div>

                <div className="mt-5">
                  <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    Company size
                  </label>
                  <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-4">
                    {(["1–50", "51–500", "501–5K", "5K+"] as const).map((s) => (
                      <label key={s} className="cursor-pointer">
                        <input
                          type="radio"
                          value={s}
                          {...register("size")}
                          className="peer sr-only"
                        />
                        <div
                          className={`rounded-lg border px-3 py-2.5 text-center text-sm transition-all duration-200 hover:border-primary/40 ${selectedSize === s ? "border-primary bg-primary/10 text-primary font-medium shadow-sm shadow-primary/20" : "border-border/60 bg-background/60 text-foreground"}`}
                        >
                          {s}
                        </div>
                      </label>
                    ))}
                  </div>
                  {errors.size && (
                    <p className="mt-1 text-[11px] text-destructive font-mono">
                      {errors.size.message}
                    </p>
                  )}
                </div>

                <div className="mt-5">
                  <label
                    htmlFor="message"
                    className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
                  >
                    What would you like to discuss?
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    placeholder="A bit about the systems your team works in today, and what you'd love to fix."
                    {...register("message")}
                    className={`mt-2 w-full rounded-lg border bg-background/60 px-3 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none transition-colors ${errors.message ? "border-destructive" : "border-border/60"}`}
                  />
                  {errors.message && (
                    <p className="mt-1 text-[11px] text-destructive font-mono">
                      {errors.message.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-gradient mt-8 inline-flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3.5 text-sm font-semibold text-white shadow-lg disabled:opacity-60 cursor-pointer"
                >
                  {sent ? (
                    "Message sent ✓"
                  ) : (
                    <>
                      <span>Send message</span>
                      <ArrowUpRight className="h-4 w-4" />
                    </>
                  )}
                </button>
                <p className="mt-4 text-center text-xs text-muted-foreground">
                  We reply within one business day. No marketing sequences.
                </p>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="border-b border-border/60 bg-secondary/20">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="reveal grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border/60 bg-border/40 md:grid-cols-4 shadow-lg">
            {[
              ["30 min", "Demo length"],
              ["1 day", "Response time"],
              ["0", "Marketing emails"],
              ["∞", "Questions answered"],
            ].map(([n, l]) => (
              <div
                key={l}
                className="bg-background/80 backdrop-blur-sm p-6 group hover:bg-secondary/30 transition-colors text-center"
              >
                <div className="stat-number font-display text-3xl">{n}</div>
                <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                  {l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  id,
  type = "text",
  placeholder,
  error,
  registration,
}: {
  label: string;
  id: string;
  type?: string;
  placeholder?: string;
  error?: string;
  registration: UseFormRegisterReturn;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        {...registration}
        className={`mt-2 w-full rounded-lg border bg-background/60 px-3 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none transition-colors ${error ? "border-destructive" : "border-border/60 focus:border-primary"}`}
      />
      {error && <p className="mt-1 text-[11px] text-destructive font-mono">{error}</p>}
    </div>
  );
}
