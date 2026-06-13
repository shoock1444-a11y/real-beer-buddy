import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, PageHeader } from "@/components/AppShell";
import { ProductCard } from "@/components/ProductCard";

export const Route = createFileRoute("/catalog")({
  head: () => ({ meta: [{ title: "Каталог — Real Beer" }] }),
  component: CatalogLayout,
});

function CatalogLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isChild = pathname !== "/catalog" && pathname !== "/catalog/";
  if (isChild) return <Outlet />;
  return <CatalogIndex />;
}

function CatalogIndex() {
  const [query, setQuery] = useState("");

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const { data: results } = useQuery({
    queryKey: ["search", query],
    enabled: query.trim().length > 1,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .ilike("name", `%${query}%`)
        .limit(20);
      if (error) throw error;
      return data;
    },
  });

  return (
    <AppShell>
      <PageHeader title="Каталог" subtitle="Усі сорти пива та закусок" />
      <div className="px-4 pt-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Пошук пива, бренду, стилю…"
            className="w-full rounded-2xl border border-border/60 bg-card py-3 pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary"
          />
        </div>
      </div>

      {query.trim().length > 1 ? (
        <section className="px-4 pt-5">
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Знайдено: {results?.length ?? 0}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {results?.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      ) : (
        <section className="px-4 pt-5">
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Категорії</h2>
          <div className="grid grid-cols-2 gap-3">
            {categories?.map((c) => (
              <Link
                key={c.id}
                to="/catalog/$slug"
                params={{ slug: c.slug }}
                className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4 shadow-card transition-all hover:border-primary/40"
              >
                <div className="text-3xl">{c.icon}</div>
                <h3 className="mt-2 text-sm font-bold">{c.name}</h3>
                {c.description && (
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{c.description}</p>
                )}
                <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-primary/10 opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            ))}
          </div>
        </section>
      )}
    </AppShell>
  );
}
