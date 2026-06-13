import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Gift, TrendingUp, TrendingDown } from "lucide-react";
import { useEffect } from "react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/loyalty")({
  head: () => ({ meta: [{ title: "Програма лояльності — Real Beer" }] }),
  component: LoyaltyPage,
});

function LoyaltyPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", search: { redirect: "/loyalty" } });
  }, [user, loading, navigate]);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      return data;
    },
  });

  const { data: tx } = useQuery({
    queryKey: ["loyalty", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("loyalty_transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      return data;
    },
  });

  if (!user) return null;

  return (
    <AppShell>
      <PageHeader title="Програма лояльності" />
      <section className="px-4 pt-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-amber p-6 text-primary-foreground shadow-glow">
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-8 -left-8 h-28 w-28 rounded-full bg-white/10" />
          <div className="relative">
            <div className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              <p className="text-xs font-bold uppercase tracking-wider opacity-90">Real Beer Club</p>
            </div>
            <p className="mt-4 text-xs opacity-80">Бонусний баланс</p>
            <p className="mt-1 text-5xl font-extrabold">{profile?.bonus_balance ?? 0}</p>
            <p className="mt-3 text-xs opacity-80">
              1 бонус = 1 ₴ · Накопичуй 5% з кожного замовлення
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 pt-6">
        <h2 className="mb-3 text-sm font-bold">Історія нарахувань</h2>
        {tx && tx.length > 0 ? (
          <ul className="space-y-2">
            {tx.map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between rounded-2xl border border-border/60 bg-card p-3.5 shadow-card"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                      t.kind === "earn" ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive"
                    }`}
                  >
                    {t.kind === "earn" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{t.description ?? (t.kind === "earn" ? "Нарахування" : "Списання")}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {new Date(t.created_at).toLocaleDateString("uk-UA")}
                    </p>
                  </div>
                </div>
                <span className={`shrink-0 text-sm font-bold ${t.kind === "earn" ? "text-primary" : "text-destructive"}`}>
                  {t.kind === "earn" ? "+" : "−"}
                  {Math.abs(t.amount)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-2xl border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
            Поки що немає операцій. Зроби перше замовлення, щоб отримати бонуси!
          </p>
        )}
      </section>
    </AppShell>
  );
}
