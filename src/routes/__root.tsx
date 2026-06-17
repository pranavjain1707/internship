import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  useLocation,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Menu, X, Sun, Moon } from "lucide-react";
import { ThemeProvider, useTheme } from "@/components/ThemeProvider";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Error 404
        </p>
        <h1 className="mt-6 font-display text-7xl text-foreground">Not found</h1>
        <p className="mt-4 text-sm text-muted-foreground">That page isn't in the knowledge base.</p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          Return home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-3xl text-foreground">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">Try again or head back home.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Try again
          </button>
          <a href="/" className="rounded-md border border-border bg-background px-4 py-2 text-sm">
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "EKABA — Knowledge Base Assistant" },
      {
        name: "description",
        content:
          "An AI-powered enterprise assistant that retrieves your organization's knowledge through natural conversation. Cut information retrieval time by 80%.",
      },
      { property: "og:title", content: "EKABA — Knowledge Base Assistant" },
      {
        property: "og:description",
        content:
          "An AI-powered enterprise assistant that retrieves your organization's knowledge through natural conversation. Cut information retrieval time by 80%.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "EKABA — Knowledge Base Assistant" },
      {
        name: "twitter:description",
        content:
          "An AI-powered enterprise assistant that retrieves your organization's knowledge through natural conversation. Cut information retrieval time by 80%.",
      },
      {
        property: "og:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/04304e73-073e-40e8-a9eb-cf526752d40a/id-preview-5b000161--b60957e6-bf1f-45e6-bfbb-160670daf5b8.lovable.app-1781519191867.png",
      },
      {
        name: "twitter:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/04304e73-073e-40e8-a9eb-cf526752d40a/id-preview-5b000161--b60957e6-bf1f-45e6-bfbb-160670daf5b8.lovable.app-1781519191867.png",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=IBM+Plex+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function SiteHeader() {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 relative">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="grid h-7 w-7 place-items-center rounded-sm bg-primary text-primary-foreground">
            <span className="font-display text-lg leading-none">E</span>
          </div>
          <span className="font-display text-xl tracking-tight">EKABA</span>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground md:inline">
            v1.0
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-8 text-sm md:flex">
          <Link
            to="/platform"
            className="text-muted-foreground transition hover:text-foreground py-1 px-2.5 rounded-md hover:bg-secondary/40"
            activeProps={{
              className: "text-primary font-medium bg-primary/10 hover:bg-primary/10",
            }}
          >
            Platform
          </Link>
          <Link
            to="/security"
            className="text-muted-foreground transition hover:text-foreground py-1 px-2.5 rounded-md hover:bg-secondary/40"
            activeProps={{
              className: "text-primary font-medium bg-primary/10 hover:bg-primary/10",
            }}
          >
            Security
          </Link>
          <Link
            to="/roadmap"
            className="text-muted-foreground transition hover:text-foreground py-1 px-2.5 rounded-md hover:bg-secondary/40"
            activeProps={{
              className: "text-primary font-medium bg-primary/10 hover:bg-primary/10",
            }}
          >
            Roadmap
          </Link>
          <Link
            to="/contact"
            className="text-muted-foreground transition hover:text-foreground py-1 px-2.5 rounded-md hover:bg-secondary/40"
            activeProps={{
              className: "text-primary font-medium bg-primary/10 hover:bg-primary/10",
            }}
          >
            Contact
          </Link>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Light/Dark Toggle */}
          <button
            onClick={toggleTheme}
            className="rounded-full p-2 hover:bg-secondary text-muted-foreground hover:text-foreground transition cursor-pointer"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {/* Action buttons - Desktop */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              to="/portal"
              className="inline-flex rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary transition"
            >
              Login
            </Link>
            <Link
              to="/contact"
              className="inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              Request demo
            </Link>
          </div>

          {/* Hamburger Icon - Mobile */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-md p-2 hover:bg-secondary text-muted-foreground hover:text-foreground transition md:hidden cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="absolute top-16 left-0 right-0 border-b border-border bg-background/95 backdrop-blur-md px-6 py-6 md:hidden flex flex-col gap-4 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <Link
              to="/platform"
              onClick={() => setMobileMenuOpen(false)}
              className="text-muted-foreground transition hover:text-foreground text-base py-1.5 rounded-md px-2 hover:bg-secondary/40"
              activeProps={{
                className:
                  "text-primary font-medium bg-primary/10 pl-2.5 border-l-2 border-primary rounded-none",
              }}
            >
              Platform
            </Link>
            <Link
              to="/security"
              onClick={() => setMobileMenuOpen(false)}
              className="text-muted-foreground transition hover:text-foreground text-base py-1.5 rounded-md px-2 hover:bg-secondary/40"
              activeProps={{
                className:
                  "text-primary font-medium bg-primary/10 pl-2.5 border-l-2 border-primary rounded-none",
              }}
            >
              Security
            </Link>
            <Link
              to="/roadmap"
              onClick={() => setMobileMenuOpen(false)}
              className="text-muted-foreground transition hover:text-foreground text-base py-1.5 rounded-md px-2 hover:bg-secondary/40"
              activeProps={{
                className:
                  "text-primary font-medium bg-primary/10 pl-2.5 border-l-2 border-primary rounded-none",
              }}
            >
              Roadmap
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="text-muted-foreground transition hover:text-foreground text-base py-1.5 rounded-md px-2 hover:bg-secondary/40"
              activeProps={{
                className:
                  "text-primary font-medium bg-primary/10 pl-2.5 border-l-2 border-primary rounded-none",
              }}
            >
              Contact
            </Link>
            <div className="border-t border-border pt-4 mt-2 flex flex-col gap-2">
              <Link
                to="/portal"
                onClick={() => setMobileMenuOpen(false)}
                className="flex w-full items-center justify-center rounded-md border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground hover:bg-secondary transition"
              >
                Login
              </Link>
              <Link
                to="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="flex w-full items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
              >
                Request demo
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="grid h-7 w-7 place-items-center rounded-sm bg-primary text-primary-foreground">
                <span className="font-display text-lg leading-none">E</span>
              </div>
              <span className="font-display text-xl">EKABA</span>
            </div>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              Enterprise Knowledge Base Assistant — retrieval-augmented intelligence for the
              documents, policies, and expertise inside your organization.
            </p>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              Product
            </p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link to="/platform" className="hover:text-primary">
                  Platform
                </Link>
              </li>
              <li>
                <Link to="/security" className="hover:text-primary">
                  Security
                </Link>
              </li>
              <li>
                <Link to="/roadmap" className="hover:text-primary">
                  Roadmap
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              Company
            </p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link to="/contact" className="hover:text-primary">
                  Contact
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-primary">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary">
                  Compliance
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-border/60 pt-6 text-xs text-muted-foreground md:flex-row md:items-center">
          <p>© 2026 EKABA. All rights reserved.</p>
          <p className="font-mono">SOC 2 · ISO 27001 · GDPR · HIPAA</p>
        </div>
      </div>
    </footer>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const location = useLocation();
  const isPortal = location.pathname.startsWith("/portal");

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <div className="flex min-h-screen flex-col">
          {!isPortal && <SiteHeader />}
          <main className="flex-1">
            <Outlet />
          </main>
          {!isPortal && <SiteFooter />}
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
