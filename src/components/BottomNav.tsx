import { Link, useRouterState } from "@tanstack/react-router";
import { Home, LayoutGrid, ShoppingBag, Gift, User } from "lucide-react";
import { useCart } from "@/lib/cart";

type Tab = { to: string; label: string; icon: typeof Home; exact?: boolean; badge?: boolean };
const tabs: Tab[] = [
  { to: "/", label: "Головна", icon: Home, exact: true },
  { to: "/catalog", label: "Каталог", icon: LayoutGrid },
  { to: "/cart", label: "Кошик", icon: ShoppingBag, badge: true },
  { to: "/loyalty", label: "Бонуси", icon: Gift },
  { to: "/profile", label: "Профіль", icon: User },
];

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { count } = useCart();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/60 bg-background/90 backdrop-blur-lg safe-bottom">
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {tabs.map((t) => {
          const active = t.exact ? pathname === t.to : pathname.startsWith(t.to);
          const Icon = t.icon;
          return (
            <li key={t.to}>
              <Link
                to={t.to}
                className={`flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors ${
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="relative">
                  <Icon className="h-5 w-5" />
                  {t.badge && count > 0 && (
                    <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
                      {count}
                    </span>
                  )}
                </span>
                <span>{t.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
