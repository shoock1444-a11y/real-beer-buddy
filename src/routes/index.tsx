import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MapPin, ChevronRight, Sparkles, Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { ProductCard } from "@/components/ProductCard";
import heroBeer from "@/assets/hero-beer.jpg";
import promoCraft from "@/assets/promo-craft.jpg";
import promoIpa from "@/assets/promo-ipa.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Real Beer — крафтове та розливне пиво" },
      { name: "description", content: "Каталог пива, акції та найближчі магазини Real Beer" },
    ],
  }),
  component: Home,
});

const promoImages = [promoCraft, promoIpa];

function Home() {
  const { data: popular } = useQuery({
    queryKey: ["products", "popular"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_popular", true)
        .limit(6);
      if (error) throw error;
      return data;
    },
  });

  const { data: news } = useQuery({
    queryKey: ["products", "new"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").eq("is_new", true).limit(6);
      if (error) throw error;
      return data;
    },
  });

  const { data: promotions } = useQuery({
    queryKey: ["promotions"],
    queryFn: async () => {
      const { data, error } = await supabase.from("promotions").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const { data: nearestStore } = useQuery({
    queryKey: ["store", "nearest"],
    queryFn: async () => {
      const { data, error } = await supabase.from("stores").select("*").limit(1).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  return (
    <AppShell>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <img src={heroBeer} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />
        <div className="relative px-5 pt-10 pb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Real Beer</p>
          <h1 className="mt-2 text-3xl font-extrabold leading-tight">
            Найкраще <span className="text-gradient-gold">крафтове</span> та розливне пиво
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">Замовляй онлайн, забирай у найближчому магазині.</p>
          <Link
            to="/catalog"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-amber px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow"
          >
            До каталогу <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Promotions */}
      {promotions && promotions.length > 0 && (
        <section className="px-4 pt-4">
          <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2">
            {promotions.map((p, i) => (
              <Link
                key={p.id}
                to={p.cta_link || "/catalog"}
                className="relative h-36 w-72 shrink-0 snap-start overflow-hidden rounded-2xl border border-border/60 shadow-card"
              >
                <img
                  src={promoImages[i % promoImages.length]}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-background/90 via-background/40 to-transparent" />
                <div className="relative flex h-full flex-col justify-end p-4">
                  <span className="inline-flex w-fit items-center gap-1 rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                    <Sparkles className="h-3 w-3" /> Акція
                  </span>
                  <h3 className="mt-1 text-base font-bold leading-tight">{p.title}</h3>
                  {p.subtitle && <p className="line-clamp-2 text-xs text-muted-foreground">{p.subtitle}</p>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Nearest store */}
      {nearestStore && (
        <section className="px-4 pt-5">
          <Link
            to="/stores"
            className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-card"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <MapPin className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Найближчий магазин
              </p>
              <p className="truncate text-sm font-semibold">{nearestStore.name}</p>
              <p className="truncate text-xs text-muted-foreground">{nearestStore.address}</p>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
          </Link>
        </section>
      )}

      {/* Popular */}
      <Section title="Популярні сорти" icon={<Flame className="h-4 w-4" />} link="/catalog">
        <div className="grid grid-cols-2 gap-3">
          {popular?.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </Section>

      {/* New */}
      {news && news.length > 0 && (
        <Section title="Новинки" icon={<Sparkles className="h-4 w-4" />} link="/catalog">
          <div className="grid grid-cols-2 gap-3">
            {news.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </Section>
      )}
    </AppShell>
  );
}

function Section({
  title,
  icon,
  link,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  link?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="px-4 pt-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-base font-bold">
          <span className="text-primary">{icon}</span>
          {title}
        </h2>
        {link && (
          <Link to={link} className="text-xs font-semibold text-primary">
            Усі →
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
