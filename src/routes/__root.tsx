import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { CartProvider } from "@/lib/cart";
import { AuthProvider } from "@/lib/auth";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-gradient-gold">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Сторінку не знайдено</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Здається, така сторінка не існує або була переміщена.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-gradient-amber px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow"
          >
            На головну
          </Link>
        </div>
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
        <h1 className="text-xl font-semibold">Сталася помилка</h1>
        <p className="mt-2 text-sm text-muted-foreground">Спробуйте оновити сторінку.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="rounded-full bg-gradient-amber px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow"
          >
            Спробувати знову
          </button>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#1a140d" },
      { title: "Real Beer — крафтове та розливне пиво" },
      { name: "description", content: "Мережа магазинів розливного та крафтового пива Real Beer" },
      { property: "og:title", content: "Real Beer — крафтове та розливне пиво" },
      { property: "og:description", content: "Мережа магазинів розливного та крафтового пива Real Beer" },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "Real Beer — крафтове та розливне пиво" },
      { name: "twitter:description", content: "Мережа магазинів розливного та крафтового пива Real Beer" },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/28faebbd-cf5e-4988-ab9f-00531b1894a5/id-preview-d861b1b7--b7f9f1a0-5da5-4d5d-9cf7-047a487a9c7a.lovable.app-1781358406428.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/28faebbd-cf5e-4988-ab9f-00531b1894a5/id-preview-d861b1b7--b7f9f1a0-5da5-4d5d-9cf7-047a487a9c7a.lovable.app-1781358406428.png" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/icon-192.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Manrope:wght@600;700;800&display=swap",
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
    <html lang="uk">
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
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <Outlet />
          <Toaster position="top-center" theme="dark" />
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
