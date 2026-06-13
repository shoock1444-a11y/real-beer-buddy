import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { formatUAH, useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Кошик — Real Beer" }] }),
  component: CartPage,
});

function CartPage() {
  const { items, total, setQuantity, remove, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const checkout = async () => {
    if (!user) {
      toast.info("Увійдіть, щоб оформити замовлення");
      navigate({ to: "/auth", search: { redirect: "/cart" } });
      return;
    }
    setSubmitting(true);
    try {
      const { data: order, error } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          total,
          bonus_earned: Math.floor(total * 0.05),
          status: "pending",
        })
        .select()
        .single();
      if (error) throw error;

      const { error: itemsErr } = await supabase.from("order_items").insert(
        items.map((i) => ({
          order_id: order.id,
          product_id: i.id,
          product_name: i.name,
          unit_price: i.price,
          quantity: i.quantity,
        })),
      );
      if (itemsErr) throw itemsErr;

      clear();
      toast.success("Замовлення оформлено! Дякуємо 🍻");
      navigate({ to: "/profile" });
    } catch (e: any) {
      toast.error(e.message ?? "Не вдалося оформити замовлення");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell>
      <PageHeader title="Кошик" subtitle={items.length ? `${items.length} позицій` : "Поки порожньо"} />

      {items.length === 0 ? (
        <div className="flex flex-col items-center px-6 pt-20 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShoppingBag className="h-8 w-8" />
          </div>
          <h2 className="mt-4 text-lg font-bold">Кошик порожній</h2>
          <p className="mt-1 text-sm text-muted-foreground">Перейдіть до каталогу та оберіть улюблене пиво.</p>
          <Link
            to="/catalog"
            className="mt-6 inline-flex rounded-full bg-gradient-amber px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow"
          >
            До каталогу
          </Link>
        </div>
      ) : (
        <>
          <ul className="space-y-3 px-4 pt-4">
            {items.map((i) => (
              <li key={i.id} className="flex gap-3 rounded-2xl border border-border/60 bg-card p-3 shadow-card">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-secondary">
                  {i.image_url ? (
                    <img src={i.image_url} alt={i.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-3xl opacity-30">🍺</div>
                  )}
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-between">
                  <div>
                    <h3 className="line-clamp-2 text-sm font-semibold">{i.name}</h3>
                    <p className="mt-0.5 text-sm font-bold text-gradient-gold">{formatUAH(i.price)}</p>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-1 rounded-full border border-border/60 p-0.5">
                      <button
                        onClick={() => setQuantity(i.id, i.quantity - 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-full"
                        aria-label="Зменшити"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-6 text-center text-sm font-semibold">{i.quantity}</span>
                      <button
                        onClick={() => setQuantity(i.id, i.quantity + 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-primary"
                        aria-label="Збільшити"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <button
                      onClick={() => remove(i.id)}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label="Видалити"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="px-4 pt-6">
            <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-card">
              <Row label="Сума товарів" value={formatUAH(total)} />
              <Row label="Самовивіз" value="Безкоштовно" />
              <Row label="Бонусів буде нараховано" value={`+${Math.floor(total * 0.05)}`} accent />
              <div className="my-3 h-px bg-border/60" />
              <Row label="До сплати" value={formatUAH(total)} big />
            </div>

            <button
              onClick={checkout}
              disabled={submitting}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-amber py-3.5 text-sm font-bold text-primary-foreground shadow-glow disabled:opacity-60"
            >
              {submitting ? "Оформлюємо…" : "Оформити замовлення"}
            </button>
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              Самовивіз з найближчого магазину Real Beer
            </p>
          </div>
        </>
      )}
    </AppShell>
  );
}

function Row({ label, value, accent, big }: { label: string; value: string; accent?: boolean; big?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className={`text-sm ${big ? "font-semibold" : "text-muted-foreground"}`}>{label}</span>
      <span className={`${big ? "text-lg font-extrabold text-gradient-gold" : accent ? "font-bold text-primary" : "font-semibold"}`}>
        {value}
      </span>
    </div>
  );
}
