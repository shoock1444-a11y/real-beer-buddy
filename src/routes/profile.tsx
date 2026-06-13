import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { LogOut, Package, Bell, ChevronRight, User as UserIcon } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { formatUAH } from "@/lib/cart";
import { useEffect } from "react";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Профіль — Real Beer" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", search: { redirect: "/profile" } });
  }, [user, loading, navigate]);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: orders } = useQuery({
    queryKey: ["orders", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
  });

  if (!user) return null;

  return (
    <AppShell>
      <PageHeader title="Профіль" />
      <section className="px-4 pt-4">
        <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-card">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-amber text-primary-foreground">
            <UserIcon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{profile?.full_name ?? "Без імені"}</p>
            <p className="truncate text-xs text-muted-foreground">{profile?.email ?? user.email}</p>
            {profile?.phone && <p className="truncate text-xs text-muted-foreground">{profile.phone}</p>}
          </div>
        </div>
      </section>

      <section className="px-4 pt-4">
        <Link
          to="/loyalty"
          className="block overflow-hidden rounded-2xl bg-gradient-amber p-4 text-primary-foreground shadow-glow"
        >
          <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">Бонусний баланс</p>
          <p className="mt-1 text-3xl font-extrabold">{profile?.bonus_balance ?? 0} ₿</p>
          <p className="mt-1 text-xs opacity-80">Натисни, щоб переглянути історію →</p>
        </Link>
      </section>

      <section className="px-4 pt-6">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold">
          <Package className="h-4 w-4 text-primary" /> Історія замовлень
        </h2>
        {orders && orders.length > 0 ? (
          <ul className="space-y-2">
            {orders.map((o) => (
              <li key={o.id} className="rounded-2xl border border-border/60 bg-card p-3 shadow-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(o.created_at).toLocaleDateString("uk-UA", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                    <p className="mt-0.5 font-bold text-gradient-gold">{formatUAH(Number(o.total))}</p>
                  </div>
                  <StatusBadge status={o.status} />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {o.order_items?.length ?? 0} позицій · +{o.bonus_earned} бонусів
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-2xl border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
            Замовлень поки немає
          </p>
        )}
      </section>

      <section className="px-4 pt-6">
        <h2 className="mb-3 text-sm font-bold">Налаштування</h2>
        <ul className="space-y-2">
          <SettingsRow icon={<Bell className="h-4 w-4" />} label="Сповіщення">
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </SettingsRow>
          <button
            onClick={async () => {
              await signOut();
              navigate({ to: "/" });
            }}
            className="flex w-full items-center justify-between rounded-2xl border border-border/60 bg-card p-3.5 text-left"
          >
            <span className="flex items-center gap-3 text-sm text-destructive">
              <LogOut className="h-4 w-4" /> Вийти
            </span>
          </button>
        </ul>
      </section>
    </AppShell>
  );
}

function SettingsRow({ icon, label, children }: { icon: React.ReactNode; label: string; children?: React.ReactNode }) {
  return (
    <li className="flex items-center justify-between rounded-2xl border border-border/60 bg-card p-3.5">
      <span className="flex items-center gap-3 text-sm font-medium">
        <span className="text-primary">{icon}</span>
        {label}
      </span>
      {children}
    </li>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    pending: { label: "Очікує", cls: "bg-amber/20 text-amber" },
    confirmed: { label: "Підтверджено", cls: "bg-primary/20 text-primary" },
    ready: { label: "Готове", cls: "bg-primary/20 text-primary" },
    completed: { label: "Виконано", cls: "bg-muted text-muted-foreground" },
    cancelled: { label: "Скасовано", cls: "bg-destructive/20 text-destructive" },
  };
  const s = map[status] ?? map.pending;
  return <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${s.cls}`}>{s.label}</span>;
}
