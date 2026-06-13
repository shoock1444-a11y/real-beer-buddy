import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { formatUAH, useCart } from "@/lib/cart";
import { toast } from "sonner";

export type Product = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  abv: number | null;
  country: string | null;
  style: string | null;
  is_new?: boolean | null;
  is_popular?: boolean | null;
};

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card transition-all hover:border-primary/40">
      <Link
        to="/product/$id"
        params={{ id: product.id }}
        className="block aspect-square overflow-hidden bg-gradient-to-br from-muted to-secondary"
      >
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-5xl opacity-30">🍺</div>
        )}
        {product.is_new && (
          <span className="absolute left-2 top-2 rounded-full bg-gradient-amber px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
            Новинка
          </span>
        )}
      </Link>
      <div className="space-y-2 p-3">
        <Link to="/product/$id" params={{ id: product.id }} className="block">
          <h3 className="line-clamp-1 text-sm font-semibold">{product.name}</h3>
          <p className="line-clamp-1 text-xs text-muted-foreground">
            {[product.style, product.country].filter(Boolean).join(" · ")}
            {product.abv ? ` · ${product.abv}%` : ""}
          </p>
        </Link>
        <div className="flex items-center justify-between gap-2">
          <span className="text-base font-bold text-gradient-gold">{formatUAH(Number(product.price))}</span>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              add({ id: product.id, name: product.name, price: Number(product.price), image_url: product.image_url });
              toast.success(`${product.name} додано до кошика`);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-amber text-primary-foreground shadow-glow transition-transform active:scale-95"
            aria-label="Додати до кошика"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
