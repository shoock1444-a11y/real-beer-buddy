import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ArrowLeft, SlidersHorizontal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { ProductCard } from "@/components/ProductCard";

export const Route = createFileRoute("/catalog/$slug")({
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const [sort, setSort] = useState<"popular" | "price-asc" | "price-desc">("popular");

  const { data: category } = useQuery({
    queryKey: ["category", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").eq("slug", slug).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: products } = useQuery({
    queryKey: ["products", "by-category", category?.id],
    enabled: !!category?.id,
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").eq("category_id", category!.id);
      if (error) throw error;
      return data;
    },
  });

  const sorted = useMemo(() => {
    if (!products) return [];
    const arr = [...products];
    if (sort === "price-asc") arr.sort((a, b) => Number(a.price) - Number(b.price));
    if (sort === "price-desc") arr.sort((a, b) => Number(b.price) - Number(a.price));
    if (sort === "popular") arr.sort((a, b) => Number(b.is_popular) - Number(a.is_popular));
    return arr;
  }, [products, sort]);

  return (
    <AppShell>
      <header className="sticky top-0 z-30 border-b border-border/50 bg-background/80 px-4 py-3 backdrop-blur-lg">
        <div className="flex items-center gap-3">
          <Link to="/catalog" className="flex h-9 w-9 items-center justify-center rounded-full bg-card">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-bold">{category?.name ?? "Категорія"}</h1>
            <p className="text-xs text-muted-foreground">{sorted.length} товарів</p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 overflow-x-auto">
          <SlidersHorizontal className="h-4 w-4 shrink-0 text-muted-foreground" />
          {(
            [
              ["popular", "Популярні"],
              ["price-asc", "Ціна ↑"],
              ["price-desc", "Ціна ↓"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSort(key)}
              className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                sort === key
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border/60 text-muted-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 px-4 pt-4">
        {sorted.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </AppShell>
  );
}
