import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SiteLayout } from "@/components/site/Layout";
import { useRouterState } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { applyContent } from "@/lib/cms";
import { getSiteContent } from "@/lib/cms.functions";
import { preloadSiteImages } from "@/lib/preload-images";

function NotFoundComponent() {
  return (
    <div className="band py-5">
      <div className="container text-center">
        <div className="row justify-content-center">
          <div className="col-lg-6">
            <i className="bi bi-exclamation-triangle display-1 text-primary"></i>
            <h1 className="display-1">404</h1>
            <h1 className="mb-4">Page Not Found</h1>
            <p className="mb-4">The page you're looking for doesn't exist or has been moved.</p>
            <Link className="btn btn-primary py-3 px-5" to="/">Go Back To Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
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
      { title: "QMEP Electromechanical LLC | MEP Services Dubai" },
      { name: "description", content: "HVAC, electrical, plumbing and MEP maintenance services in Dubai." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600&family=Teko:wght@400;500;600&display=swap" },
      { rel: "stylesheet", href: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" },
      { rel: "stylesheet", href: "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.4.1/font/bootstrap-icons.css" },
      { rel: "stylesheet", href: "/vendor/animate.min.css?v=2" },
      { rel: "stylesheet", href: "/vendor/bootstrap.min.css?v=2" },
      { rel: "stylesheet", href: "/vendor/template.css?v=2" },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
    ],
  }),
  loader: () => getSiteContent(),
  staleTime: 5 * 60_000,
  shouldReload: false,
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

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const content = Route.useLoaderData();
  applyContent(content);
  useEffect(() => {
    const extra = JSON.stringify(content ?? {}).match(/\/api\/public\/img\/[\w.-]+/g) ?? [];
    preloadSiteImages(Array.from(new Set(extra)));
  }, [content]);
  const router = useRouter();
  useEffect(() => {
    // Fetch every main page's code up front so menu clicks open instantly.
    const pages = ["/", "/about", "/services", "/projects", "/amc", "/industries", "/contact"] as const;
    const t = setTimeout(() => {
      pages.forEach((to) => router.preloadRoute({ to }).catch(() => {}));
    }, 300);
    return () => clearTimeout(t);
  }, [router]);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const bare = path.startsWith("/admin") || path.startsWith("/auth");

  return (
    <QueryClientProvider client={queryClient}>
      {bare ? <Outlet /> : (
        <SiteLayout>
          <Outlet />
        </SiteLayout>
      )}
      <Toaster richColors position="top-center" />
    </QueryClientProvider>
  );
}
