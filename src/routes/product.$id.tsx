import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ShoppingBag, Beer, Globe, Percent } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { formatUAH, useCart } from "@/lib/cart";
import { toast } from "sonner";

export const Route = createFileRoute("/product/$id")({
  component: ProductPage,
});

function ProductPage() {
  const { id } = Route.useParams();
  const router = useRouter();
  const { add } = useCart();

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*, categories(name, slug)").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <AppShell><div className="p-6 text-center text-muted-foreground">Завантаження…</div></AppShell>;
  if (!product) return <AppShell><div className="p-6 text-center text-muted-foreground">Товар не знайдено</div></AppShell>;

  return (
    <AppShell>
      <div className="relative">
        <button
          onClick={() => router.history.back()}
          className="absolute left-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-background/80 backdrop-blur"
          aria-label="Назад"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="aspect-square w-full bg-gradient-to-br from-secondary via-card to-background">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-8xl opacity-30">🍺</div>
          )}
        </div>
      </div>

      <div className="px-5 pt-5">
        {product.categories && (
          <Link
            to="/catalog/$slug"
            params={{ slug: product.categories.slug }}
            className="text-[11px] font-semibold uppercase tracking-wider text-primary"
          >
            {product.categories.name}
          </Link>
        )}
        <h1 className="mt-1 text-2xl font-extrabold leading-tight">{product.name}</h1>
        <p className="mt-1 text-2xl font-bold text-gradient-gold">{formatUAH(Number(product.price))}</p>

        <div className="mt-5 grid grid-cols-3 gap-2">
          <Stat icon={<Percent className="h-4 w-4" />} label="Міцність" value={product.abv ? `${product.abv}%` : "—"} />
          <Stat icon={<Globe className="h-4 w-4" />} label="Країна" value={product.country ?? "—"} />
          <Stat icon={<Beer className="h-4 w-4" />} label="Стиль" value={product.style ?? "—"} />
        </div>

        {product.description && (
          <div className="mt-6">
            <h2 className="mb-2 text-sm font-bold">Опис</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{product.description}</p>
          </div>
        )}

        <div className="h-6" />
      </div>

      <div className="fixed inset-x-0 bottom-16 z-30 mx-auto max-w-md px-4">
        <button
          onClick={() => {
            add({
              id: product.id,
              name: product.name,
              price: Number(product.price),
              image_url: product.image_url,
            });
            toast.success("Додано до кошика");
          }}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-amber py-3.5 text-sm font-bold text-primary-foreground shadow-glow"
        >
          <ShoppingBag className="h-4 w-4" />
          Додати до кошика
        </button>
      </div>
    </AppShell>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-3">
      <div className="text-primary">{icon}</div>
      <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="truncate text-sm font-bold">{value}</p>
    </div>
  );
}
