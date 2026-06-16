import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowUpRight, Building2, Mail, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — EKBA" },
      { name: "description", content: "Talk to our team about deploying EKBA in your organization. Demos, pricing, and procurement." },
      { property: "og:title", content: "Contact — EKBA" },
      { property: "og:description", content: "Request a demo, security pack, or technical walkthrough." },
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

function Contact() {
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      role: "",
      size: undefined,
      message: "",
    },
  });

  const selectedSize = watch("size");

  const onSubmit = (data: ContactFormValues) => {
    console.log("Form submission success:", data);
    setSent(true);
    toast.success("Thanks, " + data.name + "! We'll be in touch within one business day.");
    reset();
  };

  return (
    <div>
      <Toaster />
      <section className="border-b border-border/60">
        <div className="mx-auto grid max-w-7xl gap-16 px-6 pb-20 pt-24 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Talk to us</p>
            <h1 className="mt-6 font-display text-6xl leading-[0.95]">Let's see EKBA <em className="text-primary">answer</em> a question about your documents.</h1>
            <p className="mt-8 max-w-md text-muted-foreground">
              30-minute working session. Bring a sample document and a question. Leave with a working assistant.
            </p>

            <div className="mt-12 space-y-5 border-t border-border pt-8">
              <div className="flex items-start gap-4">
                <Mail className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Email</p>
                  <p className="mt-1">hello@ekba.ai</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Building2 className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Sales</p>
                  <p className="mt-1">enterprise@ekba.ai</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <MapPin className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">HQ</p>
                  <p className="mt-1">Bengaluru · Singapore · Remote</p>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-7">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="rounded-lg border border-border bg-card p-8"
              noValidate
            >
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
                <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Company size</label>
                <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-4">
                  {(["1–50", "51–500", "501–5K", "5K+"] as const).map(s => (
                    <label key={s} className="cursor-pointer">
                      <input 
                        type="radio" 
                        value={s} 
                        {...register("size")} 
                        className="peer sr-only" 
                      />
                      <div className={`rounded-md border px-3 py-2.5 text-center text-sm transition hover:border-primary/40 duration-200 ${
                        selectedSize === s 
                          ? "border-primary bg-primary/10 text-primary font-medium" 
                          : "border-border bg-background text-foreground"
                      }`}>
                        {s}
                      </div>
                    </label>
                  ))}
                </div>
                {errors.size && (
                  <p className="mt-1 text-[11px] text-destructive font-mono">{errors.size.message}</p>
                )}
              </div>

              <div className="mt-5">
                <label htmlFor="message" className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">What would you like to discuss?</label>
                <textarea
                  id="message"
                  rows={4}
                  placeholder="A bit about the systems your team works in today, and what you'd love to fix."
                  {...register("message")}
                  className={`mt-2 w-full rounded-md border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none transition ${
                    errors.message ? "border-destructive focus:border-destructive" : "border-border focus:border-primary"
                  }`}
                />
                {errors.message && (
                  <p className="mt-1 text-[11px] text-destructive font-mono">{errors.message.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60 cursor-pointer"
              >
                {sent ? "Message sent" : <>Send message <ArrowUpRight className="h-4 w-4" /></>}
              </button>
              <p className="mt-4 text-center text-xs text-muted-foreground">
                We reply within one business day. No marketing sequences.
              </p>
            </form>
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
  registration 
}: { 
  label: string; 
  id: string; 
  type?: string; 
  placeholder?: string; 
  error?: string; 
  registration: any; 
}) {
  return (
    <div>
      <label htmlFor={id} className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        {...registration}
        className={`mt-2 w-full rounded-md border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none transition ${
          error ? "border-destructive focus:border-destructive" : "border-border focus:border-primary"
        }`}
      />
      {error && (
        <p className="mt-1 text-[11px] text-destructive font-mono">{error}</p>
      )}
    </div>
  );
}
